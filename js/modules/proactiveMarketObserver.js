/* =========================================
   ASTRA PROACTIVE MARKET OBSERVER v2.2
   Conversational chart co-pilot + coach memory
========================================= */
const ProactiveMarketObserver=(()=>{
    let watching=false,timer=null,visionTimer=null,lastObservation=null,lastSignature="",lastVisionAt=0;
    const CONFIG={intervalMs:5000,visionIntervalMs:20000,cooldownMs:15000};
    const strategy=()=>ASTRA.modules.trading?.strategy||{};
    const getScreenAnalysis=()=>ASTRA.modules.screen?.getAnalysis?.()||null;
    const getFrame=()=>ASTRA.modules.screen?.getFrame?.({maxWidth:1280,quality:.55})||null;
    function buildObservation(analysis){if(!analysis||analysis.ready===false)return null;const observations=[];if(analysis.liquidity)observations.push({type:"liquidity",message:"I’m seeing a liquidity-related area. I’m checking it against your liquidity model."});if(analysis.structure||analysis.structureShift)observations.push({type:"structure",message:"I’m seeing a potential structure change. Compare it with your higher-timeframe context before treating it as an execution signal."});return{observations,framework:strategy().framework||{},rules:strategy().rules||[],timestamp:Date.now()};}
    function speakLocal(observation){if(!observation?.observations?.length)return false;const signature=observation.observations.map(o=>o.type).join("|");if(signature===lastSignature&&lastObservation&&Date.now()-lastObservation.timestamp<CONFIG.cooldownMs)return false;lastSignature=signature;lastObservation=observation;ASTRA.modules.coach?.addObservation?.(observation);ASTRA.modules.coach?.setState?.("marking_up",{source:"screen-observer"});if(typeof AstraReply==="function")AstraReply(observation.observations[0].message);return true;}
    async function askAboutCurrentScreen(question="What do you see on my shared screen?"){const image=getFrame();if(!image)return{ok:false,reason:"no_screen_frame"};const api=ASTRA.modules.ai;if(!api?.ask)return{ok:false,reason:"ai_unavailable"};const rules=strategy().rules||[],framework=strategy().framework||{};try{return await api.ask(question,{vision:true,image,context:{observerMode:true,directScreenQuestion:true,tradingFramework:framework,tradingRules:rules}});}catch(error){console.warn("ASTRA direct screen vision failed",error);AstraReply("I can see that screen sharing is active, but I couldn't send the current frame for visual analysis.");return{ok:false,error:error.message};}}
    async function visionCheck(){if(!watching||Date.now()-lastVisionAt<CONFIG.visionIntervalMs)return null;lastVisionAt=Date.now();const result=await askAboutCurrentScreen("Act as my proactive trading co-pilot. Inspect the current shared chart image. Do not invent anything. Only speak if you can identify a meaningful visible observation relevant to my trading system, such as a possible liquidity pool or sweep, supply or demand area, market-structure shift, displacement, or a conflict with my stated rules. If the image is insufficient, do not guess. Keep the observation concise and conversational.");if(result?.answer)ASTRA.modules.coach?.addObservation?.({type:"vision",answer:result.answer});return result;}
    async function observe(){const local=buildObservation(getScreenAnalysis());if(local)speakLocal(local);return visionCheck();}
    function start(){if(watching)return status();watching=true;ASTRA.modules.coach?.setState?.("marking_up",{source:"screen-watch"});observe();timer=setInterval(observe,CONFIG.intervalMs);return status();}
    function stop(){watching=false;if(timer)clearInterval(timer);timer=null;lastSignature="";return status();}
    function status(){return{watching,screenSharing:!!ASTRA.modules.screen?.sharing,intervalMs:CONFIG.intervalMs,visionIntervalMs:CONFIG.visionIntervalMs,lastObservation};}
    return{name:"Proactive Market Observer",version:"2.2",start,stop,observe,askAboutCurrentScreen,status};
})();
ASTRA.modules.proactiveMarketObserver=ProactiveMarketObserver;
console.log("ASTRA Proactive Market Observer v2.2 Loaded");
