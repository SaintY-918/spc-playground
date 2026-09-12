/*
 * scenarios.js — 蝕刻製程常見的異常型態
 *
 * 每個情境都是「把某種真實的物理原因，翻譯成資料上的樣子」。
 * 面試被問到「你看到管制圖失控會怎麼辦」時，能講出型態 → 可能原因，
 * 比背出八條規則有用得多。
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
      label: '穩定製程',
      cause: '只有共同原因 (common cause)',
      story: '製程只有正常的隨機波動。點在中心線附近上下跳，沒有型態。',
      action: '什麼都不要做。對穩定製程去「調機」反而會把變異放大 —— 這叫過度調整 (over-adjustment)，是 SPC 想防的第一件事。',
      expect: [],
      frozen: false
    },
    {
      key: 'drift',
      label: 'Chamber 沉積漂移',
      cause: '蝕刻腔壁聚合物累積，蝕刻速率隨 RF hours 慢慢改變',
      story: '從第 18 組開始，平均值一路往上爬。這是典型的趨勢 (trend)：不是突然壞掉，是慢慢走掉。',
      action: '先看 RF hours / wafer count 是不是接近 PM 週期，對照 chamber season 狀況。處置通常是提前 PM 或做 chamber clean，不是改 recipe。\n注意一件事：大家直覺以為趨勢會被「規則 3（連續 6 點遞增）」抓到，但實務上雜訊一大就很難連續 6 點嚴格遞增，先響的往往是規則 2 和 6 —— 這個細節面試講出來會很加分。',
      expect: [2, 6, 8, 1],
      frozen: true,
      offset: function (i, j, o) { return i >= 18 ? (i - 17) * 0.25 * o.sigma : 0; }
    },
    {
      key: 'shift',
      label: 'PM 後階梯偏移',
      cause: '保養、換 focus ring、換氣體鋼瓶之後，製程基準整個平移',
      story: '第 16 組之後平均值整片抬高，但變異沒變大。點沒有立刻超出界限，是靠「連續 9 點同側」抓到的。',
      action: '查 PM 記錄／換件記錄與資料的時間點是否對得上。這正是為什麼管制圖一定要標註事件 (event log)。',
      expect: [2, 6, 5, 1],
      frozen: true,
      offset: function (i, j, o) { return i >= 16 ? 1.3 * o.sigma : 0; }
    },
    {
      key: 'mixture',
      label: '兩台機台混流',
      cause: 'Chamber A 與 Chamber B 交替跑貨，卻畫在同一張管制圖上',
      story: '點呈現規律的上下交替，而且中間帶 (±1σ 內) 幾乎是空的 —— 這是雙峰分佈被硬塞進一張圖的樣子。',
      action: '不是去調機，是要「分層 (stratification)」：拆成兩張圖分開管制。面試很愛問這題，因為答錯的人會去調機台。',
      expect: [4, 8],
      frozen: false,
      offset: function (i, j, o) { return (i % 2 === 0 ? 1 : -1) * 1.0 * o.sigma; }
    },
    {
      key: 'spike',
      label: '單片異常 (單點暴衝)',
      cause: '第 18 組裡有一片晶圓的 CD 量測暴衝 —— 錯放片、夾持不良、或量測機台讀錯',
      story: '重點在這裡：那一片偏了 6.5σ，但被其他 4 片平均掉之後，X̄ 圖上完全沒有被判異 —— 只有 R 圖那一點衝出界限。只盯 X̄ 圖的人會直接放行這批貨。',
      action: '這就是為什麼 X̄ 圖一定要配 R 圖看，而且要先看 R 圖。R 圖失控時 X̄ 圖的管制界限本身就不可信了。',
      expect: [1],
      frozen: false,
      offset: function (i, j, o) { return (i === 18 && j === 0) ? 6.5 * o.sigma : 0; }
    },
    {
      key: 'variance',
      label: '片內均勻度變差',
      cause: '電漿分佈不均、下電極溫度不均，導致同一批內的片間差異變大',
      story: '平均值沒跑掉，X̄ 圖看起來還好，但 R 圖整段抬高 —— 變異變大了。',
      action: '只盯平均值會完全漏掉這種問題。客戶抱怨「規格內但品質不穩」通常就是這種。',
      expect: [1, 2],
      frozen: true,
      sigmaScale: function (i, o) { return i >= 15 ? 2.4 : 1; }
    },
    {
      key: 'improved',
      label: '製程改善後（界限沒更新）',
      cause: '換了更好的氣體流量控制器，變異縮小了，但管制界限還是用舊資料算的',
      story: '打開下方「凍結管制界限」後看：後半段所有點都擠在 ±1σ 內，觸發「連續 15 點在 1σ 內」。',
      action: '這不是壞事，是好事被規則抓出來。正確處置是「重新計算管制界限」。反過來說，如果沒有改善卻出現這種型態，就要懷疑量測解析度不足或資料造假。',
      expect: [7],
      needsFrozen: true,
      frozen: true,
      sigmaScale: function (i, o) { return i >= 15 ? 0.3 : 1; }
    }
  ];

  var BY_KEY = {};
  LIST.forEach(function (s) { BY_KEY[s.key] = s; });

  return { LIST: LIST, get: function (k) { return BY_KEY[k] || BY_KEY.stable; } };
});
