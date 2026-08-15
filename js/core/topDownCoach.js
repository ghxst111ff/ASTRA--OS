/* =========================================
   ASTRA TOP-DOWN COACH v1.1
   Guided timeframe-by-timeframe chart review
========================================= */
const TopDownCoach = (()=>{
    const KEY="ASTRA_TOP_DOWN_SESSION";
    const DEFAULT={active:false,timeframes:["WEEKLY","DAILY","4H","1H","15M"],index:0,completed:[],awaitingReview:false,lastAnalysis:"",lastReview:null,updatedAt:null};
    function load(){try{return {...DEFAULT,...(JSON.parse(localStorage.getItem(KEY))||{})};}catch{return {...DEFAULT};}}
    let state=load();
    function save(){state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));}
    function current(){return state.timeframes[state.index]||null;}
    function normalize(text){return String(text||"").trim().toUpperCase();}
    function isFinished(text){return /\b(i'?m|im|i am|we'?re|we are)\s+(finished|done)\b|\bfinished\s+(analyzing|analysis|with)\b|\bdone\s+(analyzing|with|here)\b|\b(analysis|analyzing)\s+(is\s+)?done\b|\bthat'?s\s+it\b/i.test(String(text||""));}
    function start(timeframes){if(Array.isArray(timeframes)&&timeframes.length)state.timeframes=timeframes.map(normalize).filter(Boolean);state.active=true;state.index=0;state.completed=[];state.awaitingReview=false;state.lastAnalysis="";state.lastReview=null;ASTRA.modules.coach?.stopObserver?.();save();return snapshot();}
    function stop(){state.active=false;state.awaitingReview=false;save();return snapshot();}
    function snapshot(){return JSON.parse(JSON.stringify({...state,currentTimeframe:current()}));}
    function beginIfNeeded(){if(!state.active)start();return snapshot();}
    async function reviewAnalysis(analysisText=""){
        beginIfNeeded();if(state.awaitingReview)return {handled:true,waiting:true,state:snapshot()};
        const tf=current();if(!tf)return {handled:true,done:true,state:snapshot()};
        const screen=ASTRA.modules.screen;
        if(!screen?.sharing)return {handled:true,blocked:true,reason:"SCREEN_NOT_SHARED",message:`Share your screen so I can inspect the ${tf} chart before I grade the analysis.`};
        const frame=screen.getFrame?.({maxWidth:1440,quality:0.6});if(!frame)return {handled:true,blocked:true,reason:"NO_FRAME",message:`I can't see a usable ${tf} frame yet. Keep the chart visible and try again.`};
        state.awaitingReview=true;state.lastAnalysis=String(analysisText||"");save();
        const system=ASTRA.modules.trading?.strategy||{};
        const prompt=`Review Jay's ${tf} top-down analysis now. This is a checkpoint, not general market commentary.\n\nJay's spoken analysis:\n${String(analysisText||"(No spoken explanation was captured.)")}\n\nInspect the attached screen directly. Compare what Jay said with what is visibly marked on the chart and with Jay's Fractal Market Delivery System. Required review priorities for this timeframe: higher-timeframe context/objective, supply/demand where relevant, liquidity, market structure, and whether his explanation matches the visible chart. Do not invent details that are not visible.\n\nIf Jay is correct enough to move forward, return JSON only: {"status":"CORRECT","feedback":"Correct. Let's move on to the next timeframe.","missingLiquidity":[],"reason":"brief reason"}\n\nIf Jay missed something important (especially liquidity), return JSON only and DO NOT advance: {"status":"CORRECTION","feedback":"brief natural correction","missingLiquidity":["brief item"],"reason":"brief reason"}\n\nIf the screen is unclear, return JSON only: {"status":"UNCLEAR","feedback":"brief request to clarify or adjust the chart","missingLiquidity":[],"reason":"brief reason"}\n\nKeep the feedback natural, short, and mentor-like. Do not lecture. Trading system rules: ${JSON.stringify(system.rules||[])}\n`;
        try{
            const result=await ASTRA.modules.ai.ask(prompt,{image:frame,vision:true,trading:true,topDownReview:true,skipTopDown:true,returnOnly:true,context:{topDownCheckpoint:true,timeframe:tf,spokenAnalysis:analysisText,topDownState:snapshot()}});
            const raw=String(result?.answer||"").trim();let parsed=null;try{parsed=JSON.parse(raw.replace(/^```json\s*/i,"").replace(/\s*```$/,""));}catch{}
            if(!parsed)parsed={status:/\bcorrect\b/i.test(raw)&&!/missing|missed|unclear|can't|cannot/i.test(raw)?"CORRECT":"CORRECTION",feedback:raw||"Let's pause and check the chart again.",missingLiquidity:[],reason:"Review response was not structured."};
            state.lastReview={timeframe:tf,...parsed,date:new Date().toISOString()};
            if(parsed.status==="CORRECT"){
                state.completed.push({timeframe:tf,analysis:state.lastAnalysis,review:parsed,date:new Date().toISOString()});
                if(state.index<state.timeframes.length-1){state.index++;state.awaitingReview=false;save();return {handled:true,advanced:true,done:false,feedback:"Correct. Let's move on to the next timeframe.",review:parsed,state:snapshot()};}
                state.awaitingReview=false;state.active=false;save();return {handled:true,advanced:false,done:true,feedback:"Correct. Top-down analysis is complete. Now we can move into the execution timeframe.",review:parsed,state:snapshot()};
            }
            state.awaitingReview=false;save();return {handled:true,advanced:false,done:false,feedback:parsed.feedback||"Let's correct that before we move on.",review:parsed,state:snapshot()};
        }catch(error){state.awaitingReview=false;save();console.warn("ASTRA top-down review:",error);return {handled:true,error:true,message:"I couldn't complete the chart review. Keep this timeframe and try the checkpoint again."};}
    }
    async function handle(message){const text=String(message||"");if(!state.active&&/\btop[- ]down|topdown\b/i.test(text)&&/\b(analy|start|begin|walk|go)\b/i.test(text)){start();return {handled:true,started:true,message:`We'll do this one timeframe at a time. Start on the ${current()} chart. Tell me what you see, and when you're finished, say so. I'll inspect the screen before we move on.`};}if(!state.active)return {handled:false};if(isFinished(text))return reviewAnalysis(text);return {handled:false,state:snapshot()};}
    return {name:"ASTRA Top-Down Coach",version:"1.1",start,stop,snapshot,current,reviewAnalysis,handle};
})();
ASTRA.registerModule("topDownCoach",TopDownCoach);console.log("ASTRA Top-Down Coach v1.1 Loaded");
