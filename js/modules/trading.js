/* =========================================
   ASTRA TRADING STRATEGY MODULE v3.0
   Source of truth: Jay's original detailed
   Notion page "Trading Strategy"
========================================= */

const TradingModule = {
  name:"Jay's Trading Strategy",
  version:"3.0",
  source:"Original detailed Trading Strategy Notion page",

  strategy:{
    foundation:{
      markets:["GBPUSD","EURUSD","AUDUSD"],
      sessions:"London & New York only",
      dailyRoutine:[
        "5:10 – 5:40 AM — Morning analysis, setting orders, or executing trades",
        "Every 15 mins (during session) — Check in to manage active positions",
        "End of day — 20-minute journaling session",
        "7:30 – 9:00 PM — Testing, study, learning, and applying new knowledge"
      ],
      timeframes:"Higher timeframe (bias/map) → 15-minute & 5-minute (execution)",
      style:"Dynamic fractal trading",
      fractalTheory:[
        "The market is fractal, meaning the same price-action concepts repeat across different timeframes.",
        "Market structure, supply and demand, momentum, imbalance, and liquidity can be seen on both higher and lower timeframes."
      ],
      process:[
        "Start with the higher timeframe to understand the bigger picture.",
        "Identify where I want to buy and sell using structure, supply and demand, and liquidity.",
        "Create a market map showing the important areas and likely targets.",
        "Drop to lower timeframes and look at the price action inside the bigger move.",
        "Look for fractal trading opportunities as price moves between my higher-timeframe areas.",
        "Use the same concepts — structure, supply and demand, momentum, and liquidity — to identify these opportunities.",
        "Execute my trades on the 15-minute and 5-minute timeframes when my confirmation is present."
      ],
      keyPrinciple:"The higher timeframe gives me the map. The lower timeframe gives me the opportunities.",
      dynamicTrading:[
        "I do not only wait for one higher-timeframe setup.",
        "Once I have mapped where I want to buy and sell, I can look for opportunities within the price movement between those areas."
      ]
    },
    risk:{maxRiskPerTrade:"1%",minimumRR:"1:3",minimumWinRate:"30%"},
    technicalAnalysis:{
      primarySetup:[
        "Market structure",
        "Supply and demand",
        "Liquidity",
        "Momentum and displacement",
        "Imbalance / market efficiency",
        "Fractal / multi-timeframe analysis"
      ]
    },
    liquidity:{
      concepts:["Equal highs (EQH)","Equal lows (EQL)","Trendline liquidity","Liquidity around supply and demand"],
      rule:"Do not blindly fade equal highs or equal lows; wait for the required reaction and structural confirmation."
    },
    marketStructure:{
      concepts:["HH","HL","LH","LL","BOS","CHoCH","Impulse","Correction","Significant highs/lows","Structural shifts"]
    },
    supplyDemand:{
      demand:"Consolidation before a strong upward move",
      supply:"Consolidation before a strong downward move",
      rules:["Use trend context","Prefer fresh zones","Use zones with structure, liquidity, narrative and confirmation","Zones may also become targets"]
    },
    confirmationEntry:{
      bullish:["Relevant demand area","Liquidity context/event when required","Structure shift / CHoCH","Candle close and displacement/momentum","Narrative alignment","Valid RR"],
      bearish:["Relevant supply area","Liquidity context/event when required","Structure shift / CHoCH","Candle close and displacement/momentum","Narrative alignment","Valid RR"]
    },
    invalidation:{
      conditions:["Narrative no longer supported","Structure contradicts the idea","Confirmation is absent","Zone is invalidated","Liquidity behaves differently","RR is no longer acceptable","Market conditions change"]
    },
    imbalance:{
      definition:"An open price area created after a strong move.",
      rules:["May be expected to fill","May act as a target/draw","Never trade imbalance alone"]
    },
    rules:{lossLimitPerDay:2,winLimitPerDay:3,tradesPerWeek:10,noTradeRule:"If required conditions are absent or I have to convince myself to take the trade, no trade."},
    tradeManagement:{stopManagement:"Trailing stop only — no fixed stop loss"},
    psychology:{readiness:["Sleep","Stress","External factors","Focus"],principles:["Mental journaling","Pattern review","If-this-then-that thinking","Mindset is part of the trading system"]}
  }
};

/*
  Trade screenshot attachment UI is owned by the trade-entry/journal layer,
  not the trading strategy module. This module intentionally remains the
  canonical source of strategy rules.
*/

if(typeof window!=="undefined"){
  window.ASTRA=window.ASTRA||{};
  window.ASTRA.modules=window.ASTRA.modules||{};
  window.ASTRA.modules.trading=TradingModule;
}
if(typeof ASTRA!=="undefined"&&ASTRA.registerModule) ASTRA.registerModule("trading",TradingModule);
