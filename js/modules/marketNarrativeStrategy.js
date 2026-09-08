/* =========================================
   ASTRA MARKET NARRATIVE STRATEGY EXTENSION
   Adds Jay's Market Narrative & Top-Down Analysis
   to the original detailed Trading Strategy without
   replacing the rest of the strategy.
========================================= */
(function(){
  if(!window.ASTRA || !ASTRA.modules || !ASTRA.modules.trading) return;
  const strategy=ASTRA.modules.trading.strategy;
  const narrative={
    purpose:[
      "My analysis is a reactive, rule-based process.",
      "I do not try to predict exactly what the market will do.",
      "I build a market narrative, create if-this-then-that scenarios, and wait for price and confirmation.",
      "My narrative can be refreshed when new price action changes the story."
    ],
    fractalAnalysisFlow:[
      "Market Structure — What is price doing?",
      "Narrative / Delivery — Where is price coming from and where may it deliver?",
      "Supply and Demand — Where are the important areas?",
      "Liquidity — Where is liquidity resting and what may price target?",
      "Opportunity — Is there a valid buy-to-sell or sell-to-buy opportunity?",
      "Confirmation — Does price action confirm the opportunity?",
      "Invalidation — What would prove my idea wrong?"
    ],
    timeframes:{
      weekly:{role:"Narrative starting point — not execution",rules:["Identify the most recent significant leg of price.","Define the broader trading range and important areas.","Mark major supply, demand, liquidity, and potential directional objectives.","Build the initial weekly context and if-this-then-that scenarios.","Look left for potential upside or downside targets that may matter during the week.","I do not trade from the Weekly timeframe."]},
      daily:{role:"Refine the narrative — not execution",rules:["Refine the Weekly context.","Identify important points of interest.","Mark liquidity, supply and demand, and imbalances.","Identify where price may be drawn.","Build if-this-then-that scenarios."]},
      fourHour:{role:"Build the main trading narrative",rules:["Read the current market structure.","Identify the main direction and delivery.","Identify structural shifts and important areas of interest.","Build the main trading scenarios."]},
      oneHourThirtyMinute:{role:"Find fractal opportunities",rules:["Look inside the larger narrative for smaller opportunities.","Apply the same analysis flow.","Identify short-term moves, pullbacks, liquidity, and areas of interest."]},
      fifteenMinuteFiveMinute:{role:"Confirmation and execution",rules:["Wait for price to reach a planned area of interest.","Check liquidity and structure.","Wait for confirmation.","Enter only when my trading rules are satisfied.","15M is my primary confirmation timeframe.","5M is used for entry refinement or direct confirmation."]}
    },
    scenarioRules:[
      "If price reaches this area, then I watch for this reaction.",
      "If liquidity is taken and structure confirms, then I look for an entry.",
      "If confirmation does not appear, then I do not trade.",
      "If my setup is invalidated, then the trade idea is invalid."
    ],
    narrativeRefresh:{
      purpose:"The initial narrative is a working story, not a permanent prediction.",
      triggers:[
        "Price develops differently from the current scenario.",
        "Market structure changes.",
        "A planned area is reached and the reaction changes the story.",
        "Liquidity behaves differently from the expectation.",
        "A key narrative condition is invalidated."
      ],
      process:[
        "Pause the old scenario instead of forcing it.",
        "Re-read the current market structure and delivery.",
        "Reassess supply and demand, liquidity, and important targets.",
        "Update the if-this-then-that scenarios from the new information.",
        "Only continue toward a setup when the refreshed narrative supports it.",
        "If the refreshed narrative does not support a trade, wait or stay out."
      ],
      rule:"Never force an old narrative after price has invalidated or materially changed it."
    },
    coreRule:"Higher timeframes build the story. Lower timeframes reveal opportunities. The 15M and 5M provide confirmation for execution."
  };
  strategy.marketNarrative=narrative;
  strategy.foundation.timeframes="Weekly → Daily → 4H → 1H/30M → 15M/5M, with the same fractal analysis flow on every timeframe";
  strategy.foundation.process=[
    "Build the market narrative from the higher timeframe down.",
    "Weekly establishes the narrative starting point: recent significant leg, trading range, important areas, directional objectives, and initial if-this-then-that scenarios.",
    "Look left on the Weekly chart for potential upside or downside targets that may matter during the week.",
    "Daily refines the context with liquidity, supply and demand, imbalances, and points of interest.",
    "4H builds the main market narrative and scenarios.",
    "1H and 30M reveal fractal opportunities inside the larger narrative.",
    "15M and 5M provide confirmation and execution.",
    "At every timeframe, follow the same flow: structure → narrative/delivery → supply and demand → liquidity → opportunity → confirmation → invalidation.",
    "Do not predict blindly. Build if-this-then-that scenarios and react only when conditions are met.",
    "Refresh the narrative when new price action materially changes the story; never force the old scenario."
  ];
  strategy.foundation.keyPrinciple=narrative.coreRule;
  strategy.timeframeFlow={
    sameFlow:narrative.fractalAnalysisFlow,
    roles:{
      weekly:"Narrative starting point: recent significant leg, range, objectives and scenarios — no execution",
      daily:"Refine the Weekly context and build scenarios — no execution",
      fourHour:"Build the main trading narrative",
      oneHourThirtyMinute:"Find fractal opportunities inside the larger narrative",
      fifteenMinuteFiveMinute:"Confirmation and execution"
    },
    principle:narrative.coreRule,
    scenarioRules:narrative.scenarioRules,
    narrativeRefresh:narrative.narrativeRefresh
  };
  strategy.technicalAnalysis.primarySetup.unshift(
    "My market narrative is built top-down: Weekly context and scenarios → Daily refinement → 4H main narrative → 1H/30M fractal opportunities → 15M/5M confirmation and execution.",
    "I refresh my narrative when new price action materially changes the story instead of forcing the original scenario.",
    "I use if-this-then-that scenarios instead of blind predictions."
  );
  console.log("ASTRA Market Narrative Strategy loaded into Jay's original detailed Trading Strategy");
})();
