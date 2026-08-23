/* =========================================
   ASTRA TOP-DOWN COACH v2.0
   Phase 2 trading workflow
   Source of truth: Jay's original detailed Trading Strategy
========================================= */
const TopDownCoach=(()=>{
 const KEY="ASTRA_TOP_DOWN_SESSION";
 const DEFAULT={
  active:false,
  timeframes:["WEEKLY","DAILY","4H","1H","30M","15M","5M"],
  index:0,completed:[],awaitingReview:false,currentTranscript:"",
  lastAnalysis:"",lastReview:null,updatedAt:null
 };
 let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}
 // Never restore an unfinished listening session after a reload.
 let state={...DEFAULT,...stored,active:false,awaitingReview:false};
 let voiceGuardInstalled=false,allowAnnouncement=false;
 const save=()=>{state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state))};
 const current=()=>state.timeframes[state.index]||null;
 const snapshot=()=>JSON.parse(JSON.stringify({...state,currentTimeframe:current()}));
 const normalize=t=>String(t||"").trim().toUpperCase();
 const roleFor=tf=>({
  WEEKLY:"direction and bigger market context only — do not treat this as an execution timeframe",
  DAILY:"direction and bigger market context — build the map with Weekly agreement or disagreement",
  "4H":"main narrative — explain where price is coming from, where it may deliver, important areas and scenarios",
  "1H":"fractal opportunities inside the 4H narrative",
  "30M":"fractal opportunities and lower-timeframe delivery inside the larger narrative",
  "15M":"confirmation timeframe — wait for the required structure shift, liquidity context and momentum",
  "5M":"entry refinement and/or direct confirmation after the larger narrative is aligned"
 }[tf]||"analysis");
 function promptFor(tf){
  const next=current();
  const role=roleFor(tf);
  return `Start with the ${next} chart. Your job here is ${role}. Follow your normal flow: structure, narrative or delivery, supply and demand, liquidity, opportunity, confirmation, and invalidation. Take your time. I will stay quiet until you say you're finished.`;
 }
 function isTopDownStart(text){
  const t=String(text||"").toLowerCase().replace(/[.,!?]/g," ").replace(/\s+/g," ").trim();
  return /\btop\s*-?\s*down(?:\s+(?:analysis|analyses|analyzing))?\b/.test(t)&&(/\b(?:i'?m|im|i am|we'?re|we are|let'?s|lets|i'?ll|ill|i will|we will|going to|gonna|want to|ready to|start|begin|do|doing|analy[sz]e|about to)\b/.test(t)||/^(?:astra\s*,?\s*)?(?:top\s*-?\s*down)/.test(t));
 }
 function isFinished(text){
  const t=String(text||"").trim();
  return /\b(?:i'?m|im|i am|we'?re|we are)\s+(?:finished|done)\b|\b(?:i'?m|im|i am)\s+(?:all\s+)?finished\b|\bfinished(?:\s+with)?(?:\s+(?:the\s+)?)?(?:weekly|daily|4h|1h|30m|15m|5m|analysis|analyzing)?\b|\b(?:that'?s|thats)\s+(?:it|all)\b|\b(?:analysis|analyzing)\s+(?:is\s+)?(?:finished|done|complete)\b/i.test(t);
 }
 function installVoiceGuard(){
  if(voiceGuardInstalled)return;
  const voice=ASTRA.modules.voice;
  if(!voice?.speak)return;
  const original=voice.speak.bind(voice);
  voice.speak=function(text,...args){
   if(state.active&&!state.awaitingReview&&!allowAnnouncement)return false;
   return original(text,...args);
  };
  voiceGuardInstalled=true;
 }
 function start(timeframes){
  installVoiceGuard();
  ASTRA.modules.voice?.stopSpeaking?.({ignoreMs:1500});
  if(Array.isArray(timeframes)&&timeframes.length)state.timeframes=timeframes.map(normalize).filter(Boolean);
  state.active=true;state.index=0;state.completed=[];state.awaitingReview=false;
  state.currentTranscript="";state.lastAnalysis="";state.lastReview=null;
  ASTRA.modules.coach?.stopObserver?.();
  save();
  const message=`Okay, we're ready. ${promptFor(current())}`;
  allowAnnouncement=true;
  setTimeout(()=>{allowAnnouncement=false},1800);
  return {handled:true,started:true,message,state:snapshot()};
 }
 function appendAnalysis(text){
  const v=String(text||"").trim();
  if(v){state.currentTranscript=[state.currentTranscript,v].filter(Boolean).join("\n");save();}
 }
 function buildReviewPrompt(tf,analysis,system){
  const role=roleFor(tf);
  return `You are ASTRA, reviewing Jay's ${tf} top-down analysis against HIS original detailed Trading Strategy.\n\nTIMEFRAME ROLE: ${role}\n\nJAY'S SPOKEN ANALYSIS:\n${analysis||"(No explanation captured.)"}\n\nInspect the shared chart and compare what Jay said with what is visible. Follow Jay's exact analysis flow: 1) market structure, 2) narrative/delivery, 3) supply and demand, 4) liquidity, 5) opportunity, 6) confirmation, 7) invalidation. Weekly and Daily are for direction/context, 4H builds the main narrative, 1H and 30M find fractal opportunities, 15M and 5M are for confirmation/execution. Do not demand an entry on Weekly, Daily, 4H, 1H, or 30M. Jay does not execute trades from the Weekly chart.\n\nCheck for missed liquidity, equal highs/lows, important supply/demand areas, imbalance where relevant, structural mistakes, contradictions, missing if-this-then-that scenarios, and anything Jay's stated analysis overlooked. Do not invent chart details you cannot see.\n\nReturn JSON only in this exact shape: {"status":"CORRECT"|"CORRECTION"|"UNCLEAR","correctPoints":[...],"incorrectPoints":[...],"missingPoints":[...],"missingLiquidity":[...],"feedback":"short spoken feedback","reason":"brief reason"}.\n\nTrading strategy context: ${JSON.stringify(system)}`;
 }
 function normalizeReview(raw){
  let parsed;
  try{parsed=JSON.parse(String(raw||"").trim().replace(/^```json\s*/i,"").replace(/\s*```$/,""))}catch{
   parsed={status:"UNCLEAR",correctPoints:[],incorrectPoints:[],missingPoints:[],missingLiquidity:[],feedback:String(raw||"").trim()||"I couldn't clearly verify that analysis yet.",reason:"Unstructured review."};
  }
  const allowed=["CORRECT","CORRECTION","UNCLEAR"];
  parsed.status=allowed.includes(String(parsed.status||"").toUpperCase())?String(parsed.status).toUpperCase():"UNCLEAR";
  for(const key of ["correctPoints","incorrectPoints","missingPoints","missingLiquidity"]){if(!Array.isArray(parsed[key]))parsed[key]=parsed[key]?[String(parsed[key])]:[];}
  parsed.feedback=String(parsed.feedback||"").trim()||"Let's review that carefully.";
  parsed.reason=String(parsed.reason||"").trim();
  return parsed;
 }
 async function reviewAnalysis(){
  if(state.awaitingReview)return {handled:true,waiting:true,message:"I'm reviewing that now.",state:snapshot()};
  const tf=current();
  state.awaitingReview=true;state.lastAnalysis=state.currentTranscript;save();
  const screen=ASTRA.modules.screen;
  if(!screen?.sharing){state.awaitingReview=false;save();return {handled:true,message:`I'm ready to review your ${tf} analysis, but I need the chart shared and visible first. Keep the ${tf} chart on screen, then say you're finished again.`};}
  const frame=screen.getFrame?.({maxWidth:1440,quality:.65});
  if(!frame){state.awaitingReview=false;save();return {handled:true,message:`I can't see a usable ${tf} chart yet. Keep it visible, then say you're finished again.`};}
  const system=ASTRA.modules.trading?.strategy||{};
  try{
   const result=await ASTRA.modules.ai.ask(buildReviewPrompt(tf,state.lastAnalysis,system),{image:frame,vision:true,trading:true,topDownReview:true,skipTopDown:true,returnOnly:true,context:{timeframe:tf,role:roleFor(tf),analysis:state.lastAnalysis,strategySource:"Jay original detailed Trading Strategy"}});
   const parsed=normalizeReview(result?.answer);
   state.lastReview={timeframe:tf,...parsed,date:new Date().toISOString()};
   if(parsed.status==="CORRECT"){
    state.completed.push({timeframe:tf,analysis:state.lastAnalysis,review:parsed,date:new Date().toISOString()});
    if(state.index<state.timeframes.length-1){
     state.index++;state.currentTranscript="";state.awaitingReview=false;save();
     const next=current();
     return {handled:true,advanced:true,feedback:`${parsed.feedback} Next: ${promptFor(next)}`,state:snapshot()};
    }
    state.active=false;state.awaitingReview=false;save();
    return {handled:true,done:true,feedback:`${parsed.feedback} Top-down analysis is complete. Your final execution decision still requires your 15M or 5M confirmation and your trading rules.`,state:snapshot()};
   }
   state.awaitingReview=false;save();
   return {handled:true,feedback:parsed.feedback,state:snapshot()};
  }catch(e){
   console.error("ASTRA top-down review:",e);
   state.awaitingReview=false;save();
   return {handled:true,message:"I couldn't complete the chart review. Stay on this timeframe, keep the chart visible, and say you're finished again.",state:snapshot()};
  }
 }
 function handle(message){
  const text=String(message||"").trim();if(!text)return {handled:false};
  if(!state.active&&isTopDownStart(text))return start();
  if(!state.active)return {handled:false};
  if(isFinished(text))return reviewAnalysis();
  appendAnalysis(text);
  return {handled:true,listening:true,silent:true,state:snapshot()};
 }
 // Voice loads after this module in index.html, so keep trying until it exists.
 const voiceHook=setInterval(()=>{installVoiceGuard();if(voiceGuardInstalled)clearInterval(voiceHook);},250);
 installVoiceGuard();
 return {name:"ASTRA Top-Down Coach",version:"2.0",start,stop:()=>{state.active=false;state.awaitingReview=false;allowAnnouncement=false;state.currentTranscript="";save();return snapshot()},snapshot,current,promptFor,roleFor,reviewAnalysis,handle,isFinished,isTopDownStart};
})();
ASTRA.registerModule("topDownCoach",TopDownCoach);
console.log("ASTRA Top-Down Coach v2.0 Loaded — Phase 2 workflow ready");