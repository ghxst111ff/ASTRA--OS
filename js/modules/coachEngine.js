/* =========================================
   ASTRA COACH ENGINE v1.0
   70% coach / 30% assistant
========================================= */
const CoachEngine=(()=>{
    const KEY="ASTRA_COACH_STATE";
    const blank=()=>({
        activeState:"marking_up",
        market:{pair:null,timeframe:null,session:null,lastAction:null,lastUpdated:null,marked:[],plan:null,objective:null},
        stateHistory:[],
        lessons:[],
        mistakes:[],
        setups:[],
        observations:[],
        guardrails:[],
        lastResume:null
    });
    let data={...blank(),...(JSON.parse(localStorage.getItem(KEY)||"null")||{})};
    data.market={...blank().market,...(data.market||{})};
    function save(){localStorage.setItem(KEY,JSON.stringify(data));}
    function now(){return new Date().toISOString();}
    function setState(state,meta={}){
        const allowed=["marking_up","backtesting","planning","live_trading","reviewing","journaling"];
        const normalized=String(state||"").toLowerCase().replace(/\s+/g,"_");
        if(!allowed.includes(normalized))return {ok:false,states:allowed};
        data.activeState=normalized;
        data.stateHistory.push({state:normalized,time:now(),meta});
        data.stateHistory=data.stateHistory.slice(-50); save();
        return {ok:true,state:normalized};
    }
    function updateMarket(patch={}){
        data.market={...data.market,...patch,lastUpdated:now()};
        save(); return {...data.market};
    }
    function mark(item){if(!item)return false;data.market.marked.push({item,time:now()});data.market.marked=data.market.marked.slice(-100);save();return true;}
    function setPlan(plan,objective){data.market.plan=plan||data.market.plan;data.market.objective=objective||data.market.objective;data.market.lastAction="plan updated";save();return resume();}
    function addLesson(lesson){if(!lesson)return false;data.lessons.push({lesson,time:now()});data.lessons=data.lessons.slice(-100);save();return true;}
    function addMistake(mistake){if(!mistake)return false;const text=String(mistake).trim();const existing=data.mistakes.find(x=>x.text.toLowerCase()===text.toLowerCase());if(existing)existing.count++;else data.mistakes.push({text,count:1,lastSeen:now()});if(existing)existing.lastSeen=now();save();return true;}
    function addSetup(setup){if(!setup)return false;data.setups.push({...setup,time:now()});data.setups=data.setups.slice(-200);save();return true;}
    function addObservation(observation){if(!observation)return false;data.observations.push({observation,time:now()});data.observations=data.observations.slice(-100);save();return true;}
    function validateSetup(setup={}){
        const strategy=ASTRA.modules.trading?.strategy||{};
        const rules=strategy.rules||[];
        const checks=[];
        const has=(key)=>setup[key]===true||setup[key]===1||String(setup[key]||"").toLowerCase()==="yes";
        checks.push({name:"Higher-timeframe context",ok:has("higherTimeframe")||has("context")});
        checks.push({name:"Liquidity",ok:has("liquidity")});
        checks.push({name:"Structure",ok:has("structure")});
        checks.push({name:"Confirmation",ok:has("confirmation")||has("structureShift")});
        checks.push({name:"Risk",ok:has("risk")});
        const passed=checks.filter(c=>c.ok).length;
        const status=passed===checks.length?"ALIGNED":passed>=3?"PARTIALLY ALIGNED":"NOT ALIGNED";
        const result={status,score:Math.round(passed/checks.length*100),checks,rules};
        addSetup({type:"validation",...result});
        return result;
    }
    function backtestInsight(){
        const bt=ASTRA.modules.backtesting?.getTrades?.()||[];
        if(!bt.length)return {ready:false,message:"No backtest trades yet."};
        const wins=bt.filter(t=>Number(t.pnl)>0),losses=bt.filter(t=>Number(t.pnl)<0);
        const bySide={};
        bt.forEach(t=>{const k=String(t.side||"unknown").toLowerCase();bySide[k]??=[];bySide[k].push(t);});
        const best=Object.entries(bySide).sort((a,b)=>b[1].reduce((s,t)=>s+Number(t.pnl||0),0)-a[1].reduce((s,t)=>s+Number(t.pnl||0),0))[0];
        return {ready:true,trades:bt.length,winRate:Math.round(wins.length/bt.length*100),netPnl:bt.reduce((s,t)=>s+Number(t.pnl||0),0),bestSide:best?best[0]:null};
    }
    function performanceInsight(){
        const p=ASTRA.modules.performance?.getData?.()||{};
        const trades=Array.isArray(p.trades)?p.trades:[];
        const mistakes=data.mistakes.slice().sort((a,b)=>b.count-a.count).slice(0,3);
        return {trades:trades.length,wins:Number(p.wins||0),losses:Number(p.losses||0),winRate:trades.length?Math.round(Number(p.wins||0)/trades.length*100):0,topMistakes:mistakes};
    }
    function resume(){
        const m=data.market;
        const result={state:data.activeState,pair:m.pair,timeframe:m.timeframe,session:m.session,marked:m.marked.slice(-10),plan:m.plan,objective:m.objective,lastAction:m.lastAction,lastUpdated:m.lastUpdated,lessons:data.lessons.slice(-5),topMistakes:data.mistakes.slice().sort((a,b)=>b.count-a.count).slice(0,5)};
        data.lastResume=result;save();return result;
    }
    function buildContext(){
        return {coach:{role:"70% coach / 30% assistant",state:data.activeState,market:resume(),topMistakes:data.mistakes.slice().sort((a,b)=>b.count-a.count).slice(0,5),recentLessons:data.lessons.slice(-5),recentObservations:data.observations.slice(-5),backtest:backtestInsight(),performance:performanceInsight(),instruction:"Use this as persistent user state. Do not invent missing details. In trading conversations, coach from the user's actual trading system and current state. Keep backtesting separate from live trading. If a state or market detail is missing, ask briefly rather than guessing."}};
    }
    function naturalResume(){
        const r=resume();
        const pair=r.pair||"the last market"; const tf=r.timeframe?` on ${r.timeframe}`:"";
        const marked=r.marked.length?`${r.marked.length} recent mark${r.marked.length===1?"":"s"}`:"no saved marks yet";
        return `We were on ${pair}${tf}. You had ${marked}. State: ${r.state.replace(/_/g," ")}.`;
    }
    return {name:"ASTRA Coach Engine",version:"1.0",setState,updateMarket,mark,setPlan,addLesson,addMistake,addSetup,addObservation,validateSetup,backtestInsight,performanceInsight,resume,naturalResume,buildContext,status:()=>({state:data.activeState,market:data.market,marks:data.market.marked.length,lessons:data.lessons.length,mistakes:data.mistakes.length})};
})();
ASTRA.modules.coach=CoachEngine;
ASTRA.commands.push({trigger:"where were we",action:()=>AstraReply(CoachEngine.naturalResume())});
ASTRA.commands.push({trigger:"coach status",action:()=>AstraReply(JSON.stringify(CoachEngine.status()))});
ASTRA.commands.push({trigger:"validate setup",action:()=>AstraReply(JSON.stringify(CoachEngine.validateSetup()))});
console.log("ASTRA Coach Engine v1.0 Loaded");
