# VEGA / ASTRA UI Regression Trace

Date: 2026-09-10

## User-reported regression

Quick dashboard buttons stopped responding after the microphone diagnostics work was introduced.

## Git history trace

Known working baseline immediately before microphone diagnostics:
- `8e88803603e55195e6723ca320a8d0bb50b68cd1`
- `js/system/buttonFix.js` was v3.8.
- `js/system/runtimeIntegrity.js` was v1.0.

Microphone diagnostics introduction:
- `7bbba0a5dcdee3393be4f9507141cb4040341aa9` — Add microphone input diagnostics.
- `349a385112a8df984a8e99089148e0208118fb0c` — Add VEGA microphone calibration control. This added the MIC TEST behavior to `buttonFix.js`.
- `166e5e13295afbf5f33fd818c6ed4fb6bb802178` — Load microphone diagnostics on demand. This changed MIC TEST to dynamically inject `microphoneDiagnostics.js`.

The GitHub comparison from the microphone commit `7bbba0a5dcdee3393be4f9507141cb4040341aa9` to the current `main` showed 16 later commits, with changes concentrated in only four files:
- `index.html`
- `js/modules/voice.js`
- `js/system/buttonFix.js`
- `js/system/runtimeIntegrity.js`

Important later UI changes included:
- `f38b138fae16abda82ff35b9beb5b0aaa3e4cd47` — refresh script versions.
- `1c89c8d881fdb3e1d67b3448b57357910d54c147` — direct quick-button handlers in buttonFix.
- `ecafeb9ff97338834a85630e0e85e84914f81aed` — quick-action stacking/z-index change.
- `cf835b6137b2928f1b5f595fa562c99d9503f376` — fixed-position quick-action/z-index change.
- `0c2cf0f04aa7cf3f274e3a1a291b9c4636a79cb2` — repair dashboard markup regression.
- `19b18fa0321a8623d999cd1081541e4a5f043c81` — make runtimeIntegrity the single owner of dashboard controls.
- `10721c2b8db2a364af2e8413758fe160be55cc21` — centralize dashboard button ownership.
- `84e905ac8b4108b9a483b4e9d6818c97fac043f7` — remove competing dashboard button handler.

## Diagnosis

The microphone diagnostics module itself is not the only relevant change. The regression trail shows that after the mic work, the dashboard event architecture was repeatedly rewritten: direct handlers, z-index/position changes, then a new runtime-level capture handler and finally removal of `buttonFix.js` from `index.html`.

Therefore the correct recovery action is to restore the pre-microphone dashboard event wiring first, rather than continuing to stack new handlers or CSS patches.

## Recovery applied 2026-09-10

Restored the dashboard wiring to the pre-microphone baseline:
- `js/system/buttonFix.js` restored to v3.8.
- `js/system/runtimeIntegrity.js` restored to v1.0.
- `index.html` restored to the pre-microphone script wiring: `buttonFix.js?v=3.8`, `runtimeIntegrity.js?v=1`, no MIC TEST control, and no dynamically loaded microphone diagnostics.

Recovery commits:
- `6203936e785f8c653a455740d91d345efae2474b` — restore pre-mic runtime integrity.
- `02b024e3153351cfe12ce17afc49e9da56342ceb` — restore pre-mic quick-action handler.
- `0c53ec0cd4d8bbb185cbca11b41c5a9c76f7a775` — restore pre-mic dashboard wiring.

## Verification status

Code/GitHub verification completed. Browser click verification still requires the deployed VEGA page to be refreshed and tested by the user.

First test after recovery:
1. Refresh VEGA completely.
2. Click JOURNAL.
3. Click TOP-DOWN ANALYSIS.
4. If those respond, test ANALYZE, MARKET SCAN, SCREEN WATCH, NEW TRADE, and navigation.

Do not reintroduce microphone diagnostics until the dashboard baseline is confirmed working.
