/* =========================================
   ASTRA TRADING STRATEGY MODULE v2.0
   Jay's personal trading framework + narrative engine
========================================= */

const TradingModule = {
  name:"Jay Fractal Market Delivery System",
  version:"2.0",

  strategy:{
    philosophy:[
      "Markets are fractal.",
      "Price action repeats across all timeframes.",
      "Supply, demand, liquidity, and structure exist on every timeframe.",
      "A trader should adapt to market delivery instead of forcing a trading style.",
      "A bias is a narrative, not a prediction. It must have confirmation, invalidation, and an alternative scenario."
    ],

    framework:{
      higherTimeframe:[
        "Start analysis from higher timeframe.",
        "Identify market direction and current delivery.",
        "Identify major market structure.",
        "Find relevant supply and demand zones.",
        "Mark meaningful liquidity.",
        "Build the narrative before looking for an entry."
      ],
      fractalScaling:[
        "Drop into lower timeframes only after the higher-timeframe narrative is clear.",
        "Look for smaller opportunities inside the larger move.",
        "Lower-timeframe movements can create entries before higher-timeframe targets are reached.",
        "Keep lower-timeframe decisions connected to the bigger context."
      ],
      execution:[
        "Identify the higher-timeframe objective.",
        "Wait for the relevant lower-timeframe structure shift.",
        "Use liquidity and confirmation for entry.",
        "Know what invalidates the idea before entering.",
        "Execute only when the setup aligns.",
        "If the required conditions are absent, do nothing."
      ]
    },

    narrativeFramework:{
      steps:[
        "Context: What is price doing and where is it in the larger delivery?",
        "Structure: What is the current higher-timeframe and lower-timeframe structure?",
        "Liquidity: What liquidity is relevant and what could price be seeking?",
        "Key areas: What supply, demand, or other marked area matters?",
        "Objective: Where is the current narrative expecting price to seek next?",
        "Confirmation: What specifically must happen before a trade is valid?",
        "Invalidation: What proves the current idea is wrong?",
        "Alternative: If the primary narrative fails, what is the next valid scenario?",
        "Decision: Trade, wait, or stay out."
      ],
      decisionRule:"Every idea must be expressed as conditions: IF this happens, THEN do that. If the condition does not happen, do not force the action."
    },

    rules:[
      "Always start from higher timeframe.",
      "Never trade lower timeframe without context.",
      "Liquidity guides price movement.",
      "Structure confirms direction.",
      "Do not force trades.",
      "Risk management comes first.",
      "Do not enter without your required confirmation.",
      "Know the invalidation before entering.",
      "If the narrative changes, update the plan instead of defending the old bias.",
      "If none of the conditions are present, wait. No setup is a valid decision."
    ]
  },

  createNarrative(input={}){
    const value=(key,...aliases)=>{
      for(const k of [key,...aliases]) if(input[k]!==undefined && input[k]!==null && String(input[k]).trim()!=="") return String(input[k]).trim();
      return "";
    };
    const context=value("context","higherTimeframeContext","htfContext");
    const structure=value("structure","marketStructure");
    const liquidity=value("liquidity");
    const keyArea=value("keyArea","zone","area");
    const objective=value("objective","target");
    const confirmation=value("confirmation","trigger");
    const invalidation=value("invalidation","invalidates");
    const alternative=value("alternative","alternativeScenario");
    const conditions=Array.isArray(input.ifThen)?input.ifThen:[];
    const missing=[];
    if(!context) missing.push("higher-timeframe context");
    if(!structure) missing.push("market structure");
    if(!liquidity) missing.push("relevant liquidity");
    if(!keyArea) missing.push("key area");
    if(!objective) missing.push("objective");
    if(!confirmation) missing.push("confirmation");
    if(!invalidation) missing.push("invalidation");
    return {
      pair:value("pair")||null,
      timeframe:value("timeframe")||null,
      context,structure,liquidity,keyArea,objective,confirmation,invalidation,alternative,
      ifThen:conditions,
      complete:missing.length===0,
      missing,
      decision:missing.length?"WAIT":"READY FOR REVIEW",
      createdAt:new Date().toISOString()
    };
  },

  validateNarrative(input={}){
    const narrative=this.createNarrative(input);
    const corrections=[];
    if(!narrative.context) corrections.push("You have not established the higher-timeframe context yet.");
    if(!narrative.structure) corrections.push("Market structure still needs to be stated clearly.");
    if(!narrative.liquidity) corrections.push("Relevant liquidity has not been identified.");
    if(!narrative.keyArea) corrections.push("The key area has not been defined.");
    if(!narrative.objective) corrections.push("The market objective is unclear.");
    if(!narrative.confirmation) corrections.push("You have not said what confirms the trade.");
    if(!narrative.invalidation) corrections.push("You have not defined what invalidates the idea.");
    return {...narrative,corrections};
  },

  decide(narrative, observation={}){
    const n=this.validateNarrative(narrative||{});
    if(!n.complete) return {action:"WAIT",reason:"Narrative is incomplete.",missing:n.missing};
    const confirmationMet=observation.confirmationMet===true || observation.confirmed===true;
    const invalidated=observation.invalidated===true;
    if(invalidated) return {action:"STAY OUT / REASSESS",reason:"The stated invalidation condition occurred."};
    if(!confirmationMet) return {action:"WAIT",reason:"The narrative exists, but confirmation has not occurred yet."};
    return {action:"SETUP VALID FOR REVIEW",reason:"Context, structure, liquidity, key area, objective, confirmation, and invalidation are defined and confirmation is present."};
  },

  show(){
    AstraReply("ASTRA Trading Brain is loaded. We analyze from higher timeframes, build a market narrative, identify structure, liquidity and key areas, define the objective, confirmation and invalidation, then create clear if-this-then-that scenarios. If the conditions are not present, we wait.");
  }
};

ASTRA.registerModule("trading",TradingModule);
ASTRA.modules.tradingBrain=TradingModule;

ASTRA.commands.push({trigger:"show strategy",action(){TradingModule.show();}});
ASTRA.commands.push({trigger:"my trading system",action(){TradingModule.show();}});

console.log("ASTRA Trading Strategy Module v2.0 Loaded");
