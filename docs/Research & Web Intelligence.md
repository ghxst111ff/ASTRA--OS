# ASTRA Research & Web Intelligence

**Version:** 1.1  
**Status:** Active Development  
**Role:** Natural-language research and current-information layer

## Purpose

ASTRA should understand research requests as normal conversation rather than requiring exact commands.

Examples:

- “What’s the red folder news for GBP?”
- “What are the news coming out for the pound?”
- “Is there anything important for sterling this week?”
- “Why is GBP moving today?”

These requests resolve to a structured research intent containing, when available:

- currency or pair
- research type
- topic
- time window
- high-impact/red-folder priority

## Research Types

- `news` — current/recent headlines and confirmed developments
- `calendar` — scheduled economic releases and events
- `calendar_and_news` — both scheduled events and current developments
- `market_drivers` — evidence-based explanation of what is moving a market
- `research` — broader current-information request

## Source-Grounding Rules

Current information must be obtained through the canonical ASTRA API gateway and its configured research provider.

ASTRA must:

1. Prefer official economic agencies and central banks for economic releases.
2. Prefer reputable financial news for market context.
3. Include dates for current claims.
4. Distinguish scheduled events from released information.
5. Never invent headlines, release times, sources, or citations.
6. Clearly state when live research is unavailable rather than guessing.

## Architecture

`User speech/text → Natural Intent Engine → Research Classifier → API Gateway → Web/Search Provider → Source-grounded response`

Research remains behind the single API gateway so external services do not become part of ASTRA’s core architecture.

## Trading Context

When the request is trading-related, ASTRA may attach the loaded trading system and current market-session context. Research should inform the trader, not silently turn into a trade instruction.

## Verification

The browser smoke test must cover multiple natural phrasings, including GBP news, red-folder/high-impact requests, broader sterling questions, and market-driver questions. A research request must classify correctly without an exact command phrase.
