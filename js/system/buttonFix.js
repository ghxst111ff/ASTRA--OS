/* ASTRA BUTTON FIX v3.4 */
window.addEventListener("DOMContentLoaded", () => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const main=$(".main-area"), dashboard=$("#view-dashboard"); if(!main||!dashboard)return;
  const go=name=>window.ASTRAShowView?.(name);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function waitForVoice(timeout=5000){const started=Date.now();while(Date.now()-started<timeout){const v=window.ASTRA?.modules?.voice;if(v&&typeof v.toggle==="function")return v;await sleep(50);}return null;}
  async function startTopDown(){
    const phrase="Let's do top-down analysis";
    const started=Date.now();
    while(Date.now()-started<5000){
      const voice=window.ASTRA?.modules?.voice;
      if(voice?.dispatchTranscript){await voice.dispatchTranscript(phrase);return true;}
      const command=window.ASTRA?.modules?.command;
      if(command?.process){const handled=await Promise.resolve(command.process(phrase));if(handled!==false)return true;}
      await sleep(100);
    }
    const ai=window.ASTRA?.modules?.ai;
    if(ai?.ask){await Promise.resolve(ai.ask(phrase));return true;}
    return false;
  }
  const voiceBtn=$("#voiceBtn");
  if(voiceBtn&&!voiceBtn.dataset.voiceBound){voiceBtn.dataset.voiceBound="true";voiceBtn.addEventListener("click",async()=>{if(voiceBtn.dataset.voiceStarting==="true")return;voiceBtn.dataset.voiceStarting="true";const original=voiceBtn.textContent;voiceBtn.disabled=true;voiceBtn.textContent="◌  LOADING VOICE...";try{const v=await waitForVoice();if(!v){AstraReply?.("Voice is still starting. Please try again in a moment.");return;}const enabled=v.toggle(),active=enabled!==false&&v.status?.().listening;voiceBtn.classList.toggle("active",!!active);voiceBtn.textContent=active?"◉  VOICE ON":"◉  VOICE COMMAND";}catch(e){console.error(e);AstraReply?.("I couldn't start voice. Please try again.");voiceBtn.textContent=original;}finally{voiceBtn.disabled=false;voiceBtn.dataset.voiceStarting="false";}});}
  $$(".nav-item[data-module]").forEach(b=>{if(b.dataset.navBound)return;b.dataset.navBound="true";b.addEventListener("click",()=>go(b.dataset.module));});
  let actions=$(".quick-actions");
  if(!actions){actions=document.createElement("div");actions.className="quick-actions astra-restored-actions";actions.innerHTML=`<button id="newTradeBtn" type="button">＋ NEW TRADE</button><button id="topDownBtn" type="button">◈ TOP-DOWN ANALYSIS</button><button id="analyzeBtn" type="button">⌁ ANALYZE</button><button id="journalBtn" type="button">＋ JOURNAL</button><button id="screenBtn" type="button">▣ SCREEN</button><button id="viewScreenBtn" type="button">◉ MARKET SCAN</button><button id="watchBtn" type="button">◉ SCREEN WATCH</button>`;dashboard.appendChild(actions);}
  if(!$("#topDownBtn",actions)){const b=document.createElement("button");b.id="topDownBtn";b.type="button";b.textContent="◈ TOP-DOWN ANALYSIS";actions.insertBefore(b,$("#analyzeBtn",actions));}
  if(!$("#screenBtn",actions)){const b=document.createElement("button");b.id="screenBtn";b.type="button";b.textContent="▣ SCREEN";actions.insertBefore(b,$("#viewScreenBtn",actions)||null);}
  const showActions=()=>{Object.assign(actions.style,{display:"flex",visibility:"visible",opacity:"1",position:"relative",zIndex:"130",width:"100%",minHeight:"40px",margin:"12px auto 0",justifyContent:"center",alignItems:"center",gap:"10px",flexWrap:"wrap"});actions.querySelectorAll("button").forEach(b=>Object.assign(b.style,{display:"inline-flex",visibility:"visible",opacity:"1",alignItems:"center",justifyContent:"center",minHeight:"34px",border:"1px solid rgba(0,194,255,.45)",background:"#052338",color:"#a9eaff",borderRadius:"18px",padding:"8px 17px",fontSize:"8px",cursor:"pointer",position:"relative",zIndex:"131"}));};
  const restoreDock=()=>{const dock=$(".conversation-dock");if(!dock)return;if(dock.parentElement!==main)main.appendChild(dock);const output=$("#output"),command=$(".conversation-dock .command-area");if(output&&output.parentElement!==dock&&command)dock.insertBefore(output,command);Object.assign(dock.style,{display:"block",visibility:"visible",opacity:"1",position:"relative",zIndex:"120",width:"100%",maxWidth:"1280px",margin:"12px auto 0"});};
  showActions();restoreDock();setTimeout(()=>{showActions();restoreDock();},250);
  if(!actions.dataset.handlersBound){actions.dataset.handlersBound="true";actions.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
    if(b.id==="newTradeBtn"){go("journal");AstraReply?.("Let's log it properly. Tell me the setup, direction, reason for entry, and whether it followed your rules.");}
    if(b.id==="topDownBtn"){if(b.dataset.starting==="true")return;b.dataset.starting="true";const original=b.textContent;b.disabled=true;b.textContent="◌ STARTING TOP-DOWN...";try{const ok=await startTopDown();if(!ok)AstraReply?.("Top-down analysis has not loaded yet. Please refresh and try again.");}catch(err){console.error("ASTRA top-down button",err);AstraReply?.("I couldn't start top-down analysis. Please try again.");}finally{b.disabled=false;b.dataset.starting="false";b.textContent=original;}}
    if(b.id==="analyzeBtn"){const r=ASTRA?.modules?.screen?.showAnalysis?.();if(!r?.ready)AstraReply?.("Share your chart first, then I'll look at the setup with you.");}
    if(b.id==="journalBtn")go("journal");
    if(b.id==="screenBtn"){try{const m=ASTRA?.modules?.screen;if(m?.sharing){m.stopCapture?.();b.classList.remove("active");}else{const r=await m?.startCapture?.();if(r!==false)b.classList.add("active");}}catch(err){console.error(err);AstraReply?.("I couldn't start screen sharing. Please allow screen access when your browser asks.");}}
    if(b.id==="viewScreenBtn")ASTRA?.modules?.ai?.ask?.("Give me a current market scan and tell me what is actually relevant to my trading plan.",{trading:true,analysis:true});
    if(b.id==="watchBtn"){const o=ASTRA?.modules?.proactiveMarketObserver;if(!o)return AstraReply?.("Screen Watch is not loaded yet.");const s=o.status?.();if(s?.watching){o.stop?.();b.classList.remove("active");}else{o.start?.();b.classList.add("active");}}
  });}
  console.log("ASTRA Button Fix v3.4 — Top-Down button uses canonical conversation pipeline");
});