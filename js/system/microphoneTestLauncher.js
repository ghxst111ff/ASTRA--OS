/* VEGA MICROPHONE TEST LAUNCHER v1.0 — isolated UI entry; does not own quick-action behavior */
window.addEventListener("DOMContentLoaded",()=>{
  const button=document.getElementById("micTestBtn");
  if(!button||button.dataset.micTestLauncherBound)return;
  button.dataset.micTestLauncherBound="true";
  button.addEventListener("click",()=>{
    const url=new URL("mic-test.html",window.location.href).href;
    const opened=window.open(url,"_blank","noopener,noreferrer");
    if(!opened) window.location.href=url;
  },true);
  console.log("VEGA Microphone Test Launcher v1.0 — isolated");
});
