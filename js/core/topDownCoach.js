/* =========================================
   ASTRA TOP-DOWN COACH v1.5
   Guided timeframe-by-timeframe chart review
   Wait -> listen -> inspect -> grade -> advance
   HARD SILENCE: voice output is blocked while Jay is analyzing.
========================================= */
const TopDownCoach = (()=>{
    const KEY="ASTRA_TOP_DOWN_SESSION";
    const DEFAULT={active:false,timeframes:["WEEKLY","DAILY","4H","1H","15M"],index:0,completed:[],awaitingReview:false,currentTranscript:"",lastAnalysis:"",lastReview:null,updatedAt:null};
    function load(){try{return {...DEFAULT,...(JSON.parse(localStorage.getItem(KEY))||{})};}catch{return {...DEFAULT};}}
    let state=load();
    let allowNextSpeech=false;
    let voiceGuardInstalled=false;
    function save(){state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));}
    function current(){return state.timeframes[state.index]||null;}
    function normalize(text){return String(text||"").trim().toUpperCase();}
    function isFinished(text){return /\b(i'?m|im|i am|we'?re|we are)\s+(finished|done)\b|\bfinished\s+(analyzing|analysis|with)\b|\bdone\s+(analyzing|with|here)\b|\b(analysis|analyzing)\s+(is\s+)?done\b|\bthat'?s\s+it\b|\b(i'?m|im|i am)\s+finished\b/i.test(String(text||""));}
    function installVoiceGuard(){
        if(voiceGuardInstalled || !ASTRA.modules.voice?.speak) return;
        const voice=ASTRA.modules.voice;
        const originalSpeak=voice.speak.bind(voice);
        voice.speak=function(text){
            if(state.active && !state.awaitingReview && !allowNextSpeech) return false;
            if(allowNextSpeech){allowNextSpeech=false;return originalSpeak(text);}
            return originalSpeak(text);
        };
        voiceGuardInstalled=true;
    }
    function start(timeframes){
        installVoiceGuard();
        ASTRA.modules.voice?.stopSpeaking?.({ignoreMs:1500});
        if(Array.isArray(timeframes)&&timeframes.length)state.timeframes=timeframes.map(normalize).filter(Boolean);
        state.active=true;state.index=0;state.completed=[];state.awaitingReview=false;state.currentTranscript="";state.lastAnalysis="";state.lastReview=null;
        allowNextSpeech=true;
        ASTRA.modules.coach?.stopObserver?.();save();return snapshot();
    }
    function stop(){state.active=false;state.awaitingReview=false;allowNextSpeech=false;save();return snapshot();}
    function snapshot(){return JSON.parse(JSON.stringify({...state,currentTimeframe:current()}));}
    function beginIfNeeded(){if(!state.active)start();return snapshot();}
    function appendAnalysis(text){const value=String(text||"").trim();if(!value)return;state.currentTranscript=[state.currentTranscript,value].filter(Boolean).join("\n");save();}

    async function reviewAnalysis(analysisText=""){
        beginIfNeeded();
        if(state.awaitingReview)return {handled:true,waiting:true,state:snapshot()};
        const tf=current();
        if(!tf)return {handled:true,done:true,state:snapshot()};
        const screen=ASTRA.modules.screen;
        if(!screen?.sharing){
            allowNextSpeech=true;
            return {handled:true,blocked:true,reason:"SCREEN_NOT_SHARED",message:`Share your screen so I can inspect the ${tf} chart before I grade what you said.`};
        }
        const frame=screen.getFrame?.({maxWidth:1440,quality:0.6});
        if(!frame){
            allowNextSpeech=true;
            return {handled:true,blocked:true,reason:"NO_FRAME",message:`I can't see a usable ${tf} frame yet. Keep the chart visible and try again.`};
        }
        state.awaitingReview=true;state.lastAnalysis=state.currentTranscript||String(analysisText||"");save();
        const system=ASTRA.modules.trading?.strategy||{};
        const prompt=`Review Jay's ${tf} top-down analysis now. This is a checkpoint, not general market commentary.

Jay has finished speaking. Review EVERYTHING he said during this ${tf} checkpoint, not just the last statement.

JAY'S COMPLETE ${tf} ANALYSIS:
${state.lastAnalysis||"(No spoken explanation was captured.)"}

Inspect the attached screen directly. Compare each meaningful claim with what is visibly shown on the chart and with Jay's Fractal Market Delivery System. Check higher-timeframe context/objective, supply/demand, liquidity, market structure, key highs/lows, bias, and whether the reasoning matches the visible chart. Do not invent details that are not visible.

Return JSON only:
{"status":"CORRECT" or "CORRECTION" or "UNCLEAR","correctPoints":[],"incorrectPoints":[],"missingPoints":[],"missingLiquidity":[],"feedback":"short natural mentor feedback","reason":"brief grading reason"}

Use CORRECT only when accurate enough to move forward with no important omission. Use CORRECTION when an important claim is wrong or important liquidity was missed. Use UNCLEAR only when the chart cannot be reliably inspected.

If CORRECT, naturally say the review is complete and we are moving to the next timeframe. If CORRECTION, do not advance and explain what must be corrected.

Trading system rules: ${JSON.stringify(system.rules||[])}
`;
        try{
            const result=await ASTRA.modules.ai.ask(prompt,{image:frame,vision:true,trading:true,topDownReview:true,skipTopDown:true,returnOnly:true,context:{topDownCheckpoint:true,timeframe:tf,spokenAnalysis:state.lastAnalysis,topDownState:snapshot()}});
            const raw=String(result?.answer||"").trim();let parsed=null;
            try{parsed=JSON.parse(raw.replace(/^```json\s*/i,"").replace(/\s*```$/,""));}catch{}
            if(!parsed)parsed={status:/\bcorrect\b/i.test(raw)&&!/missing|missed|unclear|can't|cannot/i.test(raw)?"CORRECT":"CORRECTION",correctPoints:[],incorrectPoints:[],missingPoints:[],missingLiquidity:[],feedback:raw||"Let's pause and check the chart again.",reason:"Review response was not structured."};
            parsed.correctPoints=Array.isArray(parsed.correctPoints)?parsed.correctPoints:[];parsed.incorrectPoints=Array.isArray(parsed.incorrectPoints)?parsed.incorrectPoints:[];parsed.missingPoints=Array.isArray(parsed.missingPoints)?parsed.missingPoints:[];parsed.missingLiquidity=Array.isArray(parsed.missingLiquidity)?parsed.missingLiquidity:[];
            state.lastReview={timeframe:tf,...parsed,date:new Date().toISOString()};
            allowNextSpeech=true;
            if(parsed.status==="CORRECT"){
                state.completed.push({timeframe:tf,analysis:state.lastAnalysis,review:parsed,date:new Date().toISOString()});
                if(state.index<state.timeframes.length-1){state.index++;state.currentTranscript="";state.awaitingReview=false;save();return {handled:true,advanced:true,done:false,feedback:parsed.feedback||"Correct. Let's move on to the next timeframe.",review:parsed,state:snapshot()};}
                state.awaitingReview=false;state.active=false;save();return {handled:true,advanced:false,done:true,feedback:parsed.feedback||"Correct. Top-down analysis is complete. Now we can move into the execution timeframe.",review:parsed,state:snapshot()};
            }
            state.awaitingReview=false;save();return {handled:true,advanced:false,done:false,feedback:parsed.feedback||"Let's correct that before we move on.",review:parsed,state:snapshot()};
        }catch(error){state.awaitingReview=false;allowNextSpeech=true;save();console.warn("ASTRA top-down review:",error);return {handled:true,error:true,message:"I couldn't complete the chart review. Keep this timeframe and try the checkpoint again."};}
    }
    async function handle(message){
        const text=String(message||"");
        if(!state.active&&/\btop[- ]down|topdown\b/i.test(text)&&/\b(analy|start|begin|walk|go|do|let'?s)\b/i.test(text)){
            start();return {handled:true,started:true,message:`Okay, we're ready. Start with the ${current()} chart. Take your time and tell me everything you see. I won't interrupt the analysis. When you're finished with the ${current()}, say you're finished. I'll go back over everything you said, check it against the chart, tell you what was right, what was wrong, and what you missed, then we'll move to the next timeframe.`};
        }
        if(!state.active)return {handled:false};
        if(isFinished(text))return reviewAnalysis(text);
        appendAnalysis(text);return {handled:false,state:snapshot()};
    }
    installVoiceGuard();
    return {name:"ASTRA Top-Down Coach",version:"1.5",start,stop,snapshot,current,reviewAnalysis,handle};
})();
ASTRA.registerModule("topDownCoach",TopDownCoach);console.log("ASTRA Top-Down Coach v1.5 Loaded — hard silence with explicit checkpoint output");
