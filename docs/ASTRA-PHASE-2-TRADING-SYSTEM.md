# ASTRA Phase 2 — Personal Trading System

**Status:** Implemented foundation
**Phase:** 2 of the ASTRA roadmap
**Source of truth:** Jay's canonical `js/modules/trading.js`

## Purpose

Phase 2 turns Jay's personal trading rules into a structured system ASTRA can read and validate. It does not replace the original Trading Strategy and it does not implement the Phase 3 Narrative Engine.

## Phase 2 scope

1. Personal trading rules stored in ASTRA
2. Personally adopted JEAFX-inspired concepts
3. Market structure
4. Liquidity
5. Supply and demand / key areas
6. Top-down analysis
7. Confirmation
8. Invalidation

## Personal system

The canonical trading module already contains Jay's detailed strategy, including markets, sessions, dynamic fractal trading, risk rules, entry signals, liquidity rules, timeframe flow, supply/demand, market structure, imbalance, confirmation, and invalidation.

The Phase 2 layer exposes these rules in a machine-readable `strategy.phase2` object so other ASTRA systems can consume the same source without creating another strategy definition.

## Adopted framework concepts

Only concepts already represented in Jay's trading system are treated as personally adopted:

- Market structure
- Liquidity
- Supply and demand
- Momentum / displacement
- Imbalance / market efficiency
- Fractal theory
- Multi-timeframe / top-down analysis
- Session and timing context

This is an ASTRA implementation of Jay's adopted framework, not a claim of affiliation with JEAFX.

## Top-down model

`Weekly → Daily → 4H → 1H/30M → 15M/5M`

- Weekly: bigger context; no execution
- Daily: refine context and important areas; no execution
- 4H: main market narrative
- 1H/30M: fractal opportunities
- 15M/5M: confirmation and execution

## Deterministic Phase 2 checklist

`ASTRA.modules.tradingPhase2.validateSetup(input)` validates whether the following Phase 2 conditions have been supplied:

- Market structure
- Relevant liquidity
- Relevant supply/demand or key area
- Top-down context alignment
- Required confirmation
- Acceptable risk-to-reward
- Defined invalidation

The checklist returns `READY FOR REVIEW` only when all conditions pass. Otherwise it returns `WAIT` and lists the missing conditions.

This is intentionally a checklist, not a Phase 3 scenario/action engine.

## Boundaries

Phase 2 does **not** add:

- If-this-then-that scenario generation
- Alternative scenario management
- Final trade / wait / stay-out narrative decisions
- Mentor Mode chart review
- Persistent memory of mistakes or lessons

Those belong to later roadmap phases.

## Implementation

- `js/modules/trading.js` remains the canonical personal strategy owner.
- `js/modules/tradingPhase2.js` is an adapter/validation layer that augments the canonical strategy without replacing it.
- `index.html` loads the Phase 2 layer immediately after the existing market narrative strategy extension.
