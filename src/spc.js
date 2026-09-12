/*
 * spc.js — SPC 統計核心
 * 沒有任何外部相依，瀏覽器與 Node 都能跑。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SPC = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 管制圖係數表
   * 這張表是 SPC 最「反直覺」的地方：管制界限不是拿全部資料的標準差算的，
   * 而是用「組內變異」(R̄) 去估計短期的 σ。A₂ = 3 / (d2·√n)，所以
   * X̿ ± A₂·R̄ 其實就是 X̿ ± 3·σ̂/√n —— 還是 3 個標準差，只是換個算法。
   * ------------------------------------------------------------------ */
  var CONSTANTS = {
    2:  { A2: 1.880, D3: 0.000, D4: 3.267, d2: 1.128 },
    3:  { A2: 1.023, D3: 0.000, D4: 2.574, d2: 1.693 },
    4:  { A2: 0.729, D3: 0.000, D4: 2.282, d2: 2.059 },
    5:  { A2: 0.577, D3: 0.000, D4: 2.114, d2: 2.326 },
    6:  { A2: 0.483, D3: 0.000, D4: 2.004, d2: 2.534 },
    7:  { A2: 0.419, D3: 0.076, D4: 1.924, d2: 2.704 },
    8:  { A2: 0.373, D3: 0.136, D4: 1.864, d2: 2.847 },
    9:  { A2: 0.337, D3: 0.184, D4: 1.816, d2: 2.970 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777, d2: 3.078 }
  };

  /* ---------------------------- 亂數 ---------------------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** 固定種子的常態亂數產生器（Box–Muller），讓每次重現同一組資料。 */
  function makeNormal(seed) {
    var u = mulberry32(seed >>> 0), spare = null;
    return function () {
      if (spare !== null) { var s = spare; spare = null; return s; }
      var u1 = 0, u2 = 0;
      while (u1 === 0) u1 = u();
      u2 = u();
      var mag = Math.sqrt(-2 * Math.log(u1));
      spare = mag * Math.sin(2 * Math.PI * u2);
      return mag * Math.cos(2 * Math.PI * u2);
    };
  }

  /* ---------------------------- 小工具 ---------------------------- */
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function stdev(a) {
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / (a.length - 1));
  }
  function range(a) { return Math.max.apply(null, a) - Math.min.apply(null, a); }

  /** 標準常態累積分佈（Abramowitz & Stegun 7.1.26 的 erf 近似）。 */
  function normalCdf(z) {
    var sign = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }
  function normalPdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); }

  /* ---------------------------- 資料產生 ---------------------------- */
  /**
   * 產生分組樣本。scenario 可提供：
   *   offset(i, j, opts)      → 第 i 組第 j 點的平均偏移
   *   sigmaScale(i, opts)     → 第 i 組的標準差倍率
   *   transform(v, i, j, opts)→ 對產生出的值再做處理（例如量測解析度量化）
   */
  function generate(opts) {
    var o = Object.assign({ groups: 30, n: 5, mean: 100, sigma: 1, seed: 42, scenario: null }, opts || {});
    var normal = makeNormal(o.seed);
    var sc = o.scenario;
    var out = [];
    for (var i = 0; i < o.groups; i++) {
      var sScale = sc && sc.sigmaScale ? sc.sigmaScale(i, o) : 1;
      var grp = [];
      for (var j = 0; j < o.n; j++) {
        var off = sc && sc.offset ? sc.offset(i, j, o) : 0;
        var v = o.mean + off + o.sigma * sScale * normal();
        if (sc && sc.transform) v = sc.transform(v, i, j, o);
        grp.push(v);
      }
      out.push(grp);
    }
    return out;
  }

  /* ---------------------------- 管制圖計算 ---------------------------- */
  function analyze(subgroups) {
    var n = subgroups[0].length;
    return n === 1
      ? analyzeIMR(subgroups.map(function (g) { return g[0]; }))
      : analyzeXbarR(subgroups, n);
  }

  function analyzeXbarR(subgroups, n) {
    var c = CONSTANTS[Math.min(Math.max(n, 2), 10)];
    var xbar = subgroups.map(mean);
    var R = subgroups.map(range);
    var CL = mean(xbar), Rbar = mean(R);
    var sigmaXbar = c.A2 * Rbar / 3;     // = σ̂ / √n
    var sigmaWithin = Rbar / c.d2;       // 單片（個別值）的短期標準差

    return {
      type: 'xbar-r', n: n, c: c,
      Xbarbar: CL, Rbar: Rbar, sigmaWithin: sigmaWithin,
      primary: {
        key: 'xbar',
        values: xbar, CL: CL, sigma: sigmaXbar,
        UCL: CL + 3 * sigmaXbar, LCL: CL - 3 * sigmaXbar,
        formula: [
          'CL  = X̿ = ' + CL.toFixed(3),
          'UCL = X̿ + A₂·R̄ = ' + CL.toFixed(3) + ' + ' + c.A2 + '×' + Rbar.toFixed(3) + ' = ' + (CL + 3 * sigmaXbar).toFixed(3),
          'LCL = X̿ − A₂·R̄ = ' + (CL - 3 * sigmaXbar).toFixed(3),
          'sigma_within = R̄/d₂ = ' + Rbar.toFixed(3) + ' / ' + c.d2 + ' = ' + sigmaWithin.toFixed(3),
          'sigma_Xbar   = sigma_within/√n = ' + sigmaXbar.toFixed(3)
        ]
      },
      secondary: {
        key: 'r',
        values: R, CL: Rbar, sigma: (c.D4 * Rbar - Rbar) / 3,
        UCL: c.D4 * Rbar, LCL: c.D3 * Rbar,
        formula: [
          'CL  = R̄ = ' + Rbar.toFixed(3),
          'UCL = D₄·R̄ = ' + c.D4 + ' × ' + Rbar.toFixed(3) + ' = ' + (c.D4 * Rbar).toFixed(3),
          'LCL = D₃·R̄ = ' + (c.D3 * Rbar).toFixed(3)
        ]
      }
    };
  }

  function analyzeIMR(values) {
    var MR = [];
    for (var i = 1; i < values.length; i++) MR.push(Math.abs(values[i] - values[i - 1]));
    var CL = mean(values), MRbar = mean(MR);
    var sigma = MRbar / 1.128;
    return {
      type: 'i-mr', n: 1, c: { A2: 2.660, D3: 0, D4: 3.267, d2: 1.128 },
      Xbarbar: CL, Rbar: MRbar, sigmaWithin: sigma,
      primary: {
        key: 'i',
        values: values, CL: CL, sigma: sigma,
        UCL: CL + 3 * sigma, LCL: CL - 3 * sigma,
        formula: [
          'CL  = X̄ = ' + CL.toFixed(3),
          'sigma = MR̄/d₂ = ' + MRbar.toFixed(3) + ' / 1.128 = ' + sigma.toFixed(3),
          'UCL = X̄ + 2.66·MR̄ = ' + (CL + 3 * sigma).toFixed(3),
          'LCL = X̄ − 2.66·MR̄ = ' + (CL - 3 * sigma).toFixed(3)
        ]
      },
      secondary: {
        key: 'mr',
        values: MR, CL: MRbar, sigma: (3.267 * MRbar - MRbar) / 3,
        UCL: 3.267 * MRbar, LCL: 0,
        formula: ['CL = MR̄ = ' + MRbar.toFixed(3), 'UCL = 3.267·MR̄ = ' + (3.267 * MRbar).toFixed(3), 'LCL = 0']
      }
    };
  }

  /* ---------------------------- 判異規則 ---------------------------- */
  /* 規則的名稱與說明文字放在 i18n.js，這裡只有編號與偵測邏輯。 */
  var RULE_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

  /**
   * 回傳長度與 values 相同的陣列，每格是該點違反的規則 id 陣列。
   * enabled：要啟用的規則 id 陣列（預設全開）。
   */
  function detectViolations(values, CL, sigma, enabled) {
    var on = {};
    (enabled || RULE_IDS).forEach(function (id) { on[id] = true; });

    var N = values.length;
    var hits = [];
    for (var i = 0; i < N; i++) hits.push([]);
    if (!sigma || !isFinite(sigma) || sigma <= 0) return hits;

    var z = values.map(function (v) { return (v - CL) / sigma; });
    function mark(idx, id) { if (hits[idx].indexOf(id) === -1) hits[idx].push(id); }

    var k;

    // 規則 1：超出 3σ
    if (on[1]) for (var a = 0; a < N; a++) if (Math.abs(z[a]) > 3) mark(a, 1);

    // 規則 2：連續 9 點同側
    if (on[2]) for (var b = 0; b + 9 <= N; b++) {
      var pos = 0, neg = 0;
      for (k = b; k < b + 9; k++) { if (z[k] > 0) pos++; else if (z[k] < 0) neg++; }
      if (pos === 9 || neg === 9) for (k = b; k < b + 9; k++) mark(k, 2);
    }

    // 規則 3：連續 6 點單調
    if (on[3]) for (var c3 = 0; c3 + 6 <= N; c3++) {
      var up = true, dn = true;
      for (k = c3; k < c3 + 5; k++) {
        if (!(values[k + 1] > values[k])) up = false;
        if (!(values[k + 1] < values[k])) dn = false;
      }
      if (up || dn) for (k = c3; k < c3 + 6; k++) mark(k, 3);
    }

    // 規則 4：連續 14 點交替
    if (on[4]) for (var d = 0; d + 14 <= N; d++) {
      var ok = true;
      for (k = d; k < d + 13; k++) {
        var diff = values[k + 1] - values[k];
        if (diff === 0) { ok = false; break; }
        if (k > d && diff * (values[k] - values[k - 1]) > 0) { ok = false; break; }
      }
      if (ok) for (k = d; k < d + 14; k++) mark(k, 4);
    }

    // 規則 5：3 點中 2 點在同側 2σ 外
    if (on[5]) for (var e = 0; e + 3 <= N; e++) {
      var hi = [], lo = [];
      for (k = e; k < e + 3; k++) { if (z[k] > 2) hi.push(k); if (z[k] < -2) lo.push(k); }
      if (hi.length >= 2) hi.forEach(function (x) { mark(x, 5); });
      if (lo.length >= 2) lo.forEach(function (x) { mark(x, 5); });
    }

    // 規則 6：5 點中 4 點在同側 1σ 外
    if (on[6]) for (var f = 0; f + 5 <= N; f++) {
      var hi6 = [], lo6 = [];
      for (k = f; k < f + 5; k++) { if (z[k] > 1) hi6.push(k); if (z[k] < -1) lo6.push(k); }
      if (hi6.length >= 4) hi6.forEach(function (x) { mark(x, 6); });
      if (lo6.length >= 4) lo6.forEach(function (x) { mark(x, 6); });
    }

    // 規則 7：連續 15 點都在 1σ 內
    if (on[7]) for (var g = 0; g + 15 <= N; g++) {
      var all7 = true;
      for (k = g; k < g + 15; k++) if (Math.abs(z[k]) >= 1) { all7 = false; break; }
      if (all7) for (k = g; k < g + 15; k++) mark(k, 7);
    }

    // 規則 8：連續 8 點都在 1σ 外
    if (on[8]) for (var h = 0; h + 8 <= N; h++) {
      var all8 = true;
      for (k = h; k < h + 8; k++) if (Math.abs(z[k]) <= 1) { all8 = false; break; }
      if (all8) for (k = h; k < h + 8; k++) mark(k, 8);
    }

    return hits;
  }

  /* ---------------------------- 製程能力 ---------------------------- */
  /**
   * Cp  = 規格寬度 / 製程寬度   → 「夠不夠瘦」，完全不管有沒有偏
   * Cpk = 離最近那條規格幾個 3σ → 「夠不夠瘦，而且有沒有偏」
   * sigma 用短期（組內）σ̂ 算出來的是 Cp/Cpk；改用整體樣本標準差算的是 Pp/Ppk。
   */
  function capability(mu, sigma, LSL, USL) {
    if (!sigma || sigma <= 0) return null;
    var cp = (USL - LSL) / (6 * sigma);
    var cpu = (USL - mu) / (3 * sigma);
    var cpl = (mu - LSL) / (3 * sigma);
    var cpk = Math.min(cpu, cpl);
    var ppm = (normalCdf((LSL - mu) / sigma) + (1 - normalCdf((USL - mu) / sigma))) * 1e6;
    return { cp: cp, cpu: cpu, cpl: cpl, cpk: cpk, ppm: ppm, k: Math.abs(mu - (USL + LSL) / 2) / ((USL - LSL) / 2) };
  }

  /** 只回傳等級；對應的說明文字在 i18n.js 的 ui.verdict.* */
  function capabilityVerdict(cpk) {
    if (cpk < 1.00) return 'bad';
    if (cpk < 1.33) return 'warn';
    if (cpk < 1.67) return 'ok';
    return 'good';
  }

  return {
    CONSTANTS: CONSTANTS, RULE_IDS: RULE_IDS,
    makeNormal: makeNormal, generate: generate,
    analyze: analyze, analyzeXbarR: analyzeXbarR, analyzeIMR: analyzeIMR,
    detectViolations: detectViolations,
    capability: capability, capabilityVerdict: capabilityVerdict,
    mean: mean, stdev: stdev, range: range,
    normalCdf: normalCdf, normalPdf: normalPdf
  };
});
