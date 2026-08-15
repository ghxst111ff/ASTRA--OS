# ASTRA Script-to-Module Reconciliation

Date: 2026-08-14

## Purpose

Reconcile the legacy `script.js` against the current modular ASTRA OS architecture without creating duplicate modules or duplicate implementations.

The legacy script is treated as a source of functionality to preserve, not as a file to restore.

## Result

**No new functional module was required.** Every substantive subsystem found in the legacy `script.js` already has a canonical implementation in the current repository.

The correct action is therefore:

1. Keep the current modular implementations.
2. Do not restore `script.js`.
3. Do not create duplicate compatibility modules.
4. Keep UI/event-boundary behavior owned by `runtimeIntegrity.js`.
5. Preserve legacy functionality through the existing canonical modules.

## Functionality Ownership Map

| Legacy script section | Canonical owner | Status |
|---|---|---|
| ASTRA v2.0 Core Engine | `js/core/astra.js` | Preserved |
| Module Manager | `js/core/moduleManager.js` | Preserved |
| Response Module / `AstraReply()` | `js/core/response.js` | Preserved |
| Update Module | `js/system/updates.js` | Preserved |
| Memory Module | `js/modules/memory.js` | Preserved |
| Trading Strategy Module | `js/modules/trading.js` | Preserved |
| Trading command registration | `js/modules/trading.js` / command routing | Preserved; duplicate legacy command removed |
| Verification Module | `js/system/verification.js` | Preserved |
| Command Router Module | `js/core/commandRouter.js` | Preserved |
| Intent detection / open-close panel detection | `js/core/intentDetector.js` | Preserved |
| Installer | `js/system/installer.js` | Preserved and strengthened |
| System Verifier | `js/system/systemVerifier.js` | Preserved |
| Build Executor | `js/system/buildExecutor.js` | Preserved |
| Module Factory | `js/system/moduleFactory.js` | Preserved |
| Module Activator | `js/core/activator.js` | Preserved |
| Connection Manager | `js/system/connectionManager.js` | Preserved |
| Mode Controller | `js/system/modeController.js` | Preserved |
| Dependency Manager | `js/core/dependencyManager.js` | Preserved |
| Mode Binding Manager | `js/system/modeBindingManager.js` | Preserved |
| Mode Switcher | `js/system/modeSwitcher.js` | Preserved |
| Module Blueprint System | `js/system/moduleBlueprints.js` | Preserved |
| Build Memory | `js/system/buildMemory.js` | Preserved |
| Journal Module | `js/modules/journal.js` | Preserved |
| Performance Module | `js/modules/performance.js` | Preserved |
| Risk Management Module | `js/modules/risk.js` | Preserved |
| Build Planner | `js/system/buildPlanner.js` | Preserved |
| Update Analyzer | `js/system/updateAnalyzer.js` | Preserved |
| Code Generator | `js/system/codeGenerator.js` | Preserved |
| Psychology Module | `js/modules/psychology.js` | Preserved |
| Screen Module | `js/modules/screen.js` | Preserved |
| Context construction (`buildContext`) | `js/core/contextEngine.js` | Preserved |
| UI command bridge / send handling | `js/system/runtimeIntegrity.js` | Preserved; duplicate legacy handlers intentionally not restored |
| Learning persistence (`ASTRA.learn`) | `js/core/learningEngine.js` | Preserved by canonical learning engine |
| AI request path (`askAI`) | `js/core/aiGateway.js` | Preserved by canonical AI gateway |
| Mode Manager | `js/core/modeManager.js` | Preserved |
| Backup System | `js/system/backup.js` | Preserved |

## Duplicate Logic Identified and Excluded

### 1. Duplicate `show strategy` command

The legacy script registered `show strategy` twice. One registration called `TradingModule.show()` and the second attempted to call `TradingModule.showStrategy()`. The duplicate registration is not part of the canonical architecture.

The trading module remains the single owner of trading-strategy presentation.

### 2. Duplicate UI event handling

The legacy script installed direct `DOMContentLoaded`, `sendBtn`, Enter-key, panel-button, and `.module-btn` handlers. The current repository has a dedicated runtime boundary in `js/system/runtimeIntegrity.js` that explicitly prevents duplicate UI handling.

The legacy handlers must not be restored.

### 3. Duplicate intent detection

The legacy `detectIntent()` implementation is already represented by `js/core/intentDetector.js`. A second detector would be duplicate logic.

### 4. Duplicate AI/context/learning helpers

The legacy global `buildContext()`, `askAI()`, and `ASTRA.learn()` implementations are functionality owned by the current context, AI gateway, and learning engines. The legacy copies must not be restored as parallel engines.

## Legacy Functionality That Is Intentionally Not a New Module

The following are helpers or UI glue rather than independent ASTRA subsystems:

- `AstraReply()` convenience access
- `detectIntent()` helper
- `buildContext()` helper
- `askAI()` helper
- `ASTRA.learn()` convenience API
- empty panel click callbacks
- `.module-btn` event wiring
- DOMContentLoaded send wiring

Creating modules for these would create artificial module duplication. Their responsibilities belong to the canonical modules and runtime boundary already present.

## Architecture Rule Established

ASTRA now follows a strict ownership rule:

> **One subsystem = one canonical implementation = one module owner.**

A legacy function may be moved into an existing module, replaced by an existing module API, or removed when it is dead/duplicated. It must not be copied into a second module merely to preserve its old filename or global function shape.

## Verification Notes

The current repository already contains dedicated implementations for the major legacy responsibilities, including the core registry, module management, intent detection, updates, verification, installer, build execution, build planning, module factory/activation, modes, memory, trading, journal, performance, risk, psychology, screen, backup, AI, context, learning, and runtime UI integrity.

The installer additionally enforces the tested-build requirement before installation, which is stricter than the legacy installer path.

## Final Decision

**New modules created: 0**

**Duplicate modules created: 0**

**Legacy `script.js` restored: No**

**Canonical modular architecture retained: Yes**

The reconciliation is therefore complete at the module-ownership level. Future changes should modify the canonical owner rather than adding another implementation of the same responsibility.
