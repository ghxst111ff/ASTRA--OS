/* =========================================
   ASTRA PHASE 2 — PERSONAL TRADING SYSTEM
   This file augments the canonical TradingModule.
   It does NOT replace or duplicate Jay's strategy.
========================================= */
(function(){
  const trading = window.ASTRA && ASTRA.modules && ASTRA.modules.trading;
  if(!trading || !trading.strategy) return;

  const strategy = trading.strategy;

  const phase2 = {
    version:"1.0",
    phase:2,
    name:"ASTRA Personal Trading System",
    source:"Jay's canonical Trading Strategy + personally adopted JEAFX-inspired concepts",
    scope:[
      "Personal trading rules",
      "Market structure",
      "Liquidity",
      "Supply and demand / key areas",
      "Top-down analysis",
      "Confirmation",
      "Invalidation"
    ],
    adoptedFramework:{
      rule:"Only concepts already present in Jay's trading system are treated as adopted framework concepts.",
      concepts:[
        "Market structure",
        "Liquidity",
        "Supply and demand",
        "Momentum / displacement",
        "Imbalance / market efficiency",
        "Fractal theory",
        "Multi-timeframe / top-down analysis",
        "Session and timing context"
      ]
    },
    topDown:{
      sequence:["Weekly","Daily","4H","1H/30M","15M/5M"],
      roles:{
        weekly:"Bigger context — no execution",
        daily:"Refine context and important areas — no execution",
        fourHour:"Main market narrative",
        oneHourThirtyMinute:"Fractal opportunities",
        fifteenMinuteFiveMinute:"Confirmation and execution"
      },
      principle:"The higher timeframe gives me the map. The lower timeframe gives me the opportunities."
    },
    marketStructure:{
      bullish:"Higher highs + higher lows",
      bearish:"Lower lows + lower highs",
      confirmation:"A structural shift supported by momentum/displacement and candle close, not only a wick",
      caution:"A trend-line break alone does not mean the trend has changed; use significant highs and lows."
    },
    liquidity:{
      focus:["Equal highs","Equal lows","Ascending trend lines","Descending trend lines","Liquidity around supply and demand zones"],
      rule:"Do not automatically trade an equal high/low or zone. Consider whether liquidity may be taken first and wait for structural confirmation when required."
    },
    supplyDemand:{
      demand:"Consolidation before a strong move up; prioritize fresh zones in the appropriate context.",
      supply:"Consolidation before a strong move down; prioritize fresh zones in the appropriate context.",
      rule:"Supply and demand are used with structure, liquidity, narrative, and confirmation rather than alone."
    },
    confirmation:{
      required:[
        "Relevant area",
        "Relevant liquidity",
        "Liquidity taken when required",
        "Market-structure shift / CHoCH",
        "Momentum or displacement",
        "Narrative alignment",
        "Valid risk-to-reward"
      ],
      executionTimeframes:["15M","5M"],
      rule:"If the required confirmation is not present, wait."
    },
    invalidation:{
      conditions:strategy.technicalAnalysis.invalidation.slice(),
      rule:"If the trade idea is invalidated, do not force the setup. Reassess."
    },
    personalRules:{
      riskPerTrade:strategy.risk.maxRiskPerTrade,
      minimumRiskReward:strategy.risk.minimumRiskReward,
      minimumWinRate:strategy.risk.minimumWinRate,
      dailyLimits:strategy.rules.limits.slice(),
      nonNegotiable:strategy.rules.nonNegotiable,
      noTradeRule:strategy.technicalAnalysis.noTradeRule
    }
  };

  phase2.validateSetup = function(input={}){
    const has = key => input[key] === true;
    const checks = [
      {id:"marketStructure",label:"Market structure defined",pass:has("marketStructure")},
      {id:"liquidity",label:"Relevant liquidity identified",pass:has("liquidity")},
      {id:"supplyDemand",label:"Relevant supply/demand or key area identified",pass:has("supplyDemand")},
      {id:"topDown",label:"Top-down context aligned",pass:has("topDown")},
      {id:"confirmation",label:"Required confirmation present",pass:has("confirmation")},
      {id:"riskReward",label:"Risk-to-reward is acceptable",pass:has("riskReward")},
      {id:"invalidation",label:"Invalidation is defined",pass:has("invalidation")}
    ];
    const missing = checks.filter(check=>!check.pass).map(check=>check.id);
    return {
      valid:missing.length===0,
      checks,
      missing,
      action:missing.length===0?"READY FOR REVIEW":"WAIT",
      rule:"This checklist validates the Phase 2 conditions only; it does not create a Phase 3 scenario or replace the trader's judgment."
    };
  };

  phase2.getSystem = function(){
    return JSON.parse(JSON.stringify(phase2));
  };

  strategy.phase2 = phase2;
  if(ASTRA.registerModule) ASTRA.registerModule("tradingPhase2",phase2);
  else ASTRA.modules.tradingPhase2 = phase2;

  console.log("ASTRA Phase 2 Personal Trading System loaded");
})();
