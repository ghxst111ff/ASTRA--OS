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
        "Once I have mapped where I want to buy and sell, I can look for opportunities within the price movement between those areas.",
        "Sell-to-buy opportunities",
        "Buy-to-sell opportunities",
        "Other valid fractal setups within my overall market map",
        "I follow the bigger picture, but I stay flexible and let lower-timeframe price action show me the opportunities."
      ]
    },

    risk:{
      maxRiskPerTrade:"1% of account",
      minimumRiskReward:"1:3",
      minimumWinRate:"30%",
      maxDailyLossLimit:"Not specified",
      maxWeeklyDrawdown:"Not specified",
      positionSizingMethod:"Not specified"
    },

    technicalAnalysis:{
      primarySetup:[
        "My primary setup is based on fractal price action and dynamic market delivery.",
        "I use top-down analysis to build a market map, identify where price is likely to deliver, and locate areas where I am interested in buying or selling.",
        "I then look for valid opportunities within that larger market narrative.",
        "Sell-to-buy opportunities",
        "Buy-to-sell opportunities",
        "Opportunities developing as price delivers between higher-timeframe areas",
        "I use market structure, supply and demand, liquidity, momentum, and price delivery across multiple timeframes."
      ],
      entrySignals:[
        "Price reaching a relevant area",
        "Relevant liquidity being present",
        "Liquidity being taken when required",
        "A shift or confirmation in market structure",
        "Change of Character (CHoCH)",
        "Displacement or momentum confirming the move",
        "Price action aligning with my current market narrative",
        "A valid risk-to-reward opportunity"
      ],
      waitRule:"If the conditions are not present, I wait.",
      tools:[
        "Price action",
        "Market structure",
        "Higher highs and higher lows",
        "Lower highs and lower lows",
        "Break of Structure (BOS)",
        "Change of Character (CHoCH)",
        "Supply and demand zones",
        "Liquidity",
        "Equal highs and equal lows",
        "Market momentum",
        "Displacement",
        "Imbalances",
        "Fractal analysis",
        "Multi-timeframe analysis"
      ],
      invalidation:[
        "Price action no longer supports my market narrative",
        "Market structure contradicts my trade idea",
        "Price fails to give my required confirmation",
        "The relevant area or supply/demand zone is invalidated",
        "Liquidity behaves differently from my trade idea",
        "The risk-to-reward is no longer acceptable",
        "The market conditions change before entry"
      ],
      noTradeRule:"If any required condition is missing, I do not trade. If I have to convince myself to take the trade, it's a no."
    },

    liquidity:{
      definition:"Liquidity refers to areas where a large number of orders are likely resting.",
      focus:["Equal highs","Equal lows","Ascending trend lines","Descending trend lines","Liquidity around supply and demand zones"],
      equalHighs:"I do not automatically sell just because price forms equal highs or reaches resistance. Price may first move above the highs, sweep the liquidity, and then reverse.",
      equalLows:"I do not automatically buy just because price forms equal lows or reaches support. Price may first move below the lows, sweep the liquidity, and then reverse.",
      trendLines:"Trend lines can create liquidity through entries, stop losses, and breakout orders. Price may move through a trend line, trigger liquidity on both sides, and then reverse.",
      aroundZones:"I consider liquidity when analyzing supply and demand zones. If equal highs form inside or around a supply zone, I do not automatically sell. Those highs may be taken before the sell move. If equal lows form inside or around a demand zone, I do not automatically buy. I also consider whether another supply or demand area beyond the current zone may draw price first.",
      standardConfirmation:{
        sell:"Higher highs and higher lows → bearish structural shift → lower low → retracement to the lower high → sell.",
        buy:"Lower lows and lower highs → bullish structural shift → higher high → retracement to the higher low → buy.",
        rule:"I do not assume that a supply or demand zone will immediately cause a reversal. I first consider the liquidity around the area and look for a clear shift in market control before entering."
      }
    },

    timeframeFlow:{
      sameFlow:[
        "Market Structure — What is price doing?",
        "Narrative / Delivery — Where is price coming from and where is it likely delivering?",
        "Supply and Demand — Where are the important areas?",
        "Liquidity — Where is liquidity resting and what liquidity may price target?",
        "Opportunity — Is there a valid buy-to-sell or sell-to-buy opportunity?",
        "Confirmation — Does price action confirm the opportunity?",
        "Invalidation — What would prove my idea wrong?"
      ],
      roles:{
        weeklyDaily:"Use the same flow to understand the bigger direction",
        fourHour:"Use the same flow to build the main market narrative",
        oneHourThirtyMinute:"Use the same flow to identify fractal opportunities",
        fifteenMinuteFiveMinute:"Use the same flow to confirm and execute trades"
      },
      principle:"The higher timeframes give me the map. The lower timeframes reveal the opportunities."
    },

    tradeManagement:{
      stopLossPlacement:"Trailing stop only — no fixed stop loss",
      entryExecution:"Not further specified on the original page",
      takeProfitMethod:"Not further specified on the original page",
      scalingRules:"Not further specified on the original page",
      breakevenRules:"Not further specified on the original page"
    },

    rules:{
      limits:["Loss limit per day: 2 trades","Win limit per day: 3 trades","Trades per week: 10 trades"],
      nonNegotiable:"Never break these rules. If a trade doesn't meet all criteria, pass."
    },

    psychology:{
      readiness:[
        "Did I sleep well?",
        "Am I feeling stressed?",
        "Are there any external factors affecting me?",
        "Am I mentally focused and ready to make good decisions?"
      ],
      readinessRule:"I am paid for the quality of my decisions. If my mindset is not right, my decision-making may not be right.",
      mentalJournal:[
        "What emotions did I feel?",
        "Did those emotions affect my trading?",
        "Did I hesitate?",
        "Did I break any rules?",
        "Did I force any trades?",
        "Did I miss valid trades?",
        "What effect did my mentality have on my results?"
      ],
      patternReview:["What I do well","What I repeatedly do wrong","Emotional patterns","Habits that interfere with good trades","Strengths I should continue","Weaknesses I need to improve"],
      rulesBased:"If this happens → then I do this. If this does not happen → then I wait.",
      coreRule:"My mindset is part of my trading system. Before I trade, I check my readiness. After I trade, I review my mentality. During trading, I follow my rules."
    },

    confirmationEntry:{
      bullish:[
        "The market is initially bearish, creating lower lows and lower highs.",
        "A significant low forms.",
        "Price drives strongly upward and breaks above the final lower high.",
        "Price creates a higher high, confirming a potential shift from bearish to bullish.",
        "The break should show strong momentum and candle closes above the previous high, not only a wick.",
        "I identify the demand zone as the last candle before the bullish impulse.",
        "I place a buy entry at the demand zone when price returns to it.",
        "My stop loss goes below the significant low.",
        "My target is placed at the next relevant supply zone or another logical market target."
      ],
      bearish:[
        "The market is initially bullish, creating higher highs and higher lows.",
        "A significant high forms.",
        "Price drives strongly downward and breaks below the final higher low.",
        "Price creates a lower low, confirming a potential shift from bullish to bearish.",
        "The break should show strong momentum and candle closes below the previous low.",
        "I identify the supply zone as the last candle before the bearish impulse.",
        "I place a sell entry at the supply zone when price returns to it.",
        "My stop loss goes above the significant high.",
        "My target is placed at the next relevant demand zone or another logical market target."
      ],
      context:"The strongest confirmation entries occur when the lower-timeframe confirmation agrees with the higher-timeframe narrative. The higher timeframe gives me the context. The lower timeframe gives me the confirmation."
    },

    supplyDemand:{
      demand:"Consolidation before a strong move up. I look for buying opportunities when price returns to a fresh demand zone.",
      supply:"Consolidation before a strong move down. I look for selling opportunities when price returns to a fresh supply zone.",
      trend:"In an uptrend, I focus on demand. In a downtrend, I focus on supply.",
      freshness:"I give priority to fresh, untested zones. After a zone has been retested, I do not treat it as a fresh setup.",
      targets:"Supply can be a target for buys, and demand can be a target for sells.",
      context:"I do not blindly trade every zone. I use supply and demand with structure, liquidity, narrative, and confirmation.",
      fractal:"Supply and demand can appear on every timeframe because the market is fractal."
    },

    marketStructure:{
      uptrend:"Higher highs + higher lows = focus on buys.",
      downtrend:"Lower lows + lower highs = focus on sells.",
      consolidation:"No clear direction = avoid trades unless my system gives a valid range opportunity.",
      impulse:"Strong move in the trend direction.",
      correction:"Pullback against the trend.",
      trendLines:"A trend-line break alone does not mean the trend has changed. I use significant highs and lows.",
      swing:"The larger market waves that give me context.",
      substructure:"Smaller trends forming inside the larger swing structure. Because the market is fractal, these can create additional opportunities inside corrections.",
      shift:"Bearish structure shifting to a higher high can confirm a move toward bullish conditions. Bullish structure shifting to a lower low can confirm a move toward bearish conditions.",
      principle:"I read market structure as waves, not every small candle. The larger structure gives context; the smaller structure can reveal fractal opportunities."
    },

    imbalance:{
      rules:[
        "An imbalance is an open price area left by a strong move.",
        "I expect open imbalances to eventually be filled.",
        "I use imbalances as possible targets and areas where price may be drawn.",
        "If there are multiple imbalances, I pay attention to the deeper or more extreme area.",
        "I do not trade an imbalance by itself. I combine it with structure, supply and demand, liquidity, and confirmation."
      ],
      fractal:"Imbalances are fractal and can be used on every timeframe."
    }
  },

  createNarrative(input={}){
    const value=(key,...aliases)=>{
      for(const k of [key,...aliases]) if(input[k]!==undefined && input[k]!==null && String(input[k]).trim()!=="") return String(input[k]).trim();
      return "";
    };
    const structure=value("structure","marketStructure");
    const delivery=value("delivery","narrative","context");
    const supplyDemand=value("supplyDemand","keyArea","zone","area");
    const liquidity=value("liquidity");
    const opportunity=value("opportunity");
    const confirmation=value("confirmation","trigger");
    const invalidation=value("invalidation","invalidates");
    const missing=[];
    if(!structure) missing.push("market structure");
    if(!delivery) missing.push("narrative / delivery");
    if(!supplyDemand) missing.push("supply and demand / important area");
    if(!liquidity) missing.push("relevant liquidity");
    if(!opportunity) missing.push("valid opportunity");
    if(!confirmation) missing.push("confirmation");
    if(!invalidation) missing.push("invalidation");
    return {
      timeframe:value("timeframe")||null,
      structure,delivery,supplyDemand,liquidity,opportunity,confirmation,invalidation,
      complete:missing.length===0,
      missing,
      decision:missing.length?"WAIT":"READY FOR REVIEW",
      createdAt:new Date().toISOString()
    };
  },

  validateNarrative(input={}){
    const narrative=this.createNarrative(input);
    const corrections=[];
    if(!narrative.structure) corrections.push("What is price doing structurally?");
    if(!narrative.delivery) corrections.push("Where is price coming from and where is it likely delivering?");
    if(!narrative.supplyDemand) corrections.push("Where are the important supply or demand areas?");
    if(!narrative.liquidity) corrections.push("Where is relevant liquidity resting and what may price target?");
    if(!narrative.opportunity) corrections.push("Is there a valid buy-to-sell or sell-to-buy opportunity?");
    if(!narrative.confirmation) corrections.push("Does price action give the required confirmation?");
    if(!narrative.invalidation) corrections.push("What would prove the idea wrong?");
    return {...narrative,corrections};
  },

  decide(narrative, observation={}){
    const n=this.validateNarrative(narrative||{});
    if(!n.complete) return {action:"WAIT",reason:"A required condition is missing.",missing:n.missing};
    if(observation.invalidated===true) return {action:"STAY OUT / REASSESS",reason:"The setup has been invalidated."};
    if(!(observation.confirmationMet===true || observation.confirmed===true)) return {action:"WAIT",reason:"The narrative exists, but the required confirmation is not present yet."};
    return {action:"SETUP VALID FOR REVIEW",reason:"The market narrative, area, liquidity, opportunity, confirmation, and invalidation are defined."};
  },

  show(){
    AstraReply("Jay's original detailed trading strategy is loaded. ASTRA now follows the full system: foundation and daily routine, dynamic fractal analysis, risk rules, market structure, supply and demand, liquidity, imbalance, timeframe flow, confirmation entries, psychology, trade limits, and the rule that missing conditions mean wait.");
  }
};

ASTRA.registerModule("trading",TradingModule);
ASTRA.modules.tradingBrain=TradingModule;

ASTRA.commands.push({trigger:"show strategy",action(){TradingModule.show();}});
ASTRA.commands.push({trigger:"my trading system",action(){TradingModule.show();}});

console.log("ASTRA Trading Strategy Module v3.0 Loaded — Original Detailed Strategy");
