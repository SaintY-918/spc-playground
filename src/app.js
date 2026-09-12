/* app.js — 把 spc / scenarios / chart 接起來，處理互動。 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var BASELINE = 15;          // 凍結界限時，拿前幾組當基準 (Phase I)
  var PROCESS_MEAN = 100;     // 假想的蝕刻速率 nm/min

  var state = {
    scenario: 'stable', n: 5, groups: 30, sigma: 1, seed: 42,
    bell: true, letters: true, frozen: false,
    enabled: SPC.RULES.map(function (r) { return r.id; }),
    spec: 4, shift: 0
  };

  /* ---------- 情境下拉選單 ---------- */
  var sel = $('scenario');
  SCENARIOS.LIST.forEach(function (s) {
    var o = document.createElement('option');
    o.value = s.key; o.textContent = s.label;
    sel.appendChild(o);
  });

  /* ---------- 規則清單 ---------- */
  function buildRules() {
    var box = $('rules');
    box.innerHTML = '';
    SPC.RULES.forEach(function (r) {
      var el = document.createElement('label');
      el.className = 'rule';
      el.dataset.id = r.id;
      el.innerHTML =
        '<input type="checkbox" ' + (state.enabled.indexOf(r.id) >= 0 ? 'checked' : '') + '>' +
        '<div><div class="nm">規則 ' + r.id + '：' + r.name + '</div>' +
        '<div class="dt">' + r.why + '</div>' +
        '<div class="etch">' + r.etch + '</div></div>' +
        '<span class="badge zero">0 點</span>';
      el.querySelector('input').addEventListener('change', function (e) {
        var i = state.enabled.indexOf(r.id);
        if (e.target.checked) { if (i < 0) state.enabled.push(r.id); }
        else if (i >= 0) state.enabled.splice(i, 1);
        render();
      });
      box.appendChild(el);
    });
  }

  /* ---------- 凍結管制界限 (Phase I → Phase II) ---------- */
  function freezeLimits(full, subgroups) {
    var k = Math.min(BASELINE, subgroups.length);
    var base = SPC.analyze(subgroups.slice(0, k));
    function merge(cur, ref) {
      return Object.assign({}, cur, {
        CL: ref.CL, UCL: ref.UCL, LCL: ref.LCL, sigma: ref.sigma,
        label: cur.label + '  ▸ 界限凍結於前 ' + k + ' 組',
        formula: ref.formula
      });
    }
    return Object.assign({}, full, {
      primary: merge(full.primary, base.primary),
      secondary: merge(full.secondary, base.secondary),
      sigmaWithin: base.sigmaWithin,
      Xbarbar: base.Xbarbar
    });
  }

  /* ---------- 型態圖鑑（靜態，只畫一次）---------- */
  var PATTERNS = [
    { t: '受控', en: 'In control',
      d: '沒有型態，點在中心線附近隨機上下。只有<b>共同原因</b>。<br><b>處置：什麼都不做。</b>去調機反而會放大變異。',
      off: function () { return 0; } },
    { t: '偏移', en: 'Shift',
      d: '某一刻<b>啪地跳一階</b>，之後停在新位置不動了。由<b>一次性事件</b>造成。<br>蝕刻：PM、換 focus ring、換鋼瓶。<br><b>查法：對 event log 的時間點。</b>',
      off: function (i) { return i >= 15 ? 2.2 : 0; } },
    { t: '趨勢／漂移', en: 'Trend / Drift',
      d: '<b>持續</b>往同一個方向走，不會停。由<b>隨時間累積</b>的因素造成。<br>蝕刻：腔壁沉積累積、化學液老化。<br><b>查法：對 RF hours、PM 週期。</b>',
      off: function (i) { return i >= 12 ? (i - 11) * 0.32 : 0; } },
    { t: '混流', en: 'Mixture',
      d: '<b>兩群不同的資料被畫在同一張圖上</b>，所以點在兩個高度之間跳，中間反而是空的。<br>蝕刻：A/B 兩個 chamber 輪流跑貨。<br><b>處置：分層，拆成兩張圖 —— 不是調機。</b>',
      off: function (i) { return (i % 2 ? 1 : -1) * 1.9; } },
    { t: '變異變大', en: 'Increased variation',
      d: '中心沒跑掉，但<b>上下擺動的幅度變大</b>了。平均值看起來還好，穩定度卻掉了。<br>蝕刻：電漿或溫度分佈不均。<br><b>只盯平均值會完全漏掉這種。</b>',
      sc: function (i) { return i >= 14 ? 2.6 : 1; } }
  ];

  function buildGallery() {
    var box = $('gallery');
    if (!box) return;
    PATTERNS.forEach(function (p, idx) {
      var rnd = SPC.makeNormal(1234 + idx * 77);
      var vals = [];
      for (var i = 0; i < 26; i++) {
        vals.push((p.off ? p.off(i) : 0) + (p.sc ? p.sc(i) : 1) * rnd());
      }
      var cell = document.createElement('div');
      cell.className = 'gal';
      cell.innerHTML = '<div class="en">' + p.en + '</div><h3>' + p.t + '</h3>' +
        '<div class="mn"></div><div class="d">' + p.d + '</div>';
      box.appendChild(cell);
      // 界限固定成 0 ± 3，代表「用受控期建立的基準」
      SPCChart.miniChart(cell.querySelector('.mn'), vals, 0, 1);
    });
  }

  /* ---------- 主繪製 ---------- */
  function render() {
    var sc = SCENARIOS.get(state.scenario);
    var subgroups = SPC.generate({
      groups: state.groups, n: state.n, mean: PROCESS_MEAN,
      sigma: state.sigma, seed: state.seed, scenario: sc
    });

    var stats = SPC.analyze(subgroups);
    if (state.frozen) stats = freezeLimits(stats, subgroups);

    var P = stats.primary, S = stats.secondary;
    var hitsP = SPC.detectViolations(P.values, P.CL, P.sigma, state.enabled);
    // R / MR 圖的分佈不對稱，區帶規則不適用，只套「超出界限」這一條。
    var hitsS = SPC.detectViolations(S.values, S.CL, S.sigma, [1]).map(function (h, i) {
      return (S.values[i] > S.UCL || S.values[i] < S.LCL) ? [1] : [];
    });

    SPCChart.controlChart($('chart1'), P, {
      violations: hitsP, showBell: state.bell, zoneLetters: state.letters, height: 310
    });
    SPCChart.controlChart($('chart2'), S, {
      violations: hitsS, showBell: false, showZones: false, height: 210
    });

    $('formula').textContent = P.formula.join('\n') + '\n\n' + S.formula.join('\n');

    // 規則命中數
    var counts = {};
    hitsP.forEach(function (h) { h.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; }); });
    document.querySelectorAll('.rule').forEach(function (el) {
      var id = Number(el.dataset.id), c = counts[id] || 0;
      var b = el.querySelector('.badge');
      b.textContent = c + ' 點';
      b.className = 'badge' + (c ? '' : ' zero');
      el.classList.toggle('hit', !!c);
    });

    // 情境說明
    var total = hitsP.reduce(function (a, h) { return a + (h.length ? 1 : 0); }, 0);
    var br = function (t) { return t.replace(/\n/g, '<br>'); };
    $('story').innerHTML =
      '<div class="k">物理原因</div><p>' + br(sc.cause) + '</p>' +
      '<div class="k">圖上看起來會怎樣</div><p>' + br(sc.story) + '</p>' +
      '<div class="k">工程師該怎麼做</div><p>' + br(sc.action) + '</p>' +
      '<div class="k">目前這批資料</div><p>' + state.groups + ' 組裡有 <b>' + total + '</b> 點被判異' +
      (sc.expect.length ? '；這個情境典型會觸發規則 <b>' + sc.expect.join('、') + '</b>。' : '。') +
      (sc.needsFrozen && !state.frozen ? ' <b style="color:var(--warn)">⚠ 要勾「凍結管制界限」才看得到效果。</b>' : '') +
      '</p>';

    // ---------- 製程能力 ----------
    var flat = [];
    subgroups.forEach(function (g) { g.forEach(function (v) { flat.push(v); }); });
    var mu = SPC.mean(flat);
    var sigmaHat = stats.sigmaWithin;
    var specCenter = mu - state.shift;
    var LSL = specCenter - state.spec, USL = specCenter + state.spec;

    SPCChart.capabilityHistogram($('hist'), flat, { mu: mu, sigma: sigmaHat, LSL: LSL, USL: USL, height: 250 });

    var cap = SPC.capability(mu, sigmaHat, LSL, USL);
    var overall = SPC.stdev(flat);
    var pp = SPC.capability(mu, overall, LSL, USL);
    var verdict = SPC.capabilityVerdict(cap.cpk);

    function stat(label, value, cls, hint) {
      return '<div class="stat ' + (cls || '') + '"><div class="v">' + value + '</div>' +
        '<div class="l">' + label + (hint ? '<br>' + hint : '') + '</div></div>';
    }
    $('capstats').innerHTML =
      stat('Cp（夠不夠瘦）', cap.cp.toFixed(2), cap.cp >= 1.33 ? 'good' : 'warn') +
      stat('Cpk（瘦 + 有沒有偏）', cap.cpk.toFixed(2), verdict.level) +
      stat('Ppk（長期，含漂移）', pp.cpk.toFixed(2), '', '用整體 s = ' + overall.toFixed(2)) +
      stat('預估不良率', Math.round(cap.ppm).toLocaleString() + ' ppm', cap.ppm > 1000 ? 'bad' : 'good') +
      stat('偏移量 k', (cap.k * 100).toFixed(0) + '%', '', '製程中心偏離規格中心的比例');

    $('verdict').innerHTML = '<b>判讀：</b>' + verdict.text +
      (cap.cp - cap.cpk > 0.15
        ? ' <span style="color:var(--warn)">Cp 比 Cpk 高出 ' + (cap.cp - cap.cpk).toFixed(2) +
          '，代表製程本身夠瘦，問題出在「偏掉了」—— 這種要做的是把中心拉回來（調 recipe／校正），不是降低變異。</span>'
        : ' <span style="color:var(--muted)">Cp 與 Cpk 接近，代表製程是置中的，要再提升就得真的降低變異。</span>');
  }

  /* ---------- 事件綁定 ---------- */
  function bindRange(id, key, fmtFn) {
    var el = $(id), out = $(id + 'v');
    el.value = state[key];
    out.textContent = fmtFn(state[key]);
    el.addEventListener('input', function () {
      state[key] = Number(el.value);
      out.textContent = fmtFn(state[key]);
      render();
    });
  }

  sel.addEventListener('change', function () {
    state.scenario = sel.value;
    var sc = SCENARIOS.get(state.scenario);
    // 每個情境都有「最適合觀察它的看法」：會漂移的製程要凍結界限才看得出來。
    state.frozen = !!sc.frozen;
    $('frozen').checked = state.frozen;
    render();
  });

  bindRange('n', 'n', function (v) { return v === 1 ? '1（改用 I-MR 圖）' : String(v); });
  bindRange('groups', 'groups', String);
  bindRange('sigma', 'sigma', function (v) { return v.toFixed(1); });
  bindRange('spec', 'spec', function (v) { return v.toFixed(1); });
  bindRange('shift', 'shift', function (v) { return v.toFixed(1); });

  $('reroll').addEventListener('click', function () {
    state.seed = (Math.random() * 1e9) | 0;
    render();
  });
  ['bell', 'letters', 'frozen'].forEach(function (k) {
    $(k).addEventListener('change', function (e) { state[k] = e.target.checked; render(); });
  });
  $('allon').addEventListener('click', function () {
    state.enabled = SPC.RULES.map(function (r) { return r.id; });
    buildRules(); render();
  });
  $('only1').addEventListener('click', function () {
    state.enabled = [1];
    buildRules(); render();
  });

  buildRules();
  buildGallery();
  render();
})();
