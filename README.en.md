# SPC Playground

English · [繁體中文](README.md)

**Live version:** <https://sainty-918.github.io/spc-playground/>

An interactive tutorial on Statistical Process Control (SPC), using semiconductor etch as the
worked example. Move a slider to change the process, and the control chart, rule violations and
Cp/Cpk all recompute live.

Intended for people who know what a normal distribution and a standard deviation are, but for
whom SPC terminology is still just vocabulary.

## Running it

The live version needs no installation at all.

To run it locally: no build step, no dependencies — clone it and serve the directory with any static server:

```bash
git clone https://github.com/SaintY-918/spc-playground.git
cd spc-playground
python -m http.server 8000
```

Then open <http://localhost:8000>.

With Node instead:

```bash
npx http-server -p 8000 -c-1
```

> Opening `index.html` directly over `file://` also works, but some browsers block the webfont
> request for local files, so serving it is safer.

Run the tests (Node only, nothing to install):

```bash
node test/spc.test.js
```

## What the page covers

1. What problem SPC solves (common cause vs special cause)
2. Process simulator (X̄-R / I-MR charts; adjustable n, subgroup count and σ; limits can be frozen)
3. Pattern gallery (in control, shift, trend, mixture, increased variation)
4. The eight Western Electric / Nelson detection rules, individually toggleable
5. Eight etch failure scenarios and what to do about each
6. Cp / Cpk / Ppk and process capability
7. Where USL / LSL actually come from, and the difference between OOC and OOS
8. Common follow-up questions

The interface and all explanatory text are available in English and Traditional Chinese;
switch at the top right. The choice is stored in `localStorage`.

## Glossary

| Term | Meaning |
|---|---|
| CL | Centre line, i.e. the mean |
| UCL / LCL | Upper / lower control limit = μ ± 3σ |
| USL / LSL | Upper / lower specification limit; derived from product requirements, unrelated to control limits |
| Common / special cause | Random noise vs an anomaly with a specific source |
| Cp | Spec width ÷ process width 6σ |
| Cpk | Same, but also accounts for how far off centre the process sits |
| OOC / OOS | Out of control (past a control limit) vs out of spec (past a spec limit) — not the same thing |

## Project layout

```
index.html               Markup (text is injected via data-i18n attributes)
src/i18n.js              All human-facing text, English and Chinese
src/spc.js               Statistics core: constants, control limits, the eight rules, Cp/Cpk
src/chart.js             SVG rendering
src/scenarios.js         Data generators for the failure scenarios (maths only)
src/app.js               Interaction, state, language switching
test/spc.test.js         Verification of the core calculations
tools/build-artifact.js  Bundles everything into a single dist/artifact.html
```

`src/spc.js` has no browser dependencies and can be used on its own:

```js
const SPC = require('./src/spc.js');

const subgroups = [[10, 12, 11, 9, 13], [11, 11, 12, 10, 11] /* ... */];
const stats = SPC.analyze(subgroups);   // n=1 switches to I-MR automatically
const hits = SPC.detectViolations(stats.primary.values,
                                  stats.primary.CL,
                                  stats.primary.sigma);
const cap = SPC.capability(100, stats.sigmaWithin, 96, 104);
```

## What the tests cover

- Control limit formulas for X̄-R and I-MR, checked against data sets with known answers
- A positive and a negative case for each of the eight rules (rule 2 must catch nine points on
  one side, and must not fire on eight)
- The false alarm rate on a stable process
- Cp / Cpk against ppm (Cpk 1.33 → about 63 ppm, 1.00 → about 2700 ppm)

## Adding a language

Copy the `zh` object in `src/i18n.js`, translate the strings, and add it to `DICT`.
The logic layer (`spc.js`, `scenarios.js`) contains no language-specific strings.

## On correctness

**The code and explanatory text in this project were produced with AI assistance (Claude).**

The author reviewed the main content, and the statistical calculations ship with runnable tests.
However, the descriptions of semiconductor practice (PM intervals, chamber behaviour, how specs
are set, and so on) are general accounts. Actual practice varies between fabs, processes and
technology nodes.

**If you find an error, an oversimplification, or a more accurate way to put something, please
open an issue** — particularly if you run SPC on a real line. Teaching material that is wrong is
worse than none, and corrections are very welcome.

## License

MIT
