/* =========================================
   ASTRA PROACTIVE MARKET OBSERVER v2.0
   Conversational chart co-pilot
========================================= */

const ProactiveMarketObserver=(()=>{
    let watching=false,timer=null,visionTimer=null,lastObservation=null,lastSignature="",lastVisionAt=0;
    const CONFIG={intervalMs:5000,visionIntervalMs:20000,cooldownMs:15000};

    function strategy(){return ASTRA.modules.trading?.strategy||{};}
    function getScreenAnalysis(){const s=ASTRA.modules.screen;return s?.getAnalysis?.()||null;}
    function getFrame(){return ASTRA.modules.screen?.getFrame?.({maxWidth:1280,quality:.55})||null;}

    function buildObservation(analysis){
        if(!analysis||analysis.ready===false)return null;
        const observations=[];
        if(analysis.liquidity)observations.push({type:"liquidity",message:"I’m seeing a liquidity-related area. I’m checking it against your liquidity model."});
        if(analysis.structure||analysis.structureShift)observations.push({type:"structure",message:"I’m seeing a potential structure change. Compare it with your higher-timeframe context before treating it as an execution signal."});
        return {observations,framework:strategy().framework||{},rules:strategy().rules||[],timestamp:Date.now()};
    }

    function speakLocal(observation){
        if(!observation?.observations?.length)return false;
        const signature=observation.observations.map(o=>o.type).join("|");
        if(signature===lastSignature&&Date.now()-lastObservation.timestamp<CONFIG.cooldownMs)return false;
        lastSignature=signature; lastObservation=observation;
        if(typeof AstraReply==="function")AstraReply(observation.observations[0].message);
        return true;
    }

    async function visionCheck(){
        if(!watching||Date.now()-lastVisionAt<CONFIG.visionIntervalMs)return null;
        const image=getFrame(); if(!image||!ASTRA.modules.ai?.ask)return null;
        lastVisionAt=Date.now();
        const rules=strategy().rules||[];
        const framework=strategy().framework||{};
        try{
            return await ASTRA.modules.ai.ask(
                "Act as my proactive trading co-pilot. Inspect the current chart image. Do not invent anything. Only speak if you can identify a meaningful, visible observation relevant to my trading system, such as a possible liquidity pool/sweep, supply or demand area, market-structure shift, displacement, or a conflict with my stated rules. If the image is insufficient, say nothing useful rather than guessing. Keep the observation concise and conversational.",
                {vision:true,image,context:{observerMode:true,tradingFramework:framework,tradingRules:rules}}
            );
        }catch(error){console.warn("ASTRA observer vision check failed",error);return null;}
    }

    async function observe(){
        const local=buildObservation(getScreenAnalysis());
        if(local)speakLocal(local);
        return visionCheck();
    }

    function start(){
        if(watching)return status();
        watching=true; observe();
        timer=setInterval(observe,CONFIG.intervalMs);
        return status();
    }
    function stop(){watching=false;if(timer)clearInterval(timer);timer=null;lastSignature="";return status();}
    function status(){return {watching,intervalMs:CONFIG.intervalMs,visionIntervalMs:CONFIG.visionIntervalMs,lastObservation};}
    return {name:"Proactive Market Observer",version:"2.0",start,stop,observe,status};
})();
ASTRA.modules.proactiveMarketObserver=ProactiveMarketObserver;
console.log("ASTRA Proactive Market Observer v2.0 Loaded");
