/* ASTRA TRADE SCREENSHOT ATTACHMENT v1.0
   Restores the visible chart-screenshot field in the canonical trade modal.
   Screenshots are stored separately by trade id so journal trade persistence
   remains unchanged and Live/Demo/Backtest categories stay separated.
*/
(function(){
  "use strict";
  const KEY="ASTRA_TRADE_SCREENSHOTS";
  const pending=new Map();
  const $=(s,r=document)=>r.querySelector(s);

  function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||"{}");return v&&typeof v==="object"?v:{};}catch(e){return {};}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function compress(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=reject;
      reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve({data:canvas.toDataURL("image/jpeg",.78),name:file.name,width:canvas.width,height:canvas.height});};img.src=reader.result;};
      reader.readAsDataURL(file);
    });
  }
  function inject(form){
    if(!form||form.dataset.screenshotReady)return;
    form.dataset.screenshotReady="true";
    const label=document.createElement("label");
    label.className="full";
    label.innerHTML='CHART SCREENSHOT<input name="tradeScreenshot" type="file" accept="image/png,image/jpeg,image/webp"><small style="display:block;margin-top:5px;color:#6f8995;font-size:8px">Optional — attach the chart screenshot you want saved with this trade.</small><div data-screenshot-preview style="margin-top:7px;font-size:8px;color:#62dcff"></div>';
    const notes=form.querySelector('textarea[name="notes"]');
    if(notes?.parentElement) notes.parentElement.after(label); else form.appendChild(label);
    const input=label.querySelector('input[name="tradeScreenshot"]');
    const preview=label.querySelector("[data-screenshot-preview]");
    input.addEventListener("change",()=>{const file=input.files?.[0];if(!file){preview.textContent="";pending.delete(form);return;}pending.set(form,file);preview.textContent=`Selected: ${file.name}`;});
  }
  document.addEventListener("submit",event=>{
    const form=event.target.closest?.("#astraTradeForm");
    if(!form)return;
    const file=form.querySelector('input[name="tradeScreenshot"]')?.files?.[0];
    if(file)pending.set(form,file);
  },true);
  document.addEventListener("astra:journal-trade-added",event=>{
    const trade=event.detail;if(!trade?.id)return;
    const form=document.querySelector("#astraTradeForm");
    const file=form&&pending.get(form);
    if(!file)return;
    pending.delete(form);
    compress(file).then(image=>{const all=read();all[trade.id]={...image,tradeId:trade.id,savedAt:new Date().toISOString(),source:trade.tradeType||trade.source||"trade"};write(all);document.dispatchEvent(new CustomEvent("astra:trade-screenshot-saved",{detail:{tradeId:trade.id}}));}).catch(err=>console.error("ASTRA trade screenshot save failed",err));
  });
  const observer=new MutationObserver(()=>{const form=document.querySelector("#astraTradeForm");if(form)inject(form);});
  function boot(){if(document.body)observer.observe(document.body,{childList:true,subtree:true});const form=document.querySelector("#astraTradeForm");if(form)inject(form);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.ASTRA=window.ASTRA||{};window.ASTRA.tradeScreenshots={get(tradeId){return read()[tradeId]||null;},has(tradeId){return !!read()[tradeId];}};
  console.log("ASTRA Trade Screenshot Attachment v1.0 Loaded");
})();
