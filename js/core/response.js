/* =========================================
   ASTRA v2.1 RESPONSE MODULE
========================================= */
const ResponseModule={
    name:"Response System",
    version:"1.1",
    reply(message){
        const output=document.getElementById("output");
        if(!output){console.log("ASTRA:",message);}
        else{
            output.innerHTML+=`<div class="astra-message"><b>ASTRA:</b> ${message}</div>`;
            output.scrollTop=output.scrollHeight;
            this.animate();
        }
        ASTRA.modules.voice?.speak?.(message);
    },
    user(message){
        const output=document.getElementById("output");
        if(!output)return;
        output.innerHTML+=`<div class="user-message"><b>YOU:</b> ${message}</div>`;
        output.scrollTop=output.scrollHeight;
    },
    animate(){
        const core=document.querySelector(".core-circle");
        if(!core)return;
        core.classList.add("active");
        setTimeout(()=>core.classList.remove("active"),1500);
    }
};
ASTRA.registerModule("response",ResponseModule);
function AstraReply(message){ResponseModule.reply(message);}
