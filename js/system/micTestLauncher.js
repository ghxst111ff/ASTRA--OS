/* VEGA MIC TEST LAUNCHER v1.0 — isolated UI bridge for microphoneDiagnostics */
window.addEventListener("DOMContentLoaded",()=>{
  const button=document.getElementById("micTestBtn");
  if(!button||button.dataset.micTestBound)return;
  button.dataset.micTestBound="true";
  button.addEventListener("click",()=>window.open("mic-test.html","_blank","noopener"));
  console.log("VEGA Mic Test Launcher v1.0 — isolated");
});
