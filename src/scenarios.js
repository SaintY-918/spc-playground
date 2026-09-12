/*
 * scenarios.js — 蝕刻製程常見的異常型態
 *
 * 每個情境都是「把某種真實的物理原因，翻譯成資料上的樣子」。
 * 這裡只留產生資料的數學；情境的名稱與說明文字在 i18n.js 的 scen.*。
 *
 *   offset(i, j, opts)   第 i 組第 j 點的平均偏移
 *   sigmaScale(i, opts)  第 i 組的標準差倍率
 *   expect               這個情境典型會觸發的規則編號
 *   frozen               預設要不要凍結管制界限才看得清楚
 *   needsFrozen          不凍結就完全看不到效果
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SCENARIOS = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIST = [
    {
      key: 'stable',
      expect: [],
      frozen: false
    },
    {
      key: 'drift',
      expect: [2, 6, 8, 1],
      frozen: true,
      offset: function (i, j, o) { return i >= 18 ? (i - 17) * 0.25 * o.sigma : 0; }
    },
    {
      key: 'trend',
      expect: [3, 1, 2, 6],
      frozen: true,
      sigmaScale: function (i, o) { return 0.35; },
      offset: function (i, j, o) { return i >= 16 ? (i - 15) * 0.40 * o.sigma : 0; }
    },
    {
      key: 'shift',
      expect: [2, 6, 5, 1],
      frozen: true,
      offset: function (i, j, o) { return i >= 16 ? 1.3 * o.sigma : 0; }
    },
    {
      key: 'mixture',
      expect: [4, 8],
      frozen: false,
      offset: function (i, j, o) { return (i % 2 === 0 ? 1 : -1) * 1.0 * o.sigma; }
    },
    {
      key: 'spike',
      expect: [1],
      frozen: false,
      offset: function (i, j, o) { return (i === 18 && j === 0) ? 6.5 * o.sigma : 0; }
    },
    {
      key: 'variance',
      expect: [1, 2],
      frozen: true,
      sigmaScale: function (i, o) { return i >= 15 ? 2.4 : 1; }
    },
    {
      key: 'improved',
      expect: [7],
      needsFrozen: true,
      frozen: true,
      sigmaScale: function (i, o) { return i >= 15 ? 0.3 : 1; }
    }
  ];

  var BY_KEY = {};
  LIST.forEach(function (s) { BY_KEY[s.key] = s; });

  /* 型態圖鑑用的示意資料：不是情境模擬，只是把每種型態畫成最乾淨的樣子。 */
  var PATTERNS = [
    { key: 'control' },
    { key: 'shift',   off: function (i) { return i >= 15 ? 2.2 : 0; } },
    { key: 'trend',   off: function (i) { return i >= 12 ? (i - 11) * 0.32 : 0; } },
    { key: 'mixture', off: function (i) { return (i % 2 ? 1 : -1) * 1.9; } },
    { key: 'spread',  sc:  function (i) { return i >= 14 ? 2.6 : 1; } }
  ];

  return {
    LIST: LIST, PATTERNS: PATTERNS,
    get: function (k) { return BY_KEY[k] || BY_KEY.stable; }
  };
});
