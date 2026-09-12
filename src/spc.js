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
        label: 'X̄-chart（每組平均值）',
        unitLabel: '組平均',
        values: xbar, CL: CL, sigma: sigmaXbar,
        UCL: CL + 3 * sigmaXbar, LCL: CL - 3 * sigmaXbar,
        formula: [
          'CL  = X̿ = ' + CL.toFixed(3),
          'UCL = X̿ + A₂·R̄ = ' + CL.toFixed(3) + ' + ' + c.A2 + '×' + Rbar.toFixed(3) + ' = ' + (CL + 3 * sigmaXbar).toFixed(3),
          'LCL = X̿ − A₂·R̄ = ' + (CL - 3 * sigmaXbar).toFixed(3),
          'σ̂（單片）= R̄/d₂ = ' + Rbar.toFixed(3) + ' / ' + c.d2 + ' = ' + sigmaWithin.toFixed(3),
          'σ（組平均）= σ̂/√n = ' + sigmaXbar.toFixed(3)
        ]
      },
      secondary: {
        key: 'r',
        label: 'R-chart（每組全距 = 組內最大−最小）',
        unitLabel: '全距',
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
        label: 'I-chart（個別值，n=1 沒得平均）',
        unitLabel: '個別值',
        values: values, CL: CL, sigma: sigma,
        UCL: CL + 3 * sigma, LCL: CL - 3 * sigma,
        formula: [
          'CL  = X̄ = ' + CL.toFixed(3),
          'σ̂ = MR̄/d₂ = ' + MRbar.toFixed(3) + ' / 1.128 = ' + sigma.toFixed(3),
          'UCL = X̄ + 2.66·MR̄ = ' + (CL + 3 * sigma).toFixed(3),
          'LCL = X̄ − 2.66·MR̄ = ' + (CL - 3 * sigma).toFixed(3)
        ]
      },
      secondary: {
        key: 'mr',
        label: 'MR-chart（相鄰兩點的差）',
        unitLabel: '移動全距',
        values: MR, CL: MRbar, sigma: (3.267 * MRbar - MRbar) / 3,
        UCL: 3.267 * MRbar, LCL: 0,
        formula: ['CL = MR̄ = ' + MRbar.toFixed(3), 'UCL = 3.267·MR̄ = ' + (3.267 * MRbar).toFixed(3), 'LCL = 0']
      }
    };
  }

  /* ---------------------------- 判異規則 ---------------------------- */
  var RULES = [
    { id: 1, name: '1 點超出 3σ 界限',
      why: '最直接的失控訊號。常態下這種點自然發生的機率只有 0.27%，出現就當它是特殊原因。',
      etch: '蝕刻現場：RF 功率異常、流量計故障、錯放片。' },
    { id: 2, name: '連續 9 點落在中心線同一側',
      why: '製程平均已經移位，只是還沒大到超出界限。管制圖抓的是「變化」，不是只抓「超標」。',
      etch: '蝕刻現場：PM 保養後基準改變、換新鋼瓶、更換 focus ring。' },
    { id: 3, name: '連續 6 點持續上升或下降',
      why: '趨勢 (trend)。代表有個隨時間累積的因素在推著製程走。',
      etch: '蝕刻現場：chamber 壁沉積累積造成蝕刻速率漂移、化學液老化。' },
    { id: 4, name: '連續 14 點上下交替',
      why: '過於規律的鋸齒，不是隨機。通常是兩個來源交錯，或操作員過度調機 (over-adjustment)。',
      etch: '蝕刻現場：兩個 chamber／兩台機台輪流跑，卻畫在同一張圖上。' },
    { id: 5, name: '連續 3 點中有 2 點在同側 2σ 外',
      why: '比規則 1 敏感的偏移偵測，能更早發現平均跑掉。',
      etch: '蝕刻現場：溫度控制器開始不穩的早期徵兆。' },
    { id: 6, name: '連續 5 點中有 4 點在同側 1σ 外',
      why: '幅度小但持續的偏移。',
      etch: '蝕刻現場：氣體流量緩慢偏離設定值。' },
    { id: 7, name: '連續 15 點全部落在 1σ 內',
      why: '資料「太漂亮」反而有問題。常態下 15 點全落在 ±1σ 的機率只有 0.068%。',
      etch: '蝕刻現場：量測解析度不足（機台位數不夠）、管制界限算太寬、或資料被修飾過。這題面試常拿來考觀念。' },
    { id: 8, name: '連續 8 點全部在 1σ 外（不分兩側）',
      why: '中間被掏空 → 雙峰。單一穩定製程不會長這樣。',
      etch: '蝕刻現場：兩台機台／兩種產品混流，應該拆開分別管制。' }
  ];

  /**
   * 回傳長度與 values 相同的陣列，每格是該點違反的規則 id 陣列。
   * enabled：要啟用的規則 id 陣列（預設全開）。
   */
  function detectViolations(values, CL, sigma, enabled) {
    var on = {};
    (enabled || RULES.map(function (r) { return r.id; })).forEach(function (id) { on[id] = true; });

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

  function capabilityVerdict(cpk) {
    if (cpk < 1.00) return { level: 'bad',  text: '不合格（< 1.00）：規格外的品質完全靠檢驗攔，製程本身守不住。' };
    if (cpk < 1.33) return { level: 'warn', text: '勉強（1.00–1.33）：沒有緩衝，製程稍微動一下就出不良。' };
    if (cpk < 1.67) return { level: 'ok',   text: '及格（1.33–1.67）：業界最常見的量產門檻，約 63 ppm。' };
    return { level: 'good', text: '良好（≥ 1.67）：約 0.6 ppm，接近半導體關鍵層的要求。' };
  }

  return {
    CONSTANTS: CONSTANTS, RULES: RULES,
    makeNormal: makeNormal, generate: generate,
    analyze: analyze, analyzeXbarR: analyzeXbarR, analyzeIMR: analyzeIMR,
    detectViolations: detectViolations,
    capability: capability, capabilityVerdict: capabilityVerdict,
    mean: mean, stdev: stdev, range: range,
    normalCdf: normalCdf, normalPdf: normalPdf
  };
});
