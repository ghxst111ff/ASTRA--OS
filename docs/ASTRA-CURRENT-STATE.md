# ASTRA Current Development State

**Version:** 1.2  
**Status:** Active Development — browser smoke verification running  
**Repository:** `ghxst111ff/ASTRA--OS`  
**Branch:** `main`  
**Snapshot:** 2026-09-13

## 1. Canonical Sources

Use these in order:

1. ASTRA Vision & Goals (2026)
2. ASTRA Project Bible v3.0
3. Appendix J — Testing & Verification Checklists
4. ASTRA Engineering Governance v3.0
5. This current-state document
6. GitHub source code

## 2. Architecture

ASTRA now uses the modular `js/core`, `js/modules`, and `js/system` architecture. The legacy root `script.js` is **not loaded and is not restored**.

### Core

- `astra.js`
- `modeManager.js`
- `moduleManager.js`
- `dependencyManager.js`
- `activator.js`
- `response.js`
- `intentDetector.js`
- `moduleTypeDetector.js`
- `naturalIntent.js`
- `commandRouter.js`
- `contextEngine.js`
- `learningEngine.js`
- `apiConnection.js`
- `aiGateway.js`
- `coachEngine.js`
- `topDownCoach.js`
- `history.js`

### Application modules

- trading
- journal
- memory
- performance
- backtesting
- marketData
- marketNarrativeStrategy
- screen
- voice
- traderProfile
- proactiveMarketObserver
- demoAccount
- risk
- psychology
- research

### System modules

- updates
- verification
- systemVerifier
- installer
- buildExecutor
- moduleFactory
- connectionManager
- modeController
- modeBindingManager
- modeSwitcher
- buildPlanner
- buildMemory
- moduleBlueprints
- codeGenerator
- backup
- updateAnalyzer
- uiFix
- buttonFix
- conversationLayout
- runtimeIntegrity
- interactionFix
- tradeScreenshot
- tradeEditor
- tradeManagementUI
- microphoneDiagnostics
- microphoneTestLauncher

## 3. Ownership Rule

> **One subsystem = one canonical implementation = one module owner.**

Do not recreate functionality from the legacy script as duplicate modules. Migrate missing behavior into its canonical owner.

The old script-to-module reconciliation found no legitimate new subsystem requiring a new functional module. Behavioral gaps found during reconciliation were repaired in existing canonical modules.

See `docs/ASTRA-SCRIPT-RECONCILIATION-2026-08-14.md`.

## 4. Recent Repairs and Cleanup

### Command routing

`js/core/commandRouter.js` preserves legacy system commands (`astra version`, `astra modules`), routes open/close intent through the current view system, and exposes command registration through the canonical `ASTRA.registerCommand()` API.

### Verification gate

`js/system/systemVerifier.js` calls the canonical Verification Engine after its system-level checks. Installation remains blocked when verification fails or is unavailable.

### Backup

`js/system/backup.js` restores memory, journal, performance, updates, and mode state instead of only reporting that a backup exists.

### Conversation ownership

`js/system/runtimeIntegrity.js` remains the final owner of SEND/Enter submission. `js/system/interactionFix.js` owns trade and module interactions. `js/system/buttonFix.js` owns dashboard quick actions and the top voice-output control. `js/system/conversationLayout.js` owns the in-chat microphone/layout.

### September 2026 cleanup

Removed obsolete or superseded files that were no longer loaded by the production page:

- `js/system/micTestLauncher.js` — duplicate microphone launcher; `microphoneTestLauncher.js` is the single launcher.
- `js/system/microphoneTestHarness.js` — unused keyboard diagnostic harness; isolated `mic-test.html` remains the supported diagnostic path.
- `js/system/screenButtonFix.js` — superseded screen-button handler; `buttonFix.js` is the canonical owner.

Removed the legacy hidden `#hiddenScreen` control from `index.html` because the production UI already has the canonical screen controls.

### Voice output repair

`js/modules/voice.js` v3.2 restores the intended voice-output toggle. The previous implementation forced output back to `true` whenever the dashboard control was used, so the UI could not actually turn voice output off. Output state is now persisted in `localStorage` and reflected by `status().outputEnabled`.

## 5. Browser Smoke Testing

A real Chromium browser smoke test is part of the repository:

- `tests/browser-smoke.cjs`
- `.github/workflows/browser-smoke.yml`
- `docs/ASTRA-APPENDIX-J-SMOKE-TEST-2026-08-14.md`

A push-triggered smoke run is currently executing against the cleanup commit. The test covers:

- page load
- bottom conversation panel
- one in-chat microphone
- one SEND button
- one dashboard VOICE COMMAND button
- removal of the legacy hidden screen control
- required module registration
- typed `hey` → exactly one user message
- AI response path using a deterministic CI API stub
- no browser console/runtime errors
- no failed browser resource requests
- natural-language research classification

## 6. Appendix J Status

**Overall:** NOT YET RELEASE VERIFIED.

### Demonstrated

- Static module ownership reconciliation
- Verification Engine present
- System verification gate connected to Verification Engine
- Installation safety checks
- Functional backup restore
- Browser smoke/system UI checks
- Duplicate conversation-control protection
- Production cleanup of obsolete duplicate handlers
- Voice output toggle repair

### Still required

- Full Unit testing
- Full Integration testing
- Full System testing
- User Acceptance Testing
- Regression suite
- Real microphone/speech testing
- Real screen-sharing testing
- Configured live AI API testing
- Error Recovery System completion
- Knowledge Base Engine completion
- Full release-readiness checklist

The browser smoke test is a **smoke layer**, not a replacement for Appendix J's complete testing and release-readiness process.

## 7. Development Rule Going Forward

Before changing or deleting a module:

1. Inspect the current canonical owner.
2. Compare the legacy behavior if relevant.
3. Preserve functionality in the canonical owner.
4. Do not create a duplicate implementation.
5. Run the browser smoke test after UI/runtime changes.
6. Update this document after meaningful architecture changes.

**ASTRA is not v1.0 Stable until Appendix J release-readiness requirements are demonstrated.**

## 8. Chat Handoff

For a new chat, say:

> Read `docs/ASTRA-CURRENT-STATE.md` first. Treat the ASTRA Project Bible v3.0, ASTRA Vision & Goals, Engineering Governance, and Appendix J as canonical. Inspect the live GitHub repository before making implementation claims. Preserve one canonical owner per subsystem and do not recreate duplicate modules.
