/* =========================================
   ASTRA UI COMMAND BRIDGE v4.0
   Cosmic dashboard interactions + live demo state
========================================= */
window.addEventListener("DOMContentLoaded",()=>{
    const sendBtn=document.getElementById("sendBtn");
    const input=document.getElementById("commandInput");
    const voiceBtn=document.getElementById("voiceBtn");
    const viewScreenBtn=document.getElementById("viewScreenBtn");
    const watchBtn=document.getElementById("watchBtn");

    const showView=(name)=>{
        document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
        const target=document.getElementById(`view-${name}`);
        if(target)target.classList.add("active-view");
        document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.module===name));
        window.scrollTo({top:0,behavior:"smooth"});
    };

    const send=()=>{
        const command=input?.value.trim();
        if(!command)return;
        ASTRA.modules.response?.user?.(command);
        if(ASTRA.modules.command?.process) ASTRA.modules.command.process(command);
        else if(ASTRA.modules.naturalIntent?.handle?.(command)) {}
        else if(ASTRA.modules.aiGateway?.ask) ASTRA.modules.aiGateway.ask(command);
        if(input)input.value="";
    };

    sendBtn?.addEventListener("click",send);
    input?.addEventListener("keydown",e=>{if(e.key==="Enter")send();});

    voiceBtn?.addEventListener("click",()=>{
        const active=ASTRA.modules.voice?.toggle?.();
        voiceBtn.classList.toggle("active",!!active);
    });

    viewScreenBtn?.addEventListener("click",()=>ASTRA.modules.screen?.startCapture?.());
    watchBtn?.addEventListener("click",()=>{
        const observer=ASTRA.modules.proactiveMarketObserver;
        if(!observer)return;
        const state=observer.status?.();
        if(state?.watching){observer.stop?.();watchBtn.classList.remove("active");}
        else{observer.start?.();watchBtn.classList.add("active");}
    });

    document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.module)));
    document.getElementById("newTradeBtn")?.addEventListener("click",()=>showView("journal"));
    document.getElementById("journalBtn")?.addEventListener("click",()=>showView("journal"));
    document.getElementById("analyzeBtn")?.addEventListener("click",()=>ASTRA.modules.screen?.analyze?.());

    document.querySelectorAll(".inner-tabs").forEach(group=>group.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{group.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");})));

    document.querySelectorAll(".range-tabs span,.range-tabs b").forEach(tab=>tab.addEventListener("click",()=>{const group=tab.parentElement;group.querySelectorAll("span,b").forEach(t=>t.classList.remove("active"));tab.classList.add("active");}));

    const tick=()=>{
        const el=document.getElementById("lastUpdate");
        if(el)el.textContent="just now";
        document.querySelectorAll(".chart-line,.mini-equity,.large-chart").forEach(c=>c.classList.add("live"));
    };
    tick();
    setInterval(tick,5000);

    console.log("ASTRA UI Command Bridge v4.0 Loaded");
});
