/* ASTRA UI FIX — dashboard controls + core conversation */
window.addEventListener("DOMContentLoaded",()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const go=name=>window.ASTRAShowView?.(name);

  // Put the live conversation directly under the ASTRA core/dashboard panel.
  const says=$(".astra-says");
  const dock=$(".conversation-dock");
  const output=$("#output");
  const command=dock?.querySelector(".command-area");

  if(says && output && command){
    dock.remove();
    $("#dashboardMessage")?.remove();
    says.classList.add("conversation-panel");
    says.appendChild(output);
    says.appendChild(command);

    const title=says.querySelector(".panel-title");
    if(title) title.textContent="ASTRA SAYS";

    says.querySelector(".voice-wave")?.remove();
    says.querySelector(".mini-core")?.remove();

    output.classList.add("core-conversation");
    command.classList.add("core-command-area");
    const input=$("#commandInput");
    if(input) input.placeholder="Type a message to ASTRA...";
  }

  // Add a real microphone button beside SEND if it is not already present.
  const commandArea=$(".core-command-area")||$(".command-area");
  if(commandArea && !$(".chat-mic",commandArea)){
    const mic=document.createElement("button");
    mic.type="button";
    mic.className="chat-mic";
    mic.title="Talk to ASTRA";
    mic.setAttribute("aria-label","Talk to ASTRA");
    mic.textContent="🎙";
    const send=$("#sendBtn",commandArea);
    if(send) commandArea.insertBefore(mic,send);
    else commandArea.appendChild(mic);
    mic.addEventListener("click",()=>{
      const voice=ASTRA?.modules?.voice;
      if(!voice)return;
      const state=voice.status?.();
      if(state?.listening){ voice.stop?.(); mic.classList.remove("active"); }
      else { voice.start?.(); mic.classList.add("active"); }
    });
  }

  // Styling for the compact conversation inside ASTRA SAYS.
  if(!$("#astraConversationStyle")){
    const style=document.createElement("style");
    style.id="astraConversationStyle";
    style.textContent=`
      .conversation-panel{display:flex!important;flex-direction:column;min-height:0}
      .core-conversation{display:flex!important;flex-direction:column;gap:7px;height:82px;min-height:82px;margin-top:7px;overflow-y:auto;overflow-x:hidden;padding:2px 4px 2px 0;scroll-behavior:smooth}
      .core-conversation .astra-message,.core-conversation .user-message{margin:0;padding:6px 8px;border-radius:7px;background:rgba(3,27,43,.78);border:1px solid rgba(0,174,235,.15);font-size:8px;line-height:1.4}
      .core-conversation .user-message{background:rgba(25,18,52,.52);border-color:rgba(139,126,255,.18)}
      .core-conversation .message-speaker{font-size:6px;letter-spacing:1px;color:#62dfff;font-weight:700;margin-bottom:2px}
      .core-conversation .user-message .message-speaker{color:#a996ff}
      .core-conversation .message-body p{margin:0 0 3px}.core-conversation .message-body p:last-child{margin-bottom:0}
      .core-conversation .message-body h3,.core-conversation .message-body h4{margin:0 0 3px;font-size:8px;color:#dff9ff}
      .core-conversation .message-body ul{margin:2px 0 2px 14px;padding:0}.core-conversation .message-body li{margin:1px 0}
      .core-command-area{display:flex!important;gap:6px;margin-top:7px;align-items:center}
      .core-command-area #commandInput{flex:1;min-width:0;height:28px;border:1px solid rgba(0,194,255,.28);background:rgba(1,12,21,.9);color:#e6faff;border-radius:6px;padding:0 9px;font-size:8px;outline:none}
      .core-command-area #commandInput:focus{border-color:rgba(0,207,255,.7);box-shadow:0 0 12px rgba(0,190,255,.12)}
      .core-command-area #sendBtn,.core-command-area .chat-mic{height:28px;border:1px solid rgba(0,194,255,.35);background:#05243a;color:#78e2ff;border-radius:6px;font-size:7px;font-weight:700;cursor:pointer}
      .core-command-area #sendBtn{padding:0 10px}.core-command-area .chat-mic{width:30px;padding:0;font-size:12px}
      .core-command-area #sendBtn:hover,.core-command-area .chat-mic:hover,.core-command-area .chat-mic.active{background:#07324e;box-shadow:0 0 12px rgba(0,190,255,.18)}
      .conversation-panel .hidden-control{display:none!important}
      .conversation-panel .command-area{width:100%}
    `;
    document.head.appendChild(style);
  }

  // Reliable chat sender. This is intentionally bound here, after the visual UI is moved,
  // so the button remains functional even if an older UI controller fails to initialize.
  const input=$("#commandInput"), sendBtn=$("#sendBtn");
  if(input && sendBtn && !sendBtn.dataset.chatBound){
    sendBtn.dataset.chatBound="true";
    const send=()=>{
      const text=input.value.trim();
      if(!text)return;
      ASTRA.modules.response?.user?.(text);
      input.value="";
      input.focus();
      if(ASTRA.modules.command?.process){
        try { ASTRA.modules.command.process(text); }
        catch(error){
          console.error("ASTRA command error",error);
          AstraReply("I hit an error processing that message: "+error.message);
        }
      }else if(ASTRA.modules.ai?.ask){
        ASTRA.modules.ai.ask(text);
      }else if(ASTRA.modules.aiGateway?.ask){
        ASTRA.modules.aiGateway.ask(text);
      }else{
        AstraReply("ASTRA's conversation engine is still loading. Please try again in a moment.");
      }
    };
    sendBtn.addEventListener("click",send);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
  }

  document.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    if(b.classList.contains("mini-link")) go("dashboard");
    if(b.textContent.includes("VIEW ALL TRADES")) go("journal");
    if(b.textContent.includes("NEW ENTRY")) go("journal");
    if(b.textContent.includes("VIEW FULL PLAN")) go("dashboard");
    if(b.classList.contains("voice-command")) ASTRA?.modules?.voice?.toggle?.();
    if(b.closest(".range-tabs")){
      const group=b.closest(".range-tabs");$$('span,b',group).forEach(x=>x.classList.remove("active"));b.classList.add("active");
    }
    if(b.classList.contains("toggle")) b.classList.toggle("on");
  });
  console.log("ASTRA BUTTON FIX — controls + core conversation + send active");
});
