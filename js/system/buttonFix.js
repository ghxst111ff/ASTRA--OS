/* ASTRA BUTTON FIX — remaining dashboard controls */
window.addEventListener("DOMContentLoaded",()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const go=name=>window.ASTRAShowView?.(name);
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
  console.log("ASTRA BUTTON FIX — dashboard controls active");
});
