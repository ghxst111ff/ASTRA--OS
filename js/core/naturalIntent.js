/* =========================================
   ASTRA NATURAL INTENT ENGINE v2.1
   Universal conversational routing
========================================= */
const NaturalIntent=(()=>{
const intents=[
{name:"observer_start",words:["watch my chart","watch the chart","watch my screen","keep an eye on my chart","watch while i trade","watch while im trading","watch this with me","monitor my chart"]},
{name:"observer_stop",words:["stop watching","stop watching my chart","stop watching the chart","you can stop watching","stop monitoring"]},
{name:"observer_observe",words:["what are you seeing","what do you see","see anything","notice anything","did i miss anything","am i missing anything","anything i missed","what did you notice","do you notice anything","have you seen my screen","have you seen my shared screen","can you see my screen","can you see my shared screen","what can you see on my screen","what do you see on my shared screen","did you see my share tab","can you see the share tab"]},
{name:"live_trading_progress",words:["live trading progress","live trading performance","how am i doing live","how are my live trades","how is my live trading going","how have i been trading live","how am i doing in live trading"]},
{name:"backtesting_progress",words:["backtesting progress","backtest progress","backtesting performance","how is my backtesting going","how am i doing in backtesting","how is the backtest going","how are my backtests"]},
{name:"trader_profile",words:["trader profile","trading profile","trading journey","how am i doing as a trader","what do you know about how i trade","what patterns do you see in my trading"]},
{name:"journal_review",words:["review my journal","look at my journal","what is in my journal","what have i been doing in my trades","what have i been doing wrong in my trades","look at my trade history","what have i traded"]},
{name:"screen_analysis",words:["look at my chart","analyze my chart","analyse my chart","look at my screen","what am i looking at","what is happening on my chart","analyze what im looking at","look at this chart"]},
{name:"screen_open",words:["open screen view","open my screen","start screen sharing","share my screen","turn on screen view","let me show you my screen"]},
{name:"screen_close",words:["close screen view","stop screen sharing","stop sharing my screen","turn off screen view"]},
{name:"voice_start",words:["start listening","start voice","turn on voice","listen to me","activate voice","start listening to me"]},
{name:"voice_stop",words:["stop listening","stop voice","turn off voice","mute yourself"]},
{name:"memory",words:["what do you remember","what do you know about me","remember this","save this","forget this","do you remember"]},
{name:"performance",words:["how is my performance","how am i performing","show my performance","what is my win rate","how is my equity","what are my stats","my statistics"]},
{name:"risk",words:["how is my risk","am i taking too much risk","what is my risk","check my risk","risk management","position size","drawdown"]},
{name:"psychology",words:["how is my psychology","am i getting emotional","am i emotional","how is my mindset","am i being disciplined","my discipline","trading psychology"]},
{name:"strategy",words:["what does my strategy say","does this fit my system","does this fit my trading system","what is my trading system","what are my trading rules","how do i trade","how am i supposed to trade"]},
{name:"api_status",words:["is the api working","is the api connected","is everything connected","is the gateway working","check the api","check my connection"]},
{name:"module_status",words:["are your modules working","what modules are online","is everything working","system status","how is astra doing","are you working properly"]}
];
function normalize(message){return String(message||"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9\s?]/g," ").replace(/\s+/g," ").trim();}
function score(text,phrase){if(text.includes(phrase))return phrase.length>12?1:.8;const words=phrase.split(" ").filter(Boolean);const hits=words.filter(w=>text.includes(w)).length;return hits/Math.max(words.length,1)*.65;}
function resolve(message){const text=normalize(message);if(!text)return{intent:"empty",confidence:1};let best={intent:"conversation",confidence:0};for(const candidate of intents){const confidence=Math.max(...candidate.words.map(p=>score(text,p)));if(confidence>best.confidence)best={intent:candidate.name,confidence};}if(best.confidence<.62)return{intent:"conversation",confidence:.5};return best;}
function handle(message){const result=resolve(message),m=ASTRA.modules;switch(result.intent){case"observer_start":m.proactiveMarketObserver?.start?.();return true;case"observer_stop":m.proactiveMarketObserver?.stop?.();return true;case"observer_observe":if(m.screen?.sharing&&m.proactiveMarketObserver?.askAboutCurrentScreen){m.proactiveMarketObserver.askAboutCurrentScreen(message);return true;}m.proactiveMarketObserver?.observe?.();return true;case"live_trading_progress":m.traderProfile?.showLive?.();return true;case"backtesting_progress":m.traderProfile?.showBacktesting?.();return true;case"trader_profile":m.traderProfile?.show?.();return true;case"journal_review":m.journal?.show?.();return true;case"screen_analysis":m.screen?.showAnalysis?.();return true;case"screen_open":m.screen?.startCapture?.();return true;case"screen_close":m.screen?.close?.();return true;case"voice_start":m.voice?.start?.();return true;case"voice_stop":m.voice?.stop?.();return true;case"performance":m.performance?.show?.();return true;case"risk":m.risk?.show?.();return true;case"psychology":m.psychology?.show?.();return true;case"strategy":m.trading?.show?.();return true;case"api_status":AstraReply(JSON.stringify(m.api?.status?.()||{configured:false},null,2));return true;case"module_status":AstraReply(JSON.stringify(ASTRA.modules.moduleManager?.list?.()||[],null,2));return true;case"memory":if(m.memory?.show){m.memory.show();return true;}break;}return false;}
return{name:"Natural Intent Engine",version:"2.1",normalize,resolve,handle};})();
ASTRA.registerModule("naturalIntent",NaturalIntent);
console.log("ASTRA Natural Intent Engine v2.1 Loaded");
