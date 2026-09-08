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
      "I build a market narrative, create if-this-then-that scenarios, and wait for price and confirmation."
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
      weekly:{
        role:"Narrative starting point — establish the week's range and scenarios; not execution",
        rules:[
          "Start the narrative-building process on the Weekly timeframe regardless of the execution timeframe.",
          "Focus on the most recent significant leg of price rather than looking too far back at massive long-term trends.",
          "Use the recent swing low to swing high, or swing high to swing low, to define a confined Weekly trading range.",
          "Use the Weekly range to establish directional areas of interest and the initial context for the week.",
          "Mark important supply, demand, liquidity, and potential directional objectives within the Weekly context.",
          "Build if-this-then-that scenarios for the week: pullback and buy/sell, direct move, or break of structure that changes the narrative into the following week.",
          "Look left for potential upside and downside targets so the market map is prepared for larger moves caused by data or news.",
          "The Weekly timeframe establishes the narrative; it is not an execution timeframe."
        ]
      },
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
    coreRule:"Higher timeframes build the story. Lower timeframes reveal opportunities. The 15M and 5M provide confirmation for execution."
  };
  strategy.marketNarrative=narrative;
  strategy.foundation.timeframes="Weekly → Daily → 4H → 1H/30M → 15M/5M, with Weekly establishing the range and opening narrative before lower-timeframe refinement";
  strategy.foundation.process=[
    "Start narrative building on the Weekly timeframe regardless of the execution timeframe.",
    "Use the most recent significant Weekly leg to define a confined trading range and directional areas of interest.",
    "Look left for potential upside and downside targets and prepare scenarios for larger data/news-driven moves.",
    "Build if-this-then-that Weekly scenarios: pullback, direct move, or structure break that changes the narrative.",
    "Daily refines the Weekly context with liquidity, supply and demand, imbalances, and points of interest.",
    "4H builds the main market narrative and scenarios.",
    "1H and 30M reveal fractal opportunities inside the larger narrative.",
    "15M and 5M provide confirmation and execution.",
    "At every timeframe, follow the same flow: structure → narrative/delivery → supply and demand → liquidity → opportunity → confirmation → invalidation.",
    "Do not predict blindly. Build if-this-then-that scenarios and react only when conditions are met."
  ];
  strategy.foundation.keyPrinciple=narrative.coreRule;
  strategy.timeframeFlow={
    sameFlow:narrative.fractalAnalysisFlow,
    roles:{
      weekly:"Narrative starting point: recent leg, Weekly range, directional areas, scenarios, and left-side targets — no execution",
      daily:"Refine the Weekly context and build scenarios — no execution",
      fourHour:"Build the main trading narrative",
      oneHourThirtyMinute:"Find fractal opportunities inside the larger narrative",
      fifteenMinuteFiveMinute:"Confirmation and execution"
    },
    principle:narrative.coreRule,
    scenarioRules:narrative.scenarioRules
  };
  strategy.technicalAnalysis.primarySetup.unshift(
    "My market narrative starts on the Weekly timeframe: recent significant leg → Weekly trading range → directional areas → if-this-then-that scenarios → left-side targets.",
    "My market narrative is built top-down: Weekly context → Daily refinement → 4H main narrative → 1H/30M fractal opportunities → 15M/5M confirmation and execution.",
    "I use if-this-then-that scenarios instead of blind predictions."
  );
  console.log("ASTRA Market Narrative Strategy loaded into Jay's original detailed Trading Strategy");
})();
