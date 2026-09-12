/*
 * chart.js — 純手刻 SVG 繪圖，沒有任何圖表函式庫。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SPCChart = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(v, d) { return Number(v).toFixed(d === undefined ? 3 : d); }

  /**
   * 畫一張管制圖。
   * series: { label, values, CL, UCL, LCL, sigma }
   * opts:   { violations, showBell, height, onPick, zonesLabelled }
   */
  function controlChart(container, series, opts) {
    opts = opts || {};
    var W = 980, H = opts.height || 300;
    var bellW = opts.showBell ? 132 : 0;
    var padL = 12 + bellW, padR = 92, padT = 26, padB = 34;
    var x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB;

    var v = series.values, N = v.length;
    var sg = series.sigma;
    var lo = Math.min(series.LCL, Math.min.apply(null, v), series.CL - 3.6 * sg);
    var hi = Math.max(series.UCL, Math.max.apply(null, v), series.CL + 3.6 * sg);
    var pad = (hi - lo) * 0.08 || 1;
    lo -= pad; hi += pad;

    function X(i) { return N <= 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (N - 1); }
    function Y(val) { return y1 - (val - lo) / (hi - lo) * (y1 - y0); }

    var s = [];
    s.push('<svg viewBox="0 0 ' + W + ' ' + H + '" class="cc" preserveAspectRatio="xMidYMid meet" role="img">');

    // ---- 區帶 (A/B/C zone) ----
    function band(a, b, cls) {
      var ya = Y(series.CL + b * sg), yb = Y(series.CL + a * sg);
      s.push('<rect x="' + x0 + '" y="' + ya + '" width="' + (x1 - x0) + '" height="' + Math.max(0, yb - ya) + '" class="' + cls + '"/>');
    }
    if (opts.showZones !== false) {
      band(2, 3, 'zoneA'); band(1, 2, 'zoneB'); band(0, 1, 'zoneC');
      band(-1, 0, 'zoneC'); band(-2, -1, 'zoneB'); band(-3, -2, 'zoneA');
    }

    // ---- 區帶字母標示 ----
    if (opts.zoneLetters) {
      [[2.5, 'A'], [1.5, 'B'], [0.5, 'C'], [-0.5, 'C'], [-1.5, 'B'], [-2.5, 'A']].forEach(function (p) {
        s.push('<text x="' + (x0 + 6) + '" y="' + (Y(series.CL + p[0] * sg) + 4) + '" class="zoneLetter">' + p[1] + '</text>');
      });
    }

    // ---- 界限線 ----
    function hline(val, cls, label) {
      var y = Y(val);
      s.push('<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" class="' + cls + '"/>');
      if (label) s.push('<text x="' + (x1 + 8) + '" y="' + (y + 4) + '" class="limitLabel ' + cls + '-t">' + esc(label) + '</text>');
    }
    hline(series.UCL, 'ucl', 'UCL ' + fmt(series.UCL, 2));
    hline(series.CL, 'cl', 'CL ' + fmt(series.CL, 2));
    if (series.LCL !== undefined && (series.LCL > lo)) hline(series.LCL, 'ucl', 'LCL ' + fmt(series.LCL, 2));

    // ---- 常態分佈（轉 90 度貼在左邊）----
    if (opts.showBell) {
      var bx1 = 8 + bellW - 14;       // 曲線基準線（右邊）
      var amp = bellW - 30;
      var d = [];
      for (var t = -3.8; t <= 3.8; t += 0.05) {
        var px = bx1 - Math.exp(-0.5 * t * t) * amp;
        var py = Y(series.CL + t * sg);
        d.push((d.length ? 'L' : 'M') + fmt(px, 1) + ' ' + fmt(py, 1));
      }
      s.push('<path d="' + d.join(' ') + '" class="bell"/>');
      s.push('<line x1="' + bx1 + '" y1="' + Y(series.CL + 3.8 * sg) + '" x2="' + bx1 + '" y2="' + Y(series.CL - 3.8 * sg) + '" class="bellAxis"/>');
      [[3, '+3σ'], [0, 'μ'], [-3, '−3σ']].forEach(function (p) {
        var yy = Y(series.CL + p[0] * sg);
        s.push('<line x1="' + (bx1 - 4) + '" y1="' + yy + '" x2="' + (bx1 + 4) + '" y2="' + yy + '" class="bellTick"/>');
        s.push('<text x="' + (bx1 + 7) + '" y="' + (yy + 4) + '" class="bellLabel">' + p[1] + '</text>');
      });
      s.push('<text x="12" y="' + (y0 - 10) + '" class="bellTitle">同一份資料，轉 90°</text>');
    }

    // ---- 折線 ----
    var line = v.map(function (val, i) { return (i ? 'L' : 'M') + fmt(X(i), 1) + ' ' + fmt(Y(val), 1); }).join(' ');
    s.push('<path d="' + line + '" class="trace"/>');

    // ---- 點 ----
    var hits = opts.violations || [];
    for (var i = 0; i < N; i++) {
      var bad = hits[i] && hits[i].length;
      var cx = X(i), cy = Y(v[i]);
      var tip = '#' + (i + 1) + '  值 = ' + fmt(v[i], 3) + '\nz = ' + fmt((v[i] - series.CL) / sg, 2) + 'σ' +
        (bad ? '\n違反規則 ' + hits[i].join(', ') : '');
      s.push('<circle cx="' + fmt(cx, 1) + '" cy="' + fmt(cy, 1) + '" r="' + (bad ? 6 : 4) + '" class="pt' + (bad ? ' bad' : '') +
        '" data-i="' + i + '"><title>' + esc(tip) + '</title></circle>');
      if (bad) s.push('<text x="' + fmt(cx, 1) + '" y="' + fmt(cy - 12, 1) + '" class="ruleTag">' + hits[i].join(',') + '</text>');
    }

    // ---- X 軸 ----
    s.push('<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" class="axis"/>');
    var step = Math.max(1, Math.ceil(N / 15));
    for (var q = 0; q < N; q += step) {
      s.push('<text x="' + fmt(X(q), 1) + '" y="' + (y1 + 18) + '" class="tick">' + (q + 1) + '</text>');
    }
    s.push('<text x="' + x0 + '" y="' + (y0 - 10) + '" class="chartTitle">' + esc(series.label) + '</text>');
    s.push('</svg>');

    container.innerHTML = s.join('');
    if (opts.onPick) {
      container.querySelectorAll('circle.pt').forEach(function (c) {
        c.addEventListener('click', function () { opts.onPick(Number(c.getAttribute('data-i'))); });
      });
    }
  }

  /**
   * 製程能力用的直方圖 + 常態曲線 + 規格界限。
   */
  function capabilityHistogram(container, data, opts) {
    opts = opts || {};
    var W = 980, H = opts.height || 260;
    var padL = 40, padR = 40, padT = 24, padB = 36;
    var x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB;

    var mu = opts.mu, sigma = opts.sigma, LSL = opts.LSL, USL = opts.USL;
    var lo = Math.min(LSL, mu - 4 * sigma, Math.min.apply(null, data));
    var hi = Math.max(USL, mu + 4 * sigma, Math.max.apply(null, data));
    var span = hi - lo; lo -= span * 0.06; hi += span * 0.06;

    function X(val) { return x0 + (val - lo) / (hi - lo) * (x1 - x0); }

    var BINS = 34, counts = new Array(BINS).fill(0);
    data.forEach(function (v) {
      var b = Math.floor((v - lo) / (hi - lo) * BINS);
      if (b >= 0 && b < BINS) counts[b]++;
    });
    var maxC = Math.max.apply(null, counts) || 1;
    var bw = (x1 - x0) / BINS;

    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" class="cc" preserveAspectRatio="xMidYMid meet" role="img">'];

    // 規格外的區域塗紅
    s.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + Math.max(0, X(LSL) - x0) + '" height="' + (y1 - y0) + '" class="oos"/>');
    s.push('<rect x="' + X(USL) + '" y="' + y0 + '" width="' + Math.max(0, x1 - X(USL)) + '" height="' + (y1 - y0) + '" class="oos"/>');

    counts.forEach(function (c, i) {
      if (!c) return;
      var h = (c / maxC) * (y1 - y0) * 0.86;
      s.push('<rect x="' + fmt(x0 + i * bw + 1, 1) + '" y="' + fmt(y1 - h, 1) + '" width="' + fmt(bw - 2, 1) + '" height="' + fmt(h, 1) + '" class="bar"/>');
    });

    // 理論常態曲線（用短期 σ̂）
    var dpath = [];
    for (var t = lo; t <= hi; t += (hi - lo) / 260) {
      var z = (t - mu) / sigma;
      var py = y1 - Math.exp(-0.5 * z * z) * (y1 - y0) * 0.86;
      dpath.push((dpath.length ? 'L' : 'M') + fmt(X(t), 1) + ' ' + fmt(py, 1));
    }
    s.push('<path d="' + dpath.join(' ') + '" class="bell"/>');

    function vline(val, cls, label) {
      s.push('<line x1="' + fmt(X(val), 1) + '" y1="' + y0 + '" x2="' + fmt(X(val), 1) + '" y2="' + y1 + '" class="' + cls + '"/>');
      s.push('<text x="' + fmt(X(val), 1) + '" y="' + (y0 - 8) + '" class="specLabel" text-anchor="middle">' + esc(label) + '</text>');
    }
    vline(LSL, 'spec', 'LSL ' + fmt(LSL, 2));
    vline(USL, 'spec', 'USL ' + fmt(USL, 2));
    vline(mu, 'cl', 'μ ' + fmt(mu, 2));
    vline((LSL + USL) / 2, 'target', '規格中心');

    s.push('<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" class="axis"/>');
    s.push('</svg>');
    container.innerHTML = s.join('');
  }

  /**
   * 型態圖鑑用的縮圖：只有 CL、±3σ 兩條界限和一條折線。
   */
  function miniChart(container, values, CL, sigma) {
    var W = 260, H = 96, padX = 6, padY = 10;
    var lo = CL - 4.2 * sigma, hi = CL + 4.2 * sigma;
    values.forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); });
    var sp = (hi - lo) * 0.08; lo -= sp; hi += sp;

    function X(i) { return padX + (W - 2 * padX) * i / (values.length - 1); }
    function Y(v) { return H - padY - (v - lo) / (hi - lo) * (H - 2 * padY); }

    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" class="mini" preserveAspectRatio="none" role="img">'];
    s.push('<rect x="' + padX + '" y="' + Y(CL + 3 * sigma) + '" width="' + (W - 2 * padX) +
      '" height="' + Math.max(0, Y(CL - 3 * sigma) - Y(CL + 3 * sigma)) + '" class="zoneC"/>');
    [[3, 'ucl'], [0, 'cl'], [-3, 'ucl']].forEach(function (p) {
      var y = Y(CL + p[0] * sigma);
      s.push('<line x1="' + padX + '" y1="' + y + '" x2="' + (W - padX) + '" y2="' + y + '" class="' + p[1] + '"/>');
    });
    s.push('<path d="' + values.map(function (v, i) {
      return (i ? 'L' : 'M') + fmt(X(i), 1) + ' ' + fmt(Y(v), 1);
    }).join(' ') + '" class="trace"/>');
    values.forEach(function (v, i) {
      var out = Math.abs(v - CL) > 3 * sigma;
      s.push('<circle cx="' + fmt(X(i), 1) + '" cy="' + fmt(Y(v), 1) + '" r="2.6" class="pt' + (out ? ' bad' : '') + '"/>');
    });
    s.push('</svg>');
    container.innerHTML = s.join('');
  }

  return { controlChart: controlChart, capabilityHistogram: capabilityHistogram, miniChart: miniChart };
});
