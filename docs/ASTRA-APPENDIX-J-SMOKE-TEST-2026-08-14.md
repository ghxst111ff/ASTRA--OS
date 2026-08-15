# ASTRA Appendix J Browser Smoke Test

Date: 2026-08-14/15
Branch: `main`
Workflow: `.github/workflows/browser-smoke.yml`

## Scope

This is the first automated browser-level smoke layer for the current ASTRA UI/runtime migration. It is not a substitute for the complete Appendix J test suite.

## Checks

- ASTRA page loads in Chromium.
- Conversation panel is created and bottom-chat layout is active.
- Exactly one in-chat microphone exists.
- Exactly one SEND button exists in the conversation panel.
- Exactly one dashboard VOICE COMMAND button exists.
- Legacy hidden screen control is removed from the live DOM.
- Required core/application/system modules register during page load.
- Typing `hey` and pressing SEND produces exactly one user message.
- AI response path can complete using a deterministic API stub in CI.
- Browser console/runtime errors are rejected.
- Failed resource requests are rejected.

## Result

Workflow run `31862968141` (run #6) passed successfully on commit `796021074998dc2cbc24af4719f156084b8e5586`.

The test exposed an issue in the test harness itself: `ASTRA` is a top-level lexical binding and therefore is not exposed as `window.ASTRA`. The harness was corrected to inspect `ASTRA` directly. No ASTRA runtime failure was indicated by that test failure.

A separate code review during this runtime pass also found and repaired two real migration issues:

1. `ProactiveMarketObserver` called `ASTRA.modules.coach.addObservation()`, but the Coach Engine did not expose that method. Coach Engine v1.3 now persists observations and exposes `addObservation()`.
2. `buttonFix.js` checked `screen.status()` as if it returned an object, while the Screen module's `status()` returns a user-facing string. The button now reads the canonical `screen.sharing` property instead.

## Not Yet Covered

The smoke test does not prove:

- real microphone permission/recognition behavior,
- real speech synthesis behavior,
- real `getDisplayMedia()` screen sharing,
- real AI API availability/authentication,
- trading-risk UAT,
- full Unit/Integration/System/UAT/Regression coverage,
- complete release-readiness.

Those remain required before ASTRA can be called v1.0 Stable.
