/*
 * 最小測試，不用任何測試框架： node test/spc.test.js
 * 驗證管制界限公式、八條判異規則、Cp/Cpk。
 */
var SPC = require('../src/spc.js');

var pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-6 : tol); }
function section(t) { console.log('\n' + t); }

/* ---------- 1. X̄-R 管制界限 ---------- */
section('X̄-R 管制界限（n=5，A₂=0.577、D₄=2.114、d₂=2.326）');
var data = [
  [10, 12, 11, 9, 13],   // X̄=11, R=4
  [11, 11, 12, 10, 11],  // X̄=11, R=2
  [9, 10, 11, 12, 13],   // X̄=11, R=4
  [12, 10, 11, 11, 11]   // X̄=11, R=2
];
var a = SPC.analyzeXbarR(data, 5);
ok('X̿ = 11', near(a.Xbarbar, 11));
ok('R̄ = 3', near(a.Rbar, 3));
ok('UCL = X̿ + A₂·R̄ = 12.731', near(a.primary.UCL, 11 + 0.577 * 3, 1e-9), a.primary.UCL);
ok('LCL = X̿ − A₂·R̄ = 9.269', near(a.primary.LCL, 11 - 0.577 * 3, 1e-9), a.primary.LCL);
ok('σ̂ = R̄/d₂ = 1.2897', near(a.sigmaWithin, 3 / 2.326, 1e-9), a.sigmaWithin);
ok('σ(X̄) = σ̂/√5 ≈ A₂R̄/3', near(a.primary.sigma, (3 / 2.326) / Math.sqrt(5), 2e-3), a.primary.sigma);
ok('R 圖 UCL = D₄·R̄ = 6.342', near(a.secondary.UCL, 2.114 * 3, 1e-9));
ok('R 圖 LCL = 0 (n=5)', near(a.secondary.LCL, 0));

/* ---------- 2. I-MR ---------- */
section('I-MR（n=1 自動切換）');
var imr = SPC.analyze([[10], [12], [11], [13]]);   // MR = 2,1,2 → MR̄ = 5/3
ok('自動判定為 i-mr', imr.type === 'i-mr');
ok('MR̄ = 1.6667', near(imr.Rbar, 5 / 3, 1e-9));
ok('σ̂ = MR̄/1.128', near(imr.sigmaWithin, (5 / 3) / 1.128, 1e-9));

/* ---------- 3. 判異規則 ---------- */
section('判異規則：每條用人工序列各別驗證');
function hitsFor(values, ruleId, CL, sigma) {
  return SPC.detectViolations(values, CL === undefined ? 0 : CL, sigma === undefined ? 1 : sigma, [ruleId]);
}
function anyHit(h) { return h.some(function (x) { return x.length; }); }
function countHit(h) { return h.filter(function (x) { return x.length; }).length; }

// 規則 1
ok('規則 1 抓到 3.5σ 的點', countHit(hitsFor([0, 0, 3.5, 0], 1)) === 1);
ok('規則 1 不誤判 2.9σ', !anyHit(hitsFor([0, 0, 2.9, 0], 1)));

// 規則 2：連續 9 點同側
ok('規則 2 抓到 9 點同側', countHit(hitsFor([.1, .2, .3, .1, .2, .3, .1, .2, .3], 2)) === 9);
ok('規則 2 不誤判 8 點同側', !anyHit(hitsFor([.1, .2, .3, .1, .2, .3, .1, .2], 2)));

// 規則 3：連續 6 點單調
ok('規則 3 抓到 6 點遞增', countHit(hitsFor([0, .1, .2, .3, .4, .5], 3)) === 6);
ok('規則 3 不誤判 5 點遞增', !anyHit(hitsFor([0, .1, .2, .3, .4], 3)));
ok('規則 3 抓到 6 點遞減', countHit(hitsFor([.5, .4, .3, .2, .1, 0], 3)) === 6);

// 規則 4：連續 14 點交替
var alt = [];
for (var i = 0; i < 14; i++) alt.push(i % 2 ? 0.5 : -0.5);
ok('規則 4 抓到 14 點交替', countHit(hitsFor(alt, 4)) === 14);
ok('規則 4 不誤判 13 點交替', !anyHit(hitsFor(alt.slice(0, 13), 4)));

// 規則 5：3 點中 2 點在同側 2σ 外
ok('規則 5 抓到 2/3 在 +2σ 外', countHit(hitsFor([2.3, 0.1, 2.5], 5)) === 2);
ok('規則 5 不誤判一上一下', !anyHit(hitsFor([2.3, 0.1, -2.5], 5)));

// 規則 6：5 點中 4 點在同側 1σ 外
ok('規則 6 抓到 4/5 在 +1σ 外', countHit(hitsFor([1.2, 1.3, 0.2, 1.4, 1.5], 6)) === 4);
ok('規則 6 不誤判 3/5', !anyHit(hitsFor([1.2, 1.3, 0.2, 0.3, 1.5], 6)));

// 規則 7：連續 15 點都在 1σ 內
var tight = [];
for (i = 0; i < 15; i++) tight.push(((i % 3) - 1) * 0.3);
ok('規則 7 抓到 15 點都在 1σ 內', countHit(hitsFor(tight, 7)) === 15);
ok('規則 7 不誤判 14 點', !anyHit(hitsFor(tight.slice(0, 14), 7)));

// 規則 8：連續 8 點都在 1σ 外
ok('規則 8 抓到 8 點在 1σ 外（兩側）',
  countHit(hitsFor([1.5, -1.5, 1.5, -1.5, 1.5, -1.5, 1.5, -1.5], 8)) === 8);
ok('規則 8 不誤判中間有一點在帶內',
  !anyHit(hitsFor([1.5, -1.5, 0.5, -1.5, 1.5, -1.5, 1.5, -1.5], 8)));

// 穩定製程不該滿天紅點
section('穩定製程的誤報率');
var stable = SPC.generate({ groups: 40, n: 5, mean: 100, sigma: 1, seed: 20260912 });
var st = SPC.analyze(stable);
var h = SPC.detectViolations(st.primary.values, st.primary.CL, st.primary.sigma);
var flagged = countHit(h);
ok('40 組穩定製程的誤報 ≤ 6 點（實際 ' + flagged + '）', flagged <= 6);

/* ---------- 4. Cp / Cpk ---------- */
section('Cp / Cpk');
var c1 = SPC.capability(100, 1, 94, 106);      // 置中，規格半寬 6σ
ok('置中時 Cp = 2.00', near(c1.cp, 2, 1e-9));
ok('置中時 Cpk = Cp', near(c1.cpk, c1.cp, 1e-9));
var c2 = SPC.capability(103, 1, 94, 106);      // 偏移 3σ
ok('偏移後 Cp 不變 = 2.00', near(c2.cp, 2, 1e-9));
ok('偏移後 Cpk = 1.00', near(c2.cpk, 1, 1e-9));
ok('Cpk 一定 ≤ Cp', c2.cpk <= c2.cp);
var c3 = SPC.capability(100, 1, 96, 104);      // Cpk = 1.33
ok('Cpk 1.333 對應約 63 ppm（實際 ' + c3.ppm.toFixed(1) + '）', Math.abs(c3.ppm - 63.3) < 3);
ok('Cpk 1.00 對應約 2700 ppm（實際 ' + SPC.capability(100, 1, 97, 103).ppm.toFixed(0) + '）',
  Math.abs(SPC.capability(100, 1, 97, 103).ppm - 2700) < 60);

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' 通過 / ' + fail + ' 失敗');
process.exit(fail ? 1 : 0);
