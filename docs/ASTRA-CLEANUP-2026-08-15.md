# ASTRA Cleanup — 2026-08-15

## Purpose
Remove duplicate runtime implementations, eliminate competing UI/conversation handlers, and make the active browser load path deterministic.

## Removed
- `script.js` — obsolete legacy UI command bridge duplicated by the modular UI/system layer.
- `js/modules/coachEngine.js` — duplicate Coach Engine implementation; `js/core/coachEngine.js` is now canonical.
- `js/core/conversationLayout.js` — duplicate/unused conversation layout; `js/system/conversationLayout.js` is canonical.

## Cleaned
- `index.html` now explicitly loads the canonical `js/core/coachEngine.js`.
- `index.html` no longer loads the deleted legacy `script.js`.
- `js/system/buttonFix.js` no longer dynamically loads alternate Coach Engine, AI Gateway, or Proactive Observer versions and no longer owns text/Enter submission.
- `js/system/uiFix.js` now owns module-view rendering only and no longer installs a second conversation submission/recovery path or dynamically loads another Coach Engine.
- `js/system/runtimeIntegrity.js` remains the single final event boundary for SEND/Enter and duplicate-send suppression.

## Intentional Restrictions Kept
The cleanup did not remove intended system safeguards such as dependency checks, activation blocking for missing dependencies, installation approval requirements, or trading risk guardrails. These are architectural controls rather than accidental UI restrictions.

## Verification
- Confirmed `script.js` is deleted from the repository.
- Confirmed `js/modules/coachEngine.js` is deleted.
- Confirmed `js/core/conversationLayout.js` is deleted.
- Confirmed `index.html` loads `js/core/coachEngine.js` and the system conversation layout.
- Confirmed the active UI layer is now split by responsibility: `uiFix.js` for views, `buttonFix.js` for dashboard controls, `conversationLayout.js` for layout, and `runtimeIntegrity.js` for SEND/Enter event ownership.

## Remaining Validation
Browser-level testing is still required for microphone permissions, speech recognition, AI API connectivity, screen sharing, and live conversation behavior. The repository inspection cannot simulate those browser APIs.
