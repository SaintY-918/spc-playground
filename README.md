# SPC Playground

[English](README.en.md) · 繁體中文

統計製程管制（SPC）的互動教學頁面，以半導體蝕刻製程為例。
拉滑桿改變製程參數，管制圖、判異結果、Cp/Cpk 會即時重算。

適合對象：知道常態分佈與標準差，但對 SPC 名詞停留在「聽過」階段的人。

## 執行方式

沒有建置步驟、沒有相依套件。clone 之後用任何靜態伺服器打開即可：

```bash
git clone https://github.com/<your-account>/spc-playground.git
cd spc-playground
python -m http.server 8000
```

然後開 <http://localhost:8000>。

用 Node 也可以：

```bash
npx http-server -p 8000 -c-1
```

> 直接用瀏覽器開 `index.html`（`file://`）也能跑，但部分瀏覽器會擋本機檔案的字型請求，
> 用伺服器開比較保險。

跑測試（只需要 Node，不需要安裝任何套件）：

```bash
node test/spc.test.js
```

## 頁面內容

1. SPC 在解決什麼問題（共同原因 vs 特殊原因）
2. 製程模擬器（X̄-R / I-MR 管制圖，可調 n、組數、σ，可凍結管制界限）
3. 型態圖鑑（受控、偏移、趨勢、混流、變異變大）
4. 八條判異規則（Western Electric / Nelson），可逐條開關
5. 八個蝕刻異常情境與對應處置
6. Cp / Cpk / Ppk 與製程能力
7. USL / LSL 是怎麼訂出來的、OOC 與 OOS 的差別
8. 常見追問

介面與說明文字有中文與英文兩種，右上角切換，選擇會記在 `localStorage`。

## 名詞對照

| 名詞 | 意思 |
|---|---|
| CL | 中心線，即平均值 |
| UCL / LCL | 上／下管制界限 = μ ± 3σ |
| USL / LSL | 上／下規格界限，來自產品需求，與管制界限無關 |
| 共同原因 / 特殊原因 | 隨機雜訊 vs 有具體來源的異常 |
| Cp | 規格寬度 ÷ 製程寬度 6σ |
| Cpk | 同時考慮製程有沒有偏離規格中心 |
| OOC / OOS | 失控（超出管制界限）／超規（超出規格界限），兩者不同 |

## 專案結構

```
index.html               版面（文字由 data-i18n 屬性注入）
src/i18n.js              所有給人看的文字，中英雙語
src/spc.js               統計核心：係數表、管制界限、八條判異規則、Cp/Cpk
src/chart.js             SVG 繪圖
src/scenarios.js         異常情境的資料產生器（只有數學）
src/app.js               互動、狀態、語言切換
test/spc.test.js         核心計算驗證
tools/build-artifact.js  打包成單檔 dist/artifact.html
```

`src/spc.js` 不依賴瀏覽器，可以單獨使用：

```js
const SPC = require('./src/spc.js');

const subgroups = [[10, 12, 11, 9, 13], [11, 11, 12, 10, 11] /* ... */];
const stats = SPC.analyze(subgroups);   // n=1 會自動切成 I-MR
const hits = SPC.detectViolations(stats.primary.values,
                                  stats.primary.CL,
                                  stats.primary.sigma);
const cap = SPC.capability(100, stats.sigmaWithin, 96, 104);
```

## 測試涵蓋範圍

- X̄-R 與 I-MR 的管制界限公式（用已知答案的資料集比對）
- 八條判異規則各自的正例與反例（例如規則 2 要抓到 9 點同側、但不能誤判 8 點）
- 穩定製程的誤報率
- Cp / Cpk 與 ppm 的對應（Cpk 1.33 → 約 63 ppm，1.00 → 約 2700 ppm）

## 新增語言

複製 `src/i18n.js` 裡的 `zh` 物件、翻譯字串、加進 `DICT` 即可。
邏輯層（`spc.js`、`scenarios.js`）不含任何語言相關的字串。

## 關於內容正確性

**這個專案的程式與說明文字由 AI（Claude）協助產生。**

作者校對過主要內容，統計計算的部分附有可執行的測試。
但說明文字裡關於半導體製程的實務描述（PM 週期、chamber 行為、規格訂定流程等）
是通用性的說法，各廠、各製程、各世代的實際做法會有差異。

**如果發現錯誤、過度簡化、或有更準確的說法，請開 issue 指正**，
特別是實際在產線上做 SPC 的人。教學用的內容有錯比沒有更糟，會很感謝任何更正。

## License

MIT
