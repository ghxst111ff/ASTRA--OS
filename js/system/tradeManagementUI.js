/* ASTRA TRADE MANAGEMENT UI v1.2
   Directly manages persisted trades from the Journal UI.
   Buttons use element handlers so other document-level click routers cannot swallow them.
*/
(function(){
  "use strict";
  const K="ASTRA_JOURNAL";
  const $=(s,r=document)=>r.querySelector(s);

  function trades(){
    try{return ASTRA.modules.journal.getData().trades||[];}
    catch(e){try{return JSON.parse(localStorage.getItem(K)||'{"trades":[]}').trades||[];}catch(x){return[];}}
  }
  function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

  function ensureEditor(callback){
    if(window.ASTRA?.tradeEditor?.open){callback();return;}
    const existing=document.querySelector('script[data-astra-trade-editor]');
    if(existing){existing.addEventListener("load",callback,{once:true});return;}
    const script=document.createElement("script");
    script.src="js/system/tradeEditor.js?v=3";
    script.async=false;
    script.dataset.astraTradeEditor="true";
    script.onload=()=>callback();
    script.onerror=()=>alert("ASTRA could not load the trade editor.");
    document.head.appendChild(script);
  }

  function openEdit(id){
    const t=trades().find(x=>String(x.id)===String(id));
    if(!t)return;
    ensureEditor(()=>{
      if(window.ASTRA?.tradeEditor?.open) window.ASTRA.tradeEditor.open(id);
      else alert("ASTRA trade editor is not available.");
    });
  }

  function del(id){
    const t=trades().find(x=>String(x.id)===String(id));
    if(!t||!confirm(`Delete ${t.pair||"this trade"}? This cannot be undone.`))return;
    try{
      const removed=ASTRA.modules.journal.deleteTrade(id);
      if(!removed){alert("ASTRA could not delete this trade.");return;}
      try{
        const a=JSON.parse(localStorage.getItem("ASTRA_TRADE_SCREENSHOTS")||"{}");
        delete a[id];localStorage.setItem("ASTRA_TRADE_SCREENSHOTS",JSON.stringify(a));
      }catch(e){}
      render();
    }catch(e){console.error("ASTRA trade delete failed",e);alert("ASTRA could not delete this trade.");}
  }

  function render(){
    const card=$("#view-journal .content-card");
    if(!card)return;
    let box=$("#astra-trade-manager",card);
    if(!box){box=document.createElement("div");box.id="astra-trade-manager";card.appendChild(box);}
    const list=trades();
    box.innerHTML=`<div style="margin-top:18px"><h3>MANAGE SAVED TRADES</h3><div style="font-size:8px;color:#829aa7;margin:5px 0 10px">Edit an existing entry, add/replace its chart screenshot, or delete it.</div>${list.length?list.map(t=>`<div class="astra-managed-trade" data-id="${esc(t.id)}"><div><b>${esc(t.pair||"N/A")}</b><span>${esc(t.direction||"")} · ${esc((t.tradeType||t.source||"trade").toUpperCase())}</span><small>${esc(t.date?new Date(t.date).toLocaleDateString():"")}</small></div><div class="astra-managed-actions"><button type="button" data-edit-saved>EDIT</button><button type="button" data-delete-saved>DELETE</button></div></div>`).join(""):"<div style=\"font-size:9px;color:#829aa7;padding:10px 0\">No saved trades yet.</div>"}</div>`;

    box.querySelectorAll("[data-edit-saved]").forEach(btn=>{
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();openEdit(btn.closest("[data-id]")?.dataset.id);};
    });
    box.querySelectorAll("[data-delete-saved]").forEach(btn=>{
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();del(btn.closest("[data-id]")?.dataset.id);};
    });
  }

  function boot(){
    if($("#astra-trade-manager-styles"))return;
    const st=document.createElement("style");st.id="astra-trade-manager-styles";
    st.textContent=`#astra-trade-manager .astra-managed-trade{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(90,160,190,.12);font-size:9px}#astra-trade-manager .astra-managed-trade span,#astra-trade-manager .astra-managed-trade small{display:block;color:#829aa7;font-size:7px;margin-top:3px}.astra-managed-actions{display:flex;gap:5px}.astra-managed-actions button{border:1px solid rgba(0,194,255,.35);background:#062a40;color:#a9ebff;border-radius:5px;padding:6px 9px;font-size:7px;cursor:pointer}.astra-managed-actions [data-delete-saved]{color:#ff9ca2;border-color:rgba(255,101,109,.35)}`;
    document.head.appendChild(st);
    render();
    document.addEventListener("astra:journal-trade-added",render);
    document.addEventListener("astra:journal-trade-updated",render);
    document.addEventListener("astra:journal-trade-deleted",render);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();