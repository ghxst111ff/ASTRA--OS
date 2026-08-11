/* =========================================
   ASTRA UI COMMAND BRIDGE v2.0
========================================= */
window.addEventListener("DOMContentLoaded",()=>{
    const sendBtn=document.getElementById("sendBtn"), input=document.getElementById("commandInput"), voiceBtn=document.getElementById("voiceBtn"), viewScreenBtn=document.getElementById("viewScreenBtn");
    if(sendBtn&&input){
        const send=()=>{const command=input.value.trim();if(!command)return;ASTRA.modules.response?.user?.(command);ASTRA.modules.command?.process?.(command);input.value="";};
        sendBtn.addEventListener("click",send);
        input.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
    }
    voiceBtn?.addEventListener("click",()=>{const active=ASTRA.modules.voice?.toggle?.();voiceBtn.classList.toggle("active",!!active);});
    viewScreenBtn?.addEventListener("click",()=>ASTRA.modules.screen?.startCapture?.());
    document.querySelectorAll(".module-btn").forEach(button=>button.addEventListener("click",()=>{
        const panel=document.getElementById((button.dataset.module||button.innerText).toLowerCase().trim());
        if(panel)panel.classList.toggle("active");
    }));
    console.log("ASTRA UI Command Bridge v2.0 Loaded");
});
