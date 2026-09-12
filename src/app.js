/* app.js — 把 i18n / spc / scenarios / chart 接起來，處理互動與語言切換。 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var t = I18N.t, tbl = I18N.table;

  var BASELINE = 15;          // 凍結界限時，拿前幾組當基準 (Phase I)
  var PROCESS_MEAN = 100;     // 假想的蝕刻速率 nm/min

  var state = {
    scenario: 'stable', n: 5, groups: 30, sigma: 1, seed: 42,
    bell: true, letters: true, frozen: false,
    enabled: SPC.RULE_IDS.slice(),
    spec: 4, shift: 0
  };

  /* ================= 語言 ================= */
  function applyStaticText() {
    document.documentElement.lang = I18N.DICT[I18N.lang()]._htmlLang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    $('lang').textContent = t('ui.langLabel');
    buildScenarioSelect();
    buildRules();
    buildGallery();
  }

  $('lang').addEventListener('click', function () {
    I18N.set(I18N.other());
    applyStaticText();
    render();
  });

  /* ================= 情境下拉 ================= */
  function buildScenarioSelect() {
    var sel = $('scenario');
    sel.innerHTML = '';
    SCENARIOS.LIST.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.key;
      o.textContent = tbl('scen', s.key).label;
      sel.appendChild(o);
    });
    sel.value = state.scenario;
  }

  /* ================= 規則清單 ================= */
  function buildRules() {
    var box = $('rules');
    box.innerHTML = '';
    SPC.RULE_IDS.forEach(function (id) {
      var r = tbl('rules', id);
      var el = document.createElement('label');
      el.className = 'rule';
      el.dataset.id = id;
      el.innerHTML =
        '<input type="checkbox" ' + (state.enabled.indexOf(id) >= 0 ? 'checked' : '') + '>' +
        '<div><div class="nm">' + t('ui.rules.ruleN', { n: id }) + ' — ' + r.name + '</div>' +
        '<div class="dt">' + r.why + '</div>' +
        '<div class="etch">' + r.etch + '</div></div>' +
        '<span class="badge zero">' + t('ui.rules.points', { n: 0 }) + '</span>';
      el.querySelector('input').addEventListener('change', function (e) {
        var i = state.enabled.indexOf(id);
        if (e.target.checked) { if (i < 0) state.enabled.push(id); }
        else if (i >= 0) state.enabled.splice(i, 1);
        render();
      });
      box.appendChild(el);
    });
  }

  /* ================= 型態圖鑑（靜態）================= */
  function buildGallery() {
    var box = $('gallery');
    box.innerHTML = '';
    SCENARIOS.PATTERNS.forEach(function (p, idx) {
      var txt = tbl('pat', p.key);
      var rnd = SPC.makeNormal(1234 + idx * 77);
      var vals = [];
      for (var i = 0; i < 26; i++) {
        vals.push((p.off ? p.off(i) : 0) + (p.sc ? p.sc(i) : 1) * rnd());
      }
      var cell = document.createElement('div');
      cell.className = 'gal';
      cell.innerHTML = '<div class="en">' + txt.en + '</div><h3>' + txt.t + '</h3>' +
        '<div class="mn"></div><div class="d">' + txt.d + '</div>';
      box.appendChild(cell);
      // 界限固定成 0 ± 3σ，代表「用受控期建立好的基準」
      SPCChart.miniChart(cell.querySelector('.mn'), vals, 0, 1);
    });
  }

  /* ================= 凍結界限 (Phase I → Phase II) ================= */
  function freezeLimits(full, subgroups) {
    var k = Math.min(BASELINE, subgroups.length);
    var base = SPC.analyze(subgroups.slice(0, k));
    function merge(cur, ref) {
      return Object.assign({}, cur, {
        CL: ref.CL, UCL: ref.UCL, LCL: ref.LCL, sigma: ref.sigma, formula: ref.formula,
        frozenNote: t('ui.frozenSuffix', { n: k })
      });
    }
    return Object.assign({}, full, {
      primary: merge(full.primary, base.primary),
      secondary: merge(full.secondary, base.secondary),
      sigmaWithin: base.sigmaWithin,
      Xbarbar: base.Xbarbar
    });
  }

  function seriesLabel(s) {
    return t('ui.chart.' + s.key) + (s.frozenNote ? '  ▸ ' + s.frozenNote : '');
  }

  /* ================= 主繪製 ================= */
  function render() {
    var sc = SCENARIOS.get(state.scenario);
    var txt = tbl('scen', state.scenario);

    var subgroups = SPC.generate({
      groups: state.groups, n: state.n, mean: PROCESS_MEAN,
      sigma: state.sigma, seed: state.seed, scenario: sc
    });

    var stats = SPC.analyze(subgroups);
    if (state.frozen) stats = freezeLimits(stats, subgroups);

    var P = stats.primary, S = stats.secondary;
    var hitsP = SPC.detectViolations(P.values, P.CL, P.sigma, state.enabled);
    // R / MR 圖的分佈不對稱，區帶規則不適用，只套「超出界限」這一條。
    var hitsS = S.values.map(function (v) {
      return (v > S.UCL || v < S.LCL) ? [1] : [];
    });

    SPCChart.controlChart($('chart1'), Object.assign({}, P, { label: seriesLabel(P) }),
      { violations: hitsP, showBell: state.bell, zoneLetters: state.letters, height: 310 });
    SPCChart.controlChart($('chart2'), Object.assign({}, S, { label: seriesLabel(S) }),
      { violations: hitsS, showBell: false, showZones: false, height: 210 });

    $('formula').textContent = P.formula.join('\n') + '\n\n' + S.formula.join('\n');

    /* 規則命中數 */
    var counts = {};
    hitsP.forEach(function (h) { h.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; }); });
    document.querySelectorAll('.rule').forEach(function (el) {
      var c = counts[Number(el.dataset.id)] || 0;
      var b = el.querySelector('.badge');
      b.textContent = t('ui.rules.points', { n: c });
      b.className = 'badge' + (c ? '' : ' zero');
      el.classList.toggle('hit', !!c);
    });

    /* 情境說明 */
    var total = hitsP.reduce(function (a, h) { return a + (h.length ? 1 : 0); }, 0);
    var br = function (x) { return x.replace(/\n/g, '<br>'); };
    $('story').innerHTML =
      '<div class="k">' + t('ui.story.cause') + '</div><p>' + br(txt.cause) + '</p>' +
      '<div class="k">' + t('ui.story.shape') + '</div><p>' + br(txt.story) + '</p>' +
      '<div class="k">' + t('ui.story.action') + '</div><p>' + br(txt.action) + '</p>' +
      '<div class="k">' + t('ui.story.now') + '</div><p>' +
        t('ui.story.summary', { groups: state.groups, n: total }) +
        (sc.expect.length ? t('ui.story.expect', { rules: sc.expect.join(', ') }) : t('ui.story.expectNone')) +
        (sc.needsFrozen && !state.frozen ? t('ui.story.needFreeze') : '') +
      '</p>';

    /* 製程能力 */
    var flat = [];
    subgroups.forEach(function (g) { g.forEach(function (v) { flat.push(v); }); });
    var mu = SPC.mean(flat);
    var sigmaHat = stats.sigmaWithin;
    var specCentre = mu - state.shift;
    var LSL = specCentre - state.spec, USL = specCentre + state.spec;

    SPCChart.capabilityHistogram($('hist'), flat,
      { mu: mu, sigma: sigmaHat, LSL: LSL, USL: USL, height: 250 });

    var cap = SPC.capability(mu, sigmaHat, LSL, USL);
    var overall = SPC.stdev(flat);
    var pp = SPC.capability(mu, overall, LSL, USL);
    var level = SPC.capabilityVerdict(cap.cpk);

    function stat(label, value, cls, hint) {
      return '<div class="stat ' + (cls || '') + '"><div class="v">' + value + '</div>' +
        '<div class="l">' + label + (hint ? '<br>' + hint : '') + '</div></div>';
    }
    $('capstats').innerHTML =
      stat(t('ui.cap.cp'), cap.cp.toFixed(2), cap.cp >= 1.33 ? 'good' : 'warn') +
      stat(t('ui.cap.cpk'), cap.cpk.toFixed(2), level) +
      stat(t('ui.cap.ppk'), pp.cpk.toFixed(2), '', t('ui.cap.ppkHint', { s: overall.toFixed(2) })) +
      stat(t('ui.cap.ppm'), Math.round(cap.ppm).toLocaleString() + ' ppm', cap.ppm > 1000 ? 'bad' : 'good') +
      stat(t('ui.cap.k'), (cap.k * 100).toFixed(0) + '%', '', t('ui.cap.kHint'));

    $('verdict').innerHTML = '<b>' + t('ui.cap.verdict') + '</b>' + t('ui.verdict.' + level) +
      (cap.cp - cap.cpk > 0.15
        ? ' <span class="warn">' + t('ui.cap.offCentre', { d: (cap.cp - cap.cpk).toFixed(2) }) + '</span>'
        : ' <span class="muted">' + t('ui.cap.centred') + '</span>');
  }

  /* ================= 事件 ================= */
  function bindRange(id, key, fmtFn) {
    var el = $(id), out = $(id + 'v');
    el.value = state[key];
    el.addEventListener('input', function () {
      state[key] = Number(el.value);
      out.textContent = fmtFn(state[key]);
      render();
    });
    el._sync = function () { out.textContent = fmtFn(state[key]); };
  }

  bindRange('n', 'n', function (v) { return v === 1 ? t('ui.nOne') : String(v); });
  bindRange('groups', 'groups', String);
  bindRange('sigma', 'sigma', function (v) { return v.toFixed(1); });
  bindRange('spec', 'spec', function (v) { return v.toFixed(1); });
  bindRange('shift', 'shift', function (v) { return v.toFixed(1); });

  function syncRanges() {
    ['n', 'groups', 'sigma', 'spec', 'shift'].forEach(function (id) { $(id)._sync(); });
  }

  $('scenario').addEventListener('change', function () {
    state.scenario = $('scenario').value;
    // 每個情境都有「最適合觀察它的看法」：會漂移的製程要凍結界限才看得出來。
    state.frozen = !!SCENARIOS.get(state.scenario).frozen;
    $('frozen').checked = state.frozen;
    render();
  });

  $('reroll').addEventListener('click', function () {
    state.seed = (Math.random() * 1e9) | 0;
    render();
  });
  ['bell', 'letters', 'frozen'].forEach(function (k) {
    $(k).addEventListener('change', function (e) { state[k] = e.target.checked; render(); });
  });
  $('allon').addEventListener('click', function () {
    state.enabled = SPC.RULE_IDS.slice();
    buildRules(); render();
  });
  $('only1').addEventListener('click', function () {
    state.enabled = [1];
    buildRules(); render();
  });

  /* ================= 啟動 ================= */
  I18N.set(I18N.detect());
  applyStaticText();
  syncRanges();
  render();

  // 語言切換後，滑桿旁的數值文字也要跟著翻譯（例如 n = 1 的註記）
  $('lang').addEventListener('click', syncRanges);
})();
