# ASTRA Script-to-Module Reconciliation

Date: 2026-08-14

## Purpose

Reconcile the legacy `script.js` against the current modular ASTRA OS architecture without restoring duplicate implementations.

The legacy script is treated as a source of functionality to preserve, not as a file to restore.

## Result

No new functional module was required. The current repository already has canonical owners for the substantive legacy subsystems.

The comparison did, however, identify several **behavioral regressions / incomplete migrations**. Those were repaired in the canonical owners rather than by recreating the legacy script.

## Functionality Ownership Map

| Legacy responsibility | Canonical owner | Result |
|---|---|---|
| ASTRA core | `js/core/astra.js` | Preserved |
| Module Manager | `js/core/moduleManager.js` | Preserved |
| Response / `AstraReply()` | `js/core/response.js` | Preserved |
| Updates | `js/system/updates.js` | Preserved |
| Memory | `js/modules/memory.js` | Preserved |
| Trading Strategy | `js/modules/trading.js` | Preserved |
| Verification Engine | `js/system/verification.js` | Preserved |
| Command Router | `js/core/commandRouter.js` | Preserved + repaired |
| Intent detection | `js/core/intentDetector.js` | Preserved + repaired at routing boundary |
| Installer | `js/system/installer.js` | Preserved + tested-build gate |
| System Verifier | `js/system/systemVerifier.js` | Preserved + now bridges to Verification Engine |
| Build Executor | `js/system/buildExecutor.js` | Preserved + syntax validation |
| Module Factory | `js/system/moduleFactory.js` | Preserved |
| Activator | `js/core/activator.js` | Preserved |
| Connection Manager | `js/system/connectionManager.js` | Preserved |
| Mode Controller / Switcher | `js/system/modeController.js` / `modeSwitcher.js` | Preserved |
| Dependency Manager | `js/core/dependencyManager.js` | Preserved |
| Mode Binding | `js/system/modeBindingManager.js` | Preserved |
| Module Blueprints | `js/system/moduleBlueprints.js` | Preserved |
| Build Memory | `js/system/buildMemory.js` | Preserved |
| Journal | `js/modules/journal.js` | Preserved |
| Performance | `js/modules/performance.js` | Preserved |
| Risk | `js/modules/risk.js` | Preserved |
| Build Planner | `js/system/buildPlanner.js` | Preserved |
| Update Analyzer | `js/system/updateAnalyzer.js` | Preserved |
| Code Generator | `js/system/codeGenerator.js` | Preserved |
| Psychology | `js/modules/psychology.js` | Preserved |
| Screen | `js/modules/screen.js` | Preserved + expanded |
| Context | `js/core/contextEngine.js` | Preserved + expanded |
| Learning | `js/core/learningEngine.js` | Preserved |
| AI Gateway | `js/core/aiGateway.js` | Preserved + expanded |
| Mode Manager | `js/core/modeManager.js` | Preserved |
| Backup | `js/system/backup.js` | Preserved + repaired |
| Runtime UI boundary | `js/system/runtimeIntegrity.js` | Canonical; legacy handlers intentionally excluded |

## Regressions Found and Repaired

### 1. Legacy system commands were missing from the canonical router

The legacy router supported:

- `astra version`
- `astra modules`

The canonical router did not explicitly handle these commands, so they could fall through to AI routing.

**Repair:** `js/core/commandRouter.js` now handles both commands directly.

### 2. Legacy open/close intent could report success without changing the current UI view

The legacy intent detector returns names such as `journal`, while the current UI uses IDs such as `view-journal` and the canonical UI helper `ASTRAShowView()`.

The previous command boundary attempted `getElementById("journal")`, which does not address the current view structure.

**Repair:** the canonical command router now routes open/close intent through `ASTRAShowView()` when available and falls back to `view-*` IDs.

### 3. Command-module registration compatibility was missing

The legacy command module exposed a `registerCommand()` method. The current core already provides `ASTRA.registerCommand()`, so creating another command registry would be duplicate architecture.

**Repair:** the canonical command module now exposes a small compatibility wrapper that delegates to `ASTRA.registerCommand()`.

### 4. Installation was not actually gated by the canonical Verification Engine

The repository had two related systems:

- `js/system/verification.js` — the Verification Engine
- `js/system/systemVerifier.js` — the system-level installation gate

The installer called `systemVerifier.verify()`, but the system verifier previously checked only the update record, module presence, and command router. It did not invoke the canonical Verification Engine.

This meant the Appendix J requirement that failed verification block installation was not fully enforced.

**Repair:** `js/system/systemVerifier.js` v1.1 now invokes `ASTRA.modules.verification.verify(moduleName)` and fails the installation gate when that verification fails or is unavailable.

This preserves the two-layer architecture instead of merging the modules.

### 5. Backup restore was only a status message

The legacy and canonical backup modules both contained a `restore()` function, but it only reported that a backup existed. It did not restore the stored databases.

Appendix J explicitly requires backup restoration to function when required.

**Repair:** `js/system/backup.js` v2.1 now restores memory, journal, performance, updates, and mode state from the saved backup and reports success/failure.

## Duplicate Logic Identified and Excluded

### Duplicate `show strategy`

The legacy script registered `show strategy` twice. One registration called `TradingModule.show()` and another attempted `TradingModule.showStrategy()` even though that method was not present in the shown trading module.

The duplicate registration was not restored.

### Duplicate UI event handling

The legacy script installed direct send-button, Enter-key, panel-button, and `.module-btn` handlers. The current architecture deliberately assigns conversation event ownership to `runtimeIntegrity.js`.

Those handlers were not restored.

### Duplicate intent / context / AI / learning helpers

Legacy global helpers are represented by canonical modules for intent, context, AI, and learning. Parallel implementations would violate the one-owner rule.

## Verification Status

Static repository comparison confirms the repaired responsibilities exist in their canonical owners.

The repairs were committed incrementally as canonical module changes:

1. Command router compatibility and current-view routing.
2. System verifier → Verification Engine integration.
3. Functional backup restoration.

Browser-level testing is still required for actual DOM routing, localStorage behavior in-browser, screen sharing, voice APIs, and live AI connectivity. Appendix J requires those runtime layers to be tested before calling the release stable.

## Architecture Rule

> **One subsystem = one canonical implementation = one module owner.**

A legacy function may be moved into an existing canonical module, replaced by an existing module API, or removed when it is dead/duplicated. It should not be copied into a second module merely to preserve its old filename or global shape.

## Final Decision

**New functional modules created: 0**

**Duplicate modules created: 0**

**Legacy `script.js` restored: No**

**Canonical architecture retained: Yes**

**Behavioral migration defects repaired: 5**

The migration review is complete at the repository/static-analysis level. The remaining work is browser-level verification according to Appendix J.
