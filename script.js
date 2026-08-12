/* =========================================
   ASTRA UI COMMAND BRIDGE v3.0
   Dashboard navigation + conversational UI
========================================= */
window.addEventListener("DOMContentLoaded",()=>{
    const sendBtn=document.getElementById("sendBtn");
    const input=document.getElementById("commandInput");
    const voiceBtn=document.getElementById("voiceBtn");
    const viewScreenBtn=document.getElementById("viewScreenBtn");

    const showView=(name)=>{
        document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
        const target=document.getElementById(`view-${name}`);
        if(target)target.classList.add("active-view");
        document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.module===name));
        window.scrollTo({top:0,behavior:"smooth"});
    };

    if(sendBtn&&input){
        const send=()=>{
            const command=input.value.trim();
            if(!command)return;
            ASTRA.modules.response?.user?.(command);
            ASTRA.modules.command?.process?.(command);
            input.value="";
        };
        sendBtn.addEventListener("click",send);
        input.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
    }

    voiceBtn?.addEventListener("click",()=>{
        const active=ASTRA.modules.voice?.toggle?.();
        voiceBtn.classList.toggle("active",!!active);
    });

    viewScreenBtn?.addEventListener("click",()=>ASTRA.modules.screen?.startCapture?.());

    document.querySelectorAll(".nav-item").forEach(button=>{
        button.addEventListener("click",()=>showView(button.dataset.module));
    });

    document.getElementById("newTradeBtn")?.addEventListener("click",()=>showView("journal"));
    document.getElementById("journalBtn")?.addEventListener("click",()=>showView("journal"));
    document.getElementById("analyzeBtn")?.addEventListener("click",()=>ASTRA.modules.screen?.analyze?.());

    console.log("ASTRA UI Command Bridge v3.0 Loaded");
});
