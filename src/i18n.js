/*
 * i18n.js — 所有給人看的文字都放在這裡。
 * spc.js / scenarios.js 只留數學與結構，不含任何語言相關的字串。
 *
 * 新增語言：複製 zh 整個物件，翻譯字串，加進 DICT 即可。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.I18N = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var zh = {
    _name: '中文',
    _htmlLang: 'zh-Hant',

    'ui.title': 'SPC Playground',
    'ui.tagline': '互動式統計製程管制 (SPC) 教學頁面，以半導體蝕刻製程為例。所有圖表都是即時計算的：改變參數，管制圖跟著變。',
    'ui.aiNote': '本專案的程式與說明文字由 AI（Claude）協助產生，作者校對過主要內容並附上可執行的驗證測試。若發現錯誤或有更好的說法，歡迎開 issue 指正。',
    'ui.langLabel': 'English',

    'ui.scenario': '製程情境',
    'ui.n': '每組樣本數 n（一次量幾片）',
    'ui.nOne': '1（改用 I-MR 圖）',
    'ui.groups': '組數（時間上取幾次樣）',
    'ui.sigma': '製程標準差 σ',
    'ui.sigmaUnit': 'nm/min',
    'ui.reroll': '換一批資料',
    'ui.showBell': '顯示左側常態分佈',
    'ui.showLetters': '顯示 A/B/C 區帶字母',
    'ui.freeze': '凍結管制界限（用前 15 組當基準）',
    'ui.freezeHint': '工廠的實際做法：Phase I 先建立界限，Phase II 拿它監控後續生產',
    'ui.frozenSuffix': '界限凍結於前 {n} 組',

    'ui.legend.ucl': '紅實線 = UCL / LCL（μ ± 3σ）',
    'ui.legend.cl': '綠虛線 = CL 中心線（平均值）',
    'ui.legend.zone': '灰色橫帶 = A/B/C 區，每帶 1σ 寬',
    'ui.legend.dot': '黑點 = 正常',
    'ui.legend.bad': '紅點 = 被判異，上方數字是違反的規則編號',
    'ui.legend.bell': '左側曲線 = 同一份資料的常態分佈',
    'ui.legend.hover': '滑鼠停在點上可看該點的數值與 z 值',

    'ui.chart.xbar': 'X̄-chart（每組平均值）',
    'ui.chart.r': 'R-chart（每組全距 = 組內最大 − 最小）',
    'ui.chart.i': 'I-chart（個別值，n=1 沒得平均）',
    'ui.chart.mr': 'MR-chart（相鄰兩點的差）',
    'ui.chart.note': '<b>上圖 X̄</b> = 每組的平均值，看「製程中心有沒有跑掉」。<b>下圖 R</b> = 每組的最大值減最小值，看「同一組內的變異有沒有變大」。兩張圖看的是不同的事，缺一不可。',

    'ui.formulaSummary': '管制界限是怎麼算出來的？（展開看實際數字）',
    'ui.formulaBody': '現場不用整體標準差，而是用「組內全距 R̄」去估 σ。因為組內變異是製程的短期雜訊（純的共同原因），把它當尺才量得出組間的偏移。<b>用整體 σ 算界限是最常見的錯誤</b>：製程一偏移，整體 σ 跟著變大，界限也跟著撐開，結果永遠抓不到失控。',

    'ui.rules.allOn': '全部啟用',
    'ui.rules.only1': '只留規則 1',
    'ui.rules.ruleN': '規則 {n}',
    'ui.rules.points': '{n} 點',

    'ui.story.cause': '物理原因',
    'ui.story.shape': '圖上看起來會怎樣',
    'ui.story.action': '該怎麼處理',
    'ui.story.now': '目前這批資料',
    'ui.story.summary': '{groups} 組裡有 <b>{n}</b> 點被判異',
    'ui.story.expect': '；這個情境典型會觸發規則 <b>{rules}</b>。',
    'ui.story.expectNone': '。',
    'ui.story.needFreeze': ' <b class="warn">需要勾選「凍結管制界限」才看得到效果。</b>',

    'ui.cap.spec': '規格半寬（USL − LSL 的一半）',
    'ui.cap.shift': '製程中心相對規格中心偏移',
    'ui.cap.cp': 'Cp（夠不夠瘦）',
    'ui.cap.cpk': 'Cpk（瘦 + 有沒有偏）',
    'ui.cap.ppk': 'Ppk（長期，含漂移）',
    'ui.cap.ppkHint': '用整體 s = {s}',
    'ui.cap.ppm': '預估不良率',
    'ui.cap.k': '偏移量 k',
    'ui.cap.kHint': '製程中心偏離規格中心的比例',
    'ui.cap.verdict': '判讀：',
    'ui.cap.offCentre': 'Cp 比 Cpk 高出 {d}，代表製程本身夠瘦，問題出在「偏掉了」—— 這種要做的是把中心拉回來（調 recipe／校正），不是降低變異。',
    'ui.cap.centred': 'Cp 與 Cpk 接近，代表製程是置中的，要再提升就得真的降低變異。',
    'ui.verdict.bad': '不合格（< 1.00）：規格外的品質完全靠檢驗攔，製程本身守不住。',
    'ui.verdict.warn': '勉強（1.00–1.33）：沒有緩衝，製程稍微動一下就出不良。',
    'ui.verdict.ok': '及格（1.33–1.67）：業界最常見的量產門檻，約 63 ppm。',
    'ui.verdict.good': '良好（≥ 1.67）：約 0.6 ppm，接近半導體關鍵層的要求。',

    'ui.footer': '所有統計與繪圖皆為手刻，無外部相依 · MIT License',

    /* ---------------- 章節 ---------------- */
    's1.title': 'SPC 在解決什麼問題',
    's1.body': [
      '<p class="sub">在講任何公式之前先講目的。整個 SPC 只為了回答一個問題：<b>這次的波動，到底該不該動手？</b></p>',
      '<div class="lead">',
      '<p><b>把「共同原因」和「特殊原因」分開。</b>共同原因是製程本來就存在的隨機雜訊；特殊原因是有具體來源的異常。分不清楚會犯兩種錯，而且<b>兩種都會讓製程變差</b>：</p>',
      '<p>把雜訊當異常 → 去調機 → 這叫<b>過度調整 (over-adjustment)</b>，變異反而被放大。<br>把異常當雜訊 → 放著不管 → 不良品流出去。</p>',
      '<p class="last">所以最重要的一句是：<b>管制圖抓的是「變化」，不是「超標」。</b>全部落在規格內、卻連續 20 點都在中心線上方 —— 那是失控。全部落在管制界限內、但客戶規格很緊 —— 那是能力不足。兩件事要分開看。</p>',
      '</div>',
      '<h3 class="sh">管制圖就是轉了 90 度的常態分佈</h3>',
      '<p>常態分佈與 3 個標準差是 SPC 唯一用到的統計前提。把鐘形曲線轉 90 度貼在時間軸左邊，再依時間順序一點一點畫上去，就是管制圖。</p>',
      '<div class="lead">',
      '<p><b>UCL / LCL 就是 μ ± 3σ。</b>沒別的了。Upper / Lower Control Limit ＝ 上／下管制界限。點落在裡面 = 只有隨機波動；點落在外面 = 自然發生的機率只有 0.27%，與其相信「這麼剛好」，不如相信「製程真的變了」。</p>',
      '<p class="last">下一區左邊那條鐘形曲線和右邊那串點是<b>同一份資料</b>的兩種畫法。把 3σ 的高度往右拉成一整條水平線，就是 UCL。</p>',
      '</div>'
    ].join(''),

    's2.title': '製程模擬器',
    's2.sub': '選一個情境，再拉滑桿看每個參數如何改變管制圖。所有數值都是即時重算的。',

    's3.title': '型態圖鑑：失控長什麼樣',
    's3.sub': '失控不是只有一種樣子。<b>型態 → 原因 → 處置</b>是綁在一起的，所以第一步永遠是先認出「這是哪一種型態」。下面五張是同一台機台的五種狀況，灰色帶是管制界限內，紅點是超出界限。',
    's3.after': [
      '<p class="sub spaced">最容易搞混的是<b>偏移</b>和<b>趨勢</b>：偏移是「某個時間點<b>啪</b>地跳一階，之後維持在新位置」，趨勢是「<b>持續</b>往同一個方向走，沒有停」。一個由事件造成，一個由累積造成，查法完全不同。</p>',
      '<h3 class="sh">型態 → 該去查什麼</h3>',
      '<p>型態、原因、處置是綁在一起的。判異規則只是幫忙自動認出型態，真正的工作是型態後面那個「所以該去查什麼」。</p>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:130px">型態</th><th style="width:34%">第一個念頭</th><th>蝕刻現場的典型原因</th></tr>',
      '<tr><td><b>偏移</b></td><td>翻 <b>event log</b> —— 那個時間點做了什麼？</td><td>PM、換 focus ring、換氣體鋼瓶</td></tr>',
      '<tr><td><b>趨勢／漂移</b></td><td>查 <b>累積量</b> —— RF hours 到哪了？該 PM 了嗎？</td><td>腔壁沉積累積、化學液老化、零件磨耗</td></tr>',
      '<tr><td><b>混流</b></td><td>查 <b>資料來源</b> —— 這張圖是不是混了兩台機？</td><td>A/B chamber 輪流跑貨卻畫在同一張圖</td></tr>',
      '<tr><td><b>變異變大</b></td><td>查 <b>均勻度</b> —— 電漿／溫度分佈是不是不均了？</td><td>下電極溫度不均、電漿分佈異常</td></tr>',
      '<tr><td><b>單點暴衝</b></td><td>查 <b>那一片</b>，或先查量測 —— 是製程還是量錯？</td><td>錯放片、夾持不良、量測機台讀錯</td></tr>',
      '</table></div>'
    ].join(''),

    's4.title': '判異規則（Western Electric / Nelson Rules）',
    's4.sub': '「沒超出界限」不等於「正常」。八條規則各自抓一種型態；勾選來看哪一條抓到了目前這批資料。圖上紅點旁邊的數字，就是它違反的規則編號。',

    's5.title': '這個型態代表什麼？怎麼處置？',
    's5.sub': '失控之後要做什麼，比背出規則條文更重要。每換一個情境，這一區會說明它的物理原因與對應處置。',

    's6.title': 'Cp / Cpk：管制界限 ≠ 規格界限',
    's6.sub': '這是最常被混淆的地方，先記這句：<b>UCL/LCL 是製程自己說的話（它做得到什麼），USL/LSL 是客戶說的話（它要什麼）。</b>兩者完全無關，Cp/Cpk 就是在比這兩件事差多少。',
    's6.analogy': [
      '<div class="lead">',
      '<p><b>用停車來想，這個比喻可以一路用到底。</b></p>',
      '<p><b>車位有多寬</b> = 規格寬度 USL − LSL（客戶給的空間）　<b>車身有多寬</b> = 製程寬度 6σ（實際做出來的散佈範圍）<br><b>Cp</b> = 車位寬 ÷ 車身寬，問的是「<b>塞不塞得進去</b>」。<b>Cpk</b> 還要看「<b>有沒有停正</b>」。</p>',
      '<p class="last">所以「製程夠不夠瘦」＝ <b>車身夠不夠窄</b> ＝ <b>σ 夠不夠小</b> ＝ 一致性好不好。製程寬度取 6σ，是因為常態分佈 ±3σ 已經涵蓋 99.73%，實務上就把它當成「這台機台實際會做出來的範圍」。Cp = 1.0 代表車身剛好塞滿車位、兩側零空隙 —— 看似及格，其實非常危險（約 2700 ppm）。</p>',
      '</div>'
    ].join(''),
    's6.table': [
      '<div class="tablebox"><table>',
      '<tr><th style="width:90px">指標</th><th>一句話講清楚</th><th style="width:34%">公式</th></tr>',
      '<tr><td><b>Cp</b></td><td>製程「夠不夠瘦」。規格寬度能塞下幾個 6σ。<br><span class="muted">完全不管製程有沒有偏掉 —— 就算整批都做在規格外，Cp 還是可以很漂亮。</span></td><td><code>(USL−LSL) / 6σ</code></td></tr>',
      '<tr><td><b>Cpk</b></td><td>製程「夠不夠瘦，而且有沒有偏」。看離最近那條規格還有幾個 3σ。<br><span class="muted">Cpk ≤ Cp 恆成立。兩者差距就是偏移量。</span></td><td><code>min( (USL−μ)/3σ , (μ−LSL)/3σ )</code></td></tr>',
      '<tr><td><b>Pp/Ppk</b></td><td>同樣的公式，但 σ 改用<b>整體</b>樣本標準差（長期，含組間漂移）。<br><span class="muted">Cpk 遠大於 Ppk ⇒ 製程短期很穩，但長期一直漂 ⇒ 去查漂移的原因。</span></td><td><code>σ 改用 s（整體）</code></td></tr>',
      '</table></div>'
    ].join(''),

    's7.title': 'USL / LSL 是怎麼訂出來的',
    's7.body': [
      '<p class="sub">「客戶決定」只講了一半。規格的源頭不是「試產做得到多少」，而是「做到多少，元件才會正常工作」—— 試產資料的角色是驗證與談判，不是定義。</p>',
      '<h3 class="sh">主路徑：從功能反推（top-down）</h3>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:34px">①</th><td><b>元件端定出電性目標</b> —— Idsat、Vt、漏電要落在什麼範圍，來自電路設計與 device 模型。</td></tr>',
      '<tr><th>②</th><td><b>敏感度分析：電性 ↔ 實體尺寸</b> —— 跑出「CD 每差 1 nm，Vt 漂多少 mV」，把電性容忍度翻譯成尺寸容忍度。</td></tr>',
      '<tr><th>③</th><td><b>容差分配 (tolerance budgeting)</b> —— 影響 CD 的不只蝕刻，微影、蝕刻、CMP 都有貢獻，把總容差分配下去（平方和相加，不是直接相加）。<b>蝕刻分到的那一份，就是這一站的 USL / LSL。</b></td></tr>',
      '<tr><th>④</th><td><b>用實際能力驗證</b> —— 這時才輪到試產：做得到嗎？算 Cpk。不夠就改善製程、回頭談放寬、或改設計。</td></tr>',
      '</table></div>',
      '<h3 class="sh">另一條路：統計暫訂（bottom-up）</h3>',
      '<p>當某個參數與功能的關係還不明確時（新製程、監控型參數、研發階段），會先拿一段確認良好的試產資料取 <b>μ ± 4σ</b> 當暫定規格，等 device 電性與良率資料回來再修正。<b>用 ±4σ 而不是 ±3σ</b> 是關鍵 —— 取 ±3σ 的話規格就等於製程寬度，Cpk 直接鎖死在 1.0，這個指標就沒意義了。</p>',
      '<div class="lead">',
      '<p><b>絕對不能做的事：把 UCL/LCL 直接抄成 USL/LSL。</b></p>',
      '<p class="last">管制界限是製程自己算出來的。這樣做等於宣告「做得到什麼，什麼就是規格」—— 製程一變差，σ 變大、界限撐開、規格跟著放寬，Cpk 永遠停在 1.0 附近，而客戶要的東西被悄悄改掉了。<b>規格必須獨立於製程而存在。</b></p>',
      '</div>',
      '<h3 class="sh">OOC ≠ OOS</h3>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:24%"></th><th>管制界限 UCL / LCL</th><th>規格界限 USL / LSL</th></tr>',
      '<tr><td><b>誰決定</b></td><td>製程資料自己算的</td><td>元件功能需求反推的</td></tr>',
      '<tr><td><b>會不會變</b></td><td>製程改變就要重算</td><td>除非設計變更，否則不動</td></tr>',
      '<tr><td><b>超出代表</b></td><td>製程變了（<b>OOC</b>, Out Of Control）</td><td>東西可能不能用（<b>OOS</b>, Out Of Spec）</td></tr>',
      '<tr><td><b>怎麼處理</b></td><td>查原因，可能繼續生產</td><td>卡貨，走 MRB／報廢／重工</td></tr>',
      '</table></div>',
      '<p class="spaced">兩者可以獨立發生：<b>OOC 但沒 OOS</b> 是製程偏了但還在規格內 —— 這是預警，SPC 的價值就在這；<b>OOS 但沒 OOC</b> 是製程很穩定但能力本來就不足 —— 穩定地做出不良品。</p>',
      '<h3 class="sh">實務上還有一層：內規</h3>',
      '<pre class="formula">        客戶規格（外規）\n    ┌─────────────────────────┐\n    │     內規（廠內管制）      │   ← 留緩衝，內規超了先處理，還來得及\n    │   ┌─────────────────┐   │\n    │   │   管制界限        │   │   ← 製程自己的實力\n    │   └─────────────────┘   │\n    └─────────────────────────┘\n\n    由內而外：管制界限 ⊂ 內規 ⊂ 客戶規格</pre>'
    ].join(''),

    's8.title': '常見追問',
    's8.body': [
      '<details><summary>管制圖失控了，第一件事做什麼？</summary><p>先確認「是製程真的變了，還是量測／記錄出錯」。依序：查量測系統 → 查是否有事件（PM、換件、換料、換機台）→ 看型態屬於哪一類（偏移／趨勢／變異變大／混流）→ 才動製程。切忌看到一點超標就調 recipe，那是把共同原因當特殊原因處理，反而讓變異變大。</p></details>',
      '<details><summary>為什麼管制界限用 R̄ 算，不直接用整體標準差？</summary><p>因為管制圖要偵測的就是「組間的變化」。如果把組間的漂移也算進 σ，界限會被撐寬，漂移就永遠抓不到 —— 等於拿犯人當尺量犯人。R̄/d₂ 估的是<b>組內</b>短期變異，是乾淨的共同原因基準。</p></details>',
      '<details><summary>Cpk 1.33 是什麼概念？</summary><p>1.33 = 製程中心離最近規格有 4σ，雙邊不良率約 63 ppm，是業界最常見的量產放行門檻。1.00 = 3σ，約 2700 ppm，太危險。1.67 = 5σ，約 0.6 ppm。所謂「六標準差」指的是 Cpk 2.0（考慮 1.5σ 長期偏移後就是那個著名的 3.4 ppm）。</p></details>',
      '<details><summary>X̄ 圖和 R 圖要先看哪一張？</summary><p><b>先看 R 圖。</b>因為 X̄ 圖的管制界限是用 R̄ 算的 —— R 圖若失控，代表 R̄ 本身不可信，X̄ 圖的界限就是錯的，看了也沒意義。先把變異穩住，再談平均值。上面的「單片異常」情境就是這個示範：X̄ 圖完全沒反應，R 圖直接爆掉。</p></details>',
      '<details><summary>n 越大越好嗎？</summary><p>n 越大，組平均的標準差 σ/√n 越小，管制界限越窄，越能抓到小偏移。但量測成本也越高，而且界限太窄會頻繁誤報。<b>更重要的是合理分組 (rational subgrouping)</b>：一個 subgroup 裡只能裝共同原因，如果為了湊 n 而拉長取樣時間或跨機台抽樣，就把特殊原因灌進 R̄ 了，界限被撐寬，管制圖反而失效。現場常見 n=3~5；量測很貴只能 n=1 時，改用 I-MR 圖。</p></details>',
      '<details><summary>SPC 跟 APC / R2R 有什麼不同？</summary><p>SPC 是<b>監控</b>：判斷製程有沒有變，變了就通知人來看。APC（Advanced Process Control）／R2R（Run-to-Run）是<b>回饋控制</b>：自動依上一批的量測結果調整下一批的 recipe。兩者並存 —— 但要注意 R2R 會把漂移「補掉」，讓管制圖上看起來很平，所以有 R2R 的機台通常還要額外監控「控制器補償量」本身。</p></details>'
    ].join(''),

    /* ---------------- 判異規則 ---------------- */
    rules: {
      1: { name: '1 點超出 3σ 界限',
           why: '最直接的失控訊號。常態下這種點自然發生的機率只有 0.27%，出現就當它是特殊原因。',
           etch: '蝕刻現場：RF 功率異常、流量計故障、錯放片。' },
      2: { name: '連續 9 點落在中心線同一側',
           why: '製程平均已經移位，只是還沒大到超出界限。管制圖抓的是「變化」，不是只抓「超標」。',
           etch: '蝕刻現場：PM 保養後基準改變、換新鋼瓶、更換 focus ring。' },
      3: { name: '連續 6 點持續上升或下降',
           why: '趨勢 (trend)。代表有個隨時間累積的因素在推著製程走。',
           etch: '蝕刻現場：chamber 壁沉積累積造成蝕刻速率漂移、化學液老化。' },
      4: { name: '連續 14 點上下交替',
           why: '過於規律的鋸齒，不是隨機。通常是兩個來源交錯，或操作員過度調機 (over-adjustment)。',
           etch: '蝕刻現場：兩個 chamber／兩台機台輪流跑，卻畫在同一張圖上。' },
      5: { name: '連續 3 點中有 2 點在同側 2σ 外',
           why: '比規則 1 敏感的偏移偵測，能更早發現平均跑掉。',
           etch: '蝕刻現場：溫度控制器開始不穩的早期徵兆。' },
      6: { name: '連續 5 點中有 4 點在同側 1σ 外',
           why: '幅度小但持續的偏移。',
           etch: '蝕刻現場：氣體流量緩慢偏離設定值。' },
      7: { name: '連續 15 點全部落在 1σ 內',
           why: '資料「太漂亮」反而有問題。常態下 15 點全落在 ±1σ 的機率只有 0.068%。',
           etch: '蝕刻現場：量測解析度不足（機台位數不夠）、管制界限算太寬、或資料被修飾過。' },
      8: { name: '連續 8 點全部在 1σ 外（不分兩側）',
           why: '中間被掏空 → 雙峰。單一穩定製程不會長這樣。',
           etch: '蝕刻現場：兩台機台／兩種產品混流，應該拆開分別管制。' }
    },

    /* ---------------- 情境 ---------------- */
    scen: {
      stable: { label: '穩定製程',
        cause: '只有共同原因 (common cause)',
        story: '製程只有正常的隨機波動。點在中心線附近上下跳，沒有型態。',
        action: '什麼都不要做。對穩定製程去「調機」反而會把變異放大 —— 這叫過度調整 (over-adjustment)，是 SPC 想防的第一件事。' },
      drift: { label: 'Chamber 沉積漂移',
        cause: '蝕刻腔壁聚合物累積，蝕刻速率隨 RF hours 慢慢改變',
        story: '從第 18 組開始，平均值一路往上爬。這是典型的趨勢 (trend)：不是突然壞掉，是慢慢走掉。',
        action: '先看 RF hours / wafer count 是不是接近 PM 週期，對照 chamber season 狀況。處置通常是提前 PM 或做 chamber clean，不是改 recipe。\n注意：大家直覺以為趨勢會被「規則 3（連續 6 點遞增）」抓到，但雜訊一大就很難連續 6 點嚴格遞增，先響的往往是規則 2 和 6。' },
      trend: { label: '乾淨的趨勢（規則 3 的樣子）',
        cause: '一台組內變異很小、但蝕刻速率持續往同一方向走的機台',
        story: '這才是「規則 3（連續 6 點遞增）」真的會亮的樣子：漂移的速度明顯大過雜訊，點才有辦法一路嚴格遞增。\n拿它跟「Chamber 沉積漂移」對照 —— 同樣是趨勢，那邊雜訊大，規則 3 就完全抓不到。',
        action: '規則 3 成不成立，看的是「漂移速度 ÷ 雜訊」夠不夠大。實務上多數漂移都達不到，所以不要把「趨勢＝規則 3」當理所當然。\n真正在監控漂移時，現場反而更依賴規則 2、6，或改用對小偏移更敏感的 CUSUM / EWMA 圖。' },
      shift: { label: 'PM 後階梯偏移',
        cause: '保養、換 focus ring、換氣體鋼瓶之後，製程基準整個平移',
        story: '第 16 組之後平均值整片抬高，但變異沒變大。點沒有立刻超出界限，是靠「連續 9 點同側」抓到的。',
        action: '查 PM 記錄／換件記錄與資料的時間點是否對得上。這正是為什麼管制圖一定要標註事件 (event log)。' },
      mixture: { label: '兩台機台混流',
        cause: 'Chamber A 與 Chamber B 交替跑貨，卻畫在同一張管制圖上',
        story: '點呈現規律的上下交替，而且中間帶 (±1σ 內) 幾乎是空的 —— 這是雙峰分佈被硬塞進一張圖的樣子。',
        action: '不是去調機，是要「分層 (stratification)」：拆成兩張圖分開管制。答錯的人會跑去調機台，把兩台本來都正常的機台越調越糟。' },
      spike: { label: '單片異常（單點暴衝）',
        cause: '第 18 組裡有一片晶圓的 CD 量測暴衝 —— 錯放片、夾持不良、或量測機台讀錯',
        story: '那一片偏了 6.5σ，但被其他 4 片平均掉之後，X̄ 圖上完全沒有被判異 —— 只有 R 圖那一點衝出界限。只盯 X̄ 圖的人會直接放行這批貨。',
        action: '這就是為什麼 X̄ 圖一定要配 R 圖看，而且要先看 R 圖。R 圖失控時 X̄ 圖的管制界限本身就不可信了。' },
      variance: { label: '片內均勻度變差',
        cause: '電漿分佈不均、下電極溫度不均，導致同一批內的片間差異變大',
        story: '平均值沒跑掉，X̄ 圖看起來還好，但 R 圖整段抬高 —— 變異變大了。',
        action: '只盯平均值會完全漏掉這種問題。客戶抱怨「規格內但品質不穩」通常就是這種。' },
      improved: { label: '製程改善後（界限沒更新）',
        cause: '換了更好的氣體流量控制器，變異縮小了，但管制界限還是用舊資料算的',
        story: '後半段所有點都擠在 ±1σ 內，觸發「連續 15 點在 1σ 內」。',
        action: '這不是壞事，是好事被規則抓出來。正確處置是「重新計算管制界限」。反過來說，如果沒有改善卻出現這種型態，就要懷疑量測解析度不足或資料造假。' }
    },

    /* ---------------- 型態圖鑑 ---------------- */
    pat: {
      control: { t: '受控', en: 'In control',
        d: '沒有型態，點在中心線附近隨機上下。只有<b>共同原因</b>。<br><b>處置：什麼都不做。</b>去調機反而會放大變異。' },
      shift: { t: '偏移', en: 'Shift',
        d: '某一刻<b>啪地跳一階</b>，之後停在新位置不動了。由<b>一次性事件</b>造成。<br>蝕刻：PM、換 focus ring、換鋼瓶。<br><b>查法：對 event log 的時間點。</b>' },
      trend: { t: '趨勢／漂移', en: 'Trend / Drift',
        d: '<b>持續</b>往同一個方向走，不會停。由<b>隨時間累積</b>的因素造成。<br>蝕刻：腔壁沉積累積、化學液老化。<br><b>查法：對 RF hours、PM 週期。</b>' },
      mixture: { t: '混流', en: 'Mixture',
        d: '<b>兩群不同的資料被畫在同一張圖上</b>，所以點在兩個高度之間跳，中間反而是空的。<br>蝕刻：A/B 兩個 chamber 輪流跑貨。<br><b>處置：分層，拆成兩張圖 —— 不是調機。</b>' },
      spread: { t: '變異變大', en: 'Increased variation',
        d: '中心沒跑掉，但<b>上下擺動的幅度變大</b>了。平均值看起來還好，穩定度卻掉了。<br>蝕刻：電漿或溫度分佈不均。<br><b>只盯平均值會完全漏掉這種。</b>' }
    }
  };

  var en = {
    _name: 'English',
    _htmlLang: 'en',

    'ui.title': 'SPC Playground',
    'ui.tagline': 'An interactive tutorial on Statistical Process Control, using semiconductor etch as the worked example. Every chart is computed live: change a parameter and the control chart follows.',
    'ui.aiNote': 'The code and explanatory text in this project were produced with AI assistance (Claude). The author reviewed the main content and the repository ships runnable tests for the statistics. If you spot an error or know a clearer way to put something, please open an issue.',
    'ui.langLabel': '中文',

    'ui.scenario': 'Process scenario',
    'ui.n': 'Subgroup size n (wafers measured per sample)',
    'ui.nOne': '1 (switches to I-MR chart)',
    'ui.groups': 'Number of subgroups (samples over time)',
    'ui.sigma': 'Process standard deviation σ',
    'ui.sigmaUnit': 'nm/min',
    'ui.reroll': 'New random data',
    'ui.showBell': 'Show normal curve on the left',
    'ui.showLetters': 'Show A/B/C zone letters',
    'ui.freeze': 'Freeze control limits (baseline = first 15 subgroups)',
    'ui.freezeHint': 'What fabs actually do: Phase I establishes the limits, Phase II uses them to monitor production',
    'ui.frozenSuffix': 'limits frozen on first {n} subgroups',

    'ui.legend.ucl': 'Red solid = UCL / LCL (μ ± 3σ)',
    'ui.legend.cl': 'Green dashed = CL, the centre line (mean)',
    'ui.legend.zone': 'Grey bands = zones A/B/C, each 1σ wide',
    'ui.legend.dot': 'Black dot = in control',
    'ui.legend.bad': 'Red dot = flagged; the number above is the rule it violates',
    'ui.legend.bell': 'Curve on the left = the same data as a normal distribution',
    'ui.legend.hover': 'Hover a point to see its value and z-score',

    'ui.chart.xbar': 'X̄ chart (subgroup means)',
    'ui.chart.r': 'R chart (subgroup range = max − min within the subgroup)',
    'ui.chart.i': 'I chart (individual values — with n=1 there is nothing to average)',
    'ui.chart.mr': 'MR chart (difference between consecutive points)',
    'ui.chart.note': '<b>Top, X̄</b> = the mean of each subgroup; it answers "has the process centre moved?". <b>Bottom, R</b> = max minus min within each subgroup; it answers "has the spread grown?". They answer different questions and you need both.',

    'ui.formulaSummary': 'How are the control limits computed? (expand for the actual numbers)',
    'ui.formulaBody': 'Production SPC does not use the overall standard deviation. It estimates σ from the average within-subgroup range R̄, because within-subgroup variation is the short-term noise of the process — pure common cause. That is the only clean ruler for measuring shifts between subgroups. <b>Using the overall σ is the classic mistake</b>: when the process shifts, the overall σ grows with it, the limits widen, and the shift never trips anything.',

    'ui.rules.allOn': 'Enable all',
    'ui.rules.only1': 'Rule 1 only',
    'ui.rules.ruleN': 'Rule {n}',
    'ui.rules.points': '{n} pts',

    'ui.story.cause': 'Physical cause',
    'ui.story.shape': 'What it looks like on the chart',
    'ui.story.action': 'What to actually do',
    'ui.story.now': 'This data set',
    'ui.story.summary': '<b>{n}</b> of {groups} subgroups flagged',
    'ui.story.expect': '. This scenario typically triggers rule(s) <b>{rules}</b>.',
    'ui.story.expectNone': '.',
    'ui.story.needFreeze': ' <b class="warn">Tick "Freeze control limits" to see the effect.</b>',

    'ui.cap.spec': 'Spec half-width (half of USL − LSL)',
    'ui.cap.shift': 'Process centre offset from spec centre',
    'ui.cap.cp': 'Cp (is it narrow enough)',
    'ui.cap.cpk': 'Cpk (narrow AND centred)',
    'ui.cap.ppk': 'Ppk (long term, includes drift)',
    'ui.cap.ppkHint': 'using overall s = {s}',
    'ui.cap.ppm': 'Estimated defect rate',
    'ui.cap.k': 'Offset k',
    'ui.cap.kHint': 'how far the process centre sits from the spec centre',
    'ui.cap.verdict': 'Reading: ',
    'ui.cap.offCentre': 'Cp exceeds Cpk by {d}. The process itself is narrow enough — the problem is that it is off centre. The fix is to bring the centre back (adjust the recipe, recalibrate), not to reduce variation.',
    'ui.cap.centred': 'Cp and Cpk are close, so the process is centred. Improving further means genuinely reducing variation.',
    'ui.verdict.bad': 'Not acceptable (< 1.00): quality outside spec is caught only by inspection; the process cannot hold it.',
    'ui.verdict.warn': 'Marginal (1.00–1.33): no margin at all — any small move produces defects.',
    'ui.verdict.ok': 'Acceptable (1.33–1.67): the common production threshold, roughly 63 ppm.',
    'ui.verdict.good': 'Good (≥ 1.67): about 0.6 ppm, close to what critical layers demand.',

    'ui.footer': 'Statistics and charts are hand-written, no dependencies · MIT License',

    's1.title': 'What problem does SPC solve?',
    's1.body': [
      '<p class="sub">Purpose before formulas. All of SPC exists to answer one question: <b>is this variation worth acting on?</b></p>',
      '<div class="lead">',
      '<p><b>Separate common cause from special cause.</b> Common cause is the random noise the process always has; special cause is an anomaly with a specific source. Confusing them leads to two mistakes, and <b>both make the process worse</b>:</p>',
      '<p>Treating noise as an anomaly → adjusting the tool → this is <b>over-adjustment</b>, and it amplifies variation.<br>Treating an anomaly as noise → doing nothing → defects ship.</p>',
      '<p class="last">Hence the single most important sentence: <b>a control chart detects change, not out-of-spec.</b> Every point inside spec but 20 in a row above the centre line — that is out of control. Every point inside the control limits but a tight customer spec — that is inadequate capability. Two different things.</p>',
      '</div>',
      '<h3 class="sh">A control chart is a normal distribution turned 90°</h3>',
      '<p>The normal distribution and three standard deviations are the only statistics SPC needs. Turn the bell curve on its side, put it at the left of a time axis, and plot points in time order. That is a control chart.</p>',
      '<div class="lead">',
      '<p><b>UCL / LCL are simply μ ± 3σ.</b> That is all they are. Upper / Lower Control Limit. A point inside means random variation; a point outside has a 0.27% chance of happening naturally, so rather than believing in that coincidence, believe the process changed.</p>',
      '<p class="last">In the next section, the bell curve on the left and the string of points on the right are <b>the same data</b> drawn two ways. Extend the height of 3σ to the right as a horizontal line and you get UCL.</p>',
      '</div>'
    ].join(''),

    's2.title': 'Process simulator',
    's2.sub': 'Pick a scenario, then move the sliders to see how each parameter changes the chart. Everything recomputes live.',

    's3.title': 'Pattern gallery: what out-of-control looks like',
    's3.sub': 'Out of control is not one shape. <b>Pattern → cause → action</b> come as a set, so the first step is always recognising which pattern you are looking at. Below are five states of the same tool. The grey band is inside the control limits; red dots are outside.',
    's3.after': [
      '<p class="sub spaced">The easiest pair to confuse is <b>shift</b> and <b>trend</b>. A shift jumps one step at a single moment and then stays at the new level. A trend keeps moving in the same direction and does not stop. One is caused by an event, the other by accumulation, and you investigate them completely differently.</p>',
      '<h3 class="sh">Pattern → what to go and check</h3>',
      '<p>Pattern, cause and action are bound together. The detection rules just recognise the pattern automatically; the real work is what follows from it.</p>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:130px">Pattern</th><th style="width:34%">First thought</th><th>Typical cause in etch</th></tr>',
      '<tr><td><b>Shift</b></td><td>Check the <b>event log</b> — what happened at that moment?</td><td>PM, focus ring change, new gas cylinder</td></tr>',
      '<tr><td><b>Trend / drift</b></td><td>Check <b>accumulation</b> — how many RF hours? Is PM due?</td><td>Chamber wall deposition, ageing chemistry, part wear</td></tr>',
      '<tr><td><b>Mixture</b></td><td>Check the <b>data source</b> — are two tools on one chart?</td><td>Chambers A and B alternating but charted together</td></tr>',
      '<tr><td><b>Increased variation</b></td><td>Check <b>uniformity</b> — has plasma or temperature distribution gone uneven?</td><td>Uneven chuck temperature, abnormal plasma distribution</td></tr>',
      '<tr><td><b>Single spike</b></td><td>Check <b>that wafer</b>, or the metrology first — process or measurement?</td><td>Misplaced wafer, poor clamping, metrology misread</td></tr>',
      '</table></div>'
    ].join(''),

    's4.title': 'Detection rules (Western Electric / Nelson)',
    's4.sub': 'Inside the limits does not mean normal. Each of the eight rules catches a different pattern. Toggle them to see which ones fire on the current data. The number beside a red point is the rule it violates.',

    's5.title': 'What does this pattern mean, and what do you do?',
    's5.sub': 'What you do after a chart goes out of control matters more than reciting the rules. This section explains the physical cause and the corresponding action for whichever scenario is selected.',

    's6.title': 'Cp / Cpk: control limits ≠ specification limits',
    's6.sub': 'This is the most commonly confused pair. Start here: <b>UCL/LCL are what the process says about itself (what it can do); USL/LSL are what the customer says (what they need).</b> They are unrelated, and Cp/Cpk measure the gap between the two.',
    's6.analogy': [
      '<div class="lead">',
      '<p><b>Think of parking a car — the analogy carries all the way through.</b></p>',
      '<p><b>How wide the space is</b> = the spec width USL − LSL (what the customer allows).　<b>How wide the car is</b> = the process width 6σ (the spread you actually produce).<br><b>Cp</b> = space width ÷ car width, i.e. "<b>does it fit at all</b>". <b>Cpk</b> also asks "<b>did you park it straight</b>".</p>',
      '<p class="last">So "is the process narrow enough" means <b>is the car narrow enough</b>, which means <b>is σ small enough</b> — how consistent the process is. Process width is taken as 6σ because ±3σ already covers 99.73% of a normal distribution, so it stands in for "what this tool actually produces". Cp = 1.0 means the car exactly fills the space with zero clearance on both sides — it looks like a pass, but it is dangerous (around 2700 ppm).</p>',
      '</div>'
    ].join(''),
    's6.table': [
      '<div class="tablebox"><table>',
      '<tr><th style="width:90px">Index</th><th>In one sentence</th><th style="width:34%">Formula</th></tr>',
      '<tr><td><b>Cp</b></td><td>Is the process narrow enough? How many 6σ widths fit inside the spec.<br><span class="muted">It ignores centring entirely — a process making everything out of spec can still show a beautiful Cp.</span></td><td><code>(USL−LSL) / 6σ</code></td></tr>',
      '<tr><td><b>Cpk</b></td><td>Narrow enough <i>and</i> centred? How many 3σ remain to the nearest spec limit.<br><span class="muted">Cpk ≤ Cp always. The gap between them is the offset.</span></td><td><code>min( (USL−μ)/3σ , (μ−LSL)/3σ )</code></td></tr>',
      '<tr><td><b>Pp/Ppk</b></td><td>Same formulas, but σ is the <b>overall</b> sample standard deviation (long term, includes between-subgroup drift).<br><span class="muted">Cpk far above Ppk ⇒ stable in the short term but drifting over time ⇒ go find the drift.</span></td><td><code>σ becomes overall s</code></td></tr>',
      '</table></div>'
    ].join(''),

    's7.title': 'Where do USL and LSL come from?',
    's7.body': [
      '<p class="sub">"The customer decides" is only half the story. Specs originate from "how accurate does this have to be for the device to work", not from "how accurate the pilot run turned out to be". Pilot data verifies and negotiates; it does not define.</p>',
      '<h3 class="sh">Main path: derived from function (top-down)</h3>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:34px">1</th><td><b>Device targets are set electrically</b> — the acceptable range for Idsat, Vt and leakage, from circuit design and device models.</td></tr>',
      '<tr><th>2</th><td><b>Sensitivity analysis links electrical to physical</b> — how many mV does Vt move per 1 nm of CD? This translates electrical tolerance into dimensional tolerance.</td></tr>',
      '<tr><th>3</th><td><b>Tolerance budgeting</b> — CD is not set by etch alone; litho, etch and CMP all contribute, so the total tolerance is divided among them (in quadrature, not by simple addition). <b>Etch’s share is this step’s USL / LSL.</b></td></tr>',
      '<tr><th>4</th><td><b>Verify against real capability</b> — only now does the pilot run matter: can we hit it? Compute Cpk. If not, improve the process, negotiate a looser spec, or change the design.</td></tr>',
      '</table></div>',
      '<h3 class="sh">The other path: provisional statistical limits (bottom-up)</h3>',
      '<p>When a parameter has no clear quantitative link to function yet (a new process, a monitoring parameter, R&amp;D), a provisional spec is often set at <b>μ ± 4σ</b> from a known-good pilot data set, then revised once electrical and yield data come back. <b>±4σ rather than ±3σ</b> is the point: at ±3σ the spec equals the process width, which pins Cpk at 1.0 and makes the index meaningless.</p>',
      '<div class="lead">',
      '<p><b>What you must never do: copy UCL/LCL into USL/LSL.</b></p>',
      '<p class="last">Control limits are computed from the process itself. Copying them declares "whatever we can do is the spec" — when the process degrades, σ grows, the limits widen, the spec widens with them, Cpk sits near 1.0 forever, and the customer’s requirement has been quietly rewritten. <b>A spec must exist independently of the process.</b></p>',
      '</div>',
      '<h3 class="sh">OOC ≠ OOS</h3>',
      '<div class="tablebox"><table>',
      '<tr><th style="width:24%"></th><th>Control limits UCL / LCL</th><th>Spec limits USL / LSL</th></tr>',
      '<tr><td><b>Set by</b></td><td>The process data itself</td><td>Derived from device requirements</td></tr>',
      '<tr><td><b>Do they change?</b></td><td>Recomputed whenever the process changes</td><td>Fixed unless the design changes</td></tr>',
      '<tr><td><b>Exceeding means</b></td><td>The process changed (<b>OOC</b>, out of control)</td><td>The part may not work (<b>OOS</b>, out of spec)</td></tr>',
      '<tr><td><b>Handling</b></td><td>Investigate; production may continue</td><td>Hold the lot; MRB, scrap or rework</td></tr>',
      '</table></div>',
      '<p class="spaced">The two are independent. <b>OOC without OOS</b> means the process moved but is still inside spec — that is the early warning, and it is where SPC earns its keep. <b>OOS without OOC</b> means a perfectly stable process whose capability was never sufficient — stably producing defects.</p>',
      '<h3 class="sh">In practice there is a third layer</h3>',
      '<pre class="formula">        Customer spec\n    ┌─────────────────────────┐\n    │   Internal spec         │   ← margin: react here while there is still time\n    │   ┌─────────────────┐   │\n    │   │  Control limits │   │   ← what the process can actually hold\n    │   └─────────────────┘   │\n    └─────────────────────────┘\n\n    Inside out: control limits ⊂ internal spec ⊂ customer spec</pre>'
    ].join(''),

    's8.title': 'Common follow-up questions',
    's8.body': [
      '<details><summary>A chart goes out of control. What do you do first?</summary><p>First establish whether the process really changed or the measurement/record is wrong. In order: check the metrology → check for events (PM, part change, material change, tool change) → identify the pattern (shift / trend / increased variation / mixture) → only then touch the process. Never change the recipe because one point went over; that treats common cause as special cause and increases variation.</p></details>',
      '<details><summary>Why compute limits from R̄ instead of the overall standard deviation?</summary><p>Because what the chart must detect is variation <i>between</i> subgroups. Folding between-subgroup drift into σ widens the limits so the drift never trips them — measuring the suspect with a ruler the suspect controls. R̄/d₂ estimates <b>within-subgroup</b> short-term variation, which is a clean common-cause baseline.</p></details>',
      '<details><summary>What does Cpk = 1.33 actually mean?</summary><p>1.33 means the process centre sits 4σ from the nearest spec limit, about 63 ppm on both tails combined, and it is the most common production release threshold. 1.00 means 3σ and about 2700 ppm, which is too risky. 1.67 means 5σ, about 0.6 ppm. "Six sigma" refers to Cpk 2.0 — allowing the customary 1.5σ long-term shift gives the familiar 3.4 ppm.</p></details>',
      '<details><summary>X̄ chart or R chart first?</summary><p><b>R chart first.</b> The X̄ limits are computed from R̄ — if the R chart is out of control, R̄ itself is untrustworthy and the X̄ limits are simply wrong. Stabilise the spread before discussing the mean. The "single wafer excursion" scenario above demonstrates this: the X̄ chart does not react at all while the R chart blows straight through its limit.</p></details>',
      '<details><summary>Is a larger n always better?</summary><p>A larger n shrinks the standard deviation of the subgroup mean to σ/√n, narrowing the limits and catching smaller shifts. But metrology costs more, and limits that are too narrow generate constant false alarms. <b>More importantly, rational subgrouping</b>: a subgroup must contain common cause only. Stretching the sampling window or sampling across tools just to reach a larger n injects special cause into R̄, widens the limits, and blinds the chart. Production typically uses n = 3–5; where metrology is expensive and only n = 1 is possible, use an I-MR chart.</p></details>',
      '<details><summary>How is SPC different from APC / R2R?</summary><p>SPC <b>monitors</b>: it decides whether the process changed and alerts a human. APC (Advanced Process Control) and R2R (run-to-run) are <b>feedback control</b>: they adjust the next run’s recipe automatically from the last run’s measurement. They coexist — but note that R2R compensates drift away, so the chart looks flat. Tools with R2R usually need the controller’s own correction term monitored as well.</p></details>'
    ].join(''),

    rules: {
      1: { name: 'One point beyond 3σ',
           why: 'The most direct out-of-control signal. Under a normal distribution this happens by chance only 0.27% of the time, so treat it as special cause.',
           etch: 'In etch: RF power fault, mass flow controller failure, misplaced wafer.' },
      2: { name: 'Nine points in a row on the same side of the centre line',
           why: 'The process mean has already moved, just not far enough to cross a limit. A control chart detects change, not just out-of-spec.',
           etch: 'In etch: baseline shift after PM, a new gas cylinder, a replaced focus ring.' },
      3: { name: 'Six points in a row steadily increasing or decreasing',
           why: 'A trend. Something that accumulates over time is pushing the process.',
           etch: 'In etch: chamber wall deposition changing the etch rate, ageing chemistry.' },
      4: { name: 'Fourteen points in a row alternating up and down',
           why: 'A sawtooth this regular is not random. Usually two interleaved sources, or an operator over-adjusting.',
           etch: 'In etch: two chambers or two tools running alternately but charted together.' },
      5: { name: 'Two of three consecutive points beyond 2σ on the same side',
           why: 'A more sensitive shift detector than rule 1; it catches a moving mean earlier.',
           etch: 'In etch: early sign of a temperature controller becoming unstable.' },
      6: { name: 'Four of five consecutive points beyond 1σ on the same side',
           why: 'A small but persistent offset.',
           etch: 'In etch: gas flow slowly departing from setpoint.' },
      7: { name: 'Fifteen points in a row within 1σ',
           why: 'Data that is "too good" is itself suspicious. The chance of 15 consecutive points landing inside ±1σ is only 0.068%.',
           etch: 'In etch: insufficient metrology resolution, limits computed too wide, or data that has been massaged.' },
      8: { name: 'Eight points in a row beyond 1σ, either side',
           why: 'The middle is hollowed out — a bimodal distribution. A single stable process does not look like this.',
           etch: 'In etch: two tools or two products mixed; they should be charted separately.' }
    },

    scen: {
      stable: { label: 'Stable process',
        cause: 'Common cause only',
        story: 'Ordinary random variation. Points bounce around the centre line with no pattern.',
        action: 'Do nothing. Adjusting a stable process amplifies its variation — that is over-adjustment, the first thing SPC exists to prevent.' },
      drift: { label: 'Chamber deposition drift',
        cause: 'Polymer accumulating on the chamber wall; etch rate changes slowly with RF hours',
        story: 'From subgroup 18 onward the mean climbs steadily. This is a trend: nothing broke, the process walked away.',
        action: 'Check RF hours / wafer count against the PM interval and the chamber season. The action is usually an early PM or a chamber clean, not a recipe change.\nNote: intuition says a trend gets caught by rule 3 (six increasing points), but with realistic noise six strictly increasing points are rare — rules 2 and 6 usually fire first.' },
      trend: { label: 'Clean trend (what rule 3 needs)',
        cause: 'A tool with very small within-subgroup variation whose etch rate keeps moving in one direction',
        story: 'This is what actually triggers rule 3: the drift rate is clearly larger than the noise, so points can increase strictly.\nCompare it with "Chamber deposition drift" — same trend, but there the noise is large and rule 3 never fires.',
        action: 'Whether rule 3 fires depends on drift rate ÷ noise. Most real drift does not clear that bar, so do not assume trend implies rule 3.\nFor monitoring real drift, production leans on rules 2 and 6, or switches to CUSUM / EWMA charts, which are more sensitive to small shifts.' },
      shift: { label: 'Step shift after PM',
        cause: 'Maintenance, a focus ring change or a new gas cylinder moves the whole process baseline',
        story: 'From subgroup 16 the mean is lifted as a block while the spread is unchanged. No point crosses a limit immediately — rule 2, nine points on the same side, is what catches it.',
        action: 'Check whether PM and part-change records line up with the timestamp. This is exactly why charts need an annotated event log.' },
      mixture: { label: 'Two tools mixed on one chart',
        cause: 'Chamber A and chamber B run alternately but are plotted on a single chart',
        story: 'Points alternate regularly and the central band (within ±1σ) is nearly empty — a bimodal distribution forced onto one chart.',
        action: 'Do not adjust the tool. Stratify: split it into two charts and control them separately. Getting this wrong sends people off to adjust two tools that were both fine.' },
      spike: { label: 'Single wafer excursion',
        cause: 'One wafer in subgroup 18 reads far off — misplaced wafer, poor clamping, or a metrology misread',
        story: 'That wafer is 6.5σ out, but averaging it with the other four leaves the X̄ chart entirely unflagged — only the R chart crosses its limit. Watching X̄ alone would release this lot.',
        action: 'This is why X̄ always comes with R, and why R is read first. When the R chart is out of control, the X̄ limits themselves are untrustworthy.' },
      variance: { label: 'Within-wafer uniformity degrading',
        cause: 'Uneven plasma or uneven chuck temperature widens wafer-to-wafer differences inside a lot',
        story: 'The mean is fine and the X̄ chart looks acceptable, but the whole R chart is lifted — the spread has grown.',
        action: 'Watching the mean alone misses this completely. A customer reporting "in spec but inconsistent" is usually describing exactly this.' },
      improved: { label: 'After a process improvement (limits not updated)',
        cause: 'A better mass flow controller reduced variation, but the control limits still come from the old data',
        story: 'Every point in the second half is squeezed within ±1σ, triggering rule 7 (fifteen points within 1σ).',
        action: 'This is not a problem; it is an improvement being flagged. The correct action is to recompute the control limits. Conversely, if nothing improved and this pattern appears, suspect insufficient metrology resolution or fabricated data.' }
    },

    pat: {
      control: { t: 'In control', en: 'Common cause only',
        d: 'No pattern; points vary randomly about the centre line. <b>Common cause only</b>.<br><b>Action: none.</b> Adjusting here amplifies variation.' },
      shift: { t: 'Shift', en: 'Step change',
        d: 'Jumps <b>one step at a single moment</b>, then stays at the new level. Caused by a <b>one-off event</b>.<br>Etch: PM, focus ring change, new cylinder.<br><b>Investigate: the event log at that timestamp.</b>' },
      trend: { t: 'Trend / Drift', en: 'Gradual movement',
        d: 'Keeps moving in <b>one direction</b> and does not stop. Caused by something that <b>accumulates over time</b>.<br>Etch: wall deposition, ageing chemistry.<br><b>Investigate: RF hours and the PM interval.</b>' },
      mixture: { t: 'Mixture', en: 'Two populations',
        d: '<b>Two different populations plotted on one chart</b>, so points alternate between two levels and the middle is empty.<br>Etch: chambers A and B running alternately.<br><b>Action: stratify into two charts — not adjust the tool.</b>' },
      spread: { t: 'Increased variation', en: 'Spread grows',
        d: 'The centre has not moved, but the <b>swing has grown</b>. The mean still looks fine while consistency has degraded.<br>Etch: uneven plasma or temperature.<br><b>Watching the mean alone misses this entirely.</b>' }
    }
  };

  var DICT = { zh: zh, en: en };
  var current = 'zh';

  function detect() {
    try {
      var saved = localStorage.getItem('spc-lang');
      if (saved && DICT[saved]) return saved;
    } catch (e) { /* 私密視窗等情況會丟出例外，忽略 */ }
    if (typeof navigator !== 'undefined' && navigator.language &&
        navigator.language.toLowerCase().indexOf('zh') !== 0) return 'en';
    return 'zh';
  }

  function set(lang) {
    if (!DICT[lang]) return;
    current = lang;
    try { localStorage.setItem('spc-lang', lang); } catch (e) { /* 忽略 */ }
  }

  /** t('ui.rules.ruleN', {n: 3}) → '規則 3' */
  function t(key, vars) {
    var s = DICT[current][key];
    if (s === undefined) s = DICT.zh[key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function table(name, id) {
    var d = DICT[current][name];
    return (d && d[id]) || DICT.zh[name][id];
  }

  return {
    DICT: DICT, detect: detect, set: set, t: t, table: table,
    lang: function () { return current; },
    other: function () { return current === 'zh' ? 'en' : 'zh'; }
  };
});
