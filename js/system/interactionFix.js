/* ASTRA INTERACTION FIX v1.1
   Makes visible UI controls actually actionable.
   Journal: new trade / new entry / view all trades.
   Trading: watchlist rows + tabs.
   Backtest: tabs + coach action.
   Mindset: tabs + selectable focus items.
   Settings: demo account reset.
*/
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function escapeHtml(value){return String(value??"").replace(/[&<>\"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));}
  function ensureStyles(){
    if($("#astra-interaction-styles"))return;
    const style=document.createElement("style");style.id="astra-interaction-styles";style.textContent=`
      .astra-modal-backdrop{position:fixed;inset:0;background:rgba(0,5,12,.78);backdrop-filter:blur(5px);display:grid;place-items:center;z-index:9999;padding:20px}
      .astra-modal{width:min(560px,94vw);background:linear-gradient(145deg,#061a2a,#020b14);border:1px solid rgba(0,194,255,.38);border-radius:12px;box-shadow:0 20px 70px rgba(0,0,0,.65),0 0 35px rgba(0,150,255,.12);padding:20px;color:#dff8ff}
      .astra-modal h2{font-size:15px;letter-spacing:1.4px;margin:0 0 4px}.astra-modal p{font-size:9px;color:#829aa7;margin:0 0 16px}
      .astra-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.astra-form label{font-size:8px;color:#8ba4b0}.astra-form label.full{grid-column:1/-1}
      .astra-form input,.astra-form select,.astra-form textarea{width:100%;margin-top:5px;box-sizing:border-box;border:1px solid rgba(0,194,255,.22);border-radius:6px;background:#031522;color:#e8fbff;padding:9px;font-size:9px;outline:none}
      .astra-form textarea{min-height:78px;resize:vertical}.astra-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px}.astra-modal-actions button,.astra-inline-action{border:1px solid rgba(0,194,255,.42);background:#062a40;color:#a9ebff;border-radius:6px;padding:8px 13px;font-size:8px;cursor:pointer}.astra-modal-actions .secondary{background:transparent;color:#8299a5}
      .astra-clickable{cursor:pointer!important}.astra-clickable:hover{background:rgba(0,170,235,.06)!important}.astra-selected{outline:1px solid rgba(0,194,255,.55);background:rgba(0,170,235,.09)!important}
      .astra-toast{position:fixed;right:22px;bottom:22px;z-index:10000;background:#06283b;border:1px solid rgba(0,194,255,.45);color:#b9f3ff;padding:10px 13px;border-radius:7px;font-size:9px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
      .astra-trade-list{max-height:310px;overflow:auto}.astra-trade-item{display:grid;grid-template-columns:1.1fr .8fr 1fr 1fr 1fr;gap:8px;padding:9px 0;border-bottom:1px solid rgba(90,160,190,.1);font-size:8px}.astra-trade-item strong{color:#54f4a5}.astra-trade-item strong.loss{color:#ff656d}
      @media(max-width:600px){.astra-form{grid-template-columns:1fr}.astra-form label.full{grid-column:auto}.astra-trade-item{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(style);
  }
  function toast(message){const old=$(".astra-toast");if(old)old.remove();const el=document.createElement("div");el.className="astra-toast";el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2200);}
  function closeModal(){const m=$(".astra-modal-backdrop");if(m)m.remove();}
  function openTradeModal(){
    ensureStyles();closeModal();const backdrop=document.createElement("div");backdrop.className="astra-modal-backdrop";
    backdrop.innerHTML=`<div class="astra-modal" role="dialog" aria-modal="true" aria-label="New trade"><h2>NEW TRADE</h2><p>Record a completed demo trade in ASTRA's journal and Demo Account.</p><form class="astra-form" id="astraTradeForm"><label>SYMBOL<input name="pair" placeholder="XAUUSD" required></label><label>DIRECTION<select name="direction"><option value="Buy">Buy</option><option value="Sell">Sell</option></select></label><label>RESULT<select name="result"><option value="win">Win</option><option value="loss">Loss</option><option value="breakeven">Breakeven</option></select></label><label>P/L<input name="pnl" type="number" step="0.01" placeholder="231.40"></label><label class="full">NOTES<textarea name="notes" placeholder="Why did you take the trade? What did you learn?"></textarea></label><div class="astra-modal-actions full"><button type="button" class="secondary" data-close-modal>CANCEL</button><button type="submit">SAVE TRADE</button></div></form></div>`;
    document.body.appendChild(backdrop);backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});
    $("#astraTradeForm",backdrop).addEventListener("submit",e=>{e.preventDefault();const data=new FormData(e.currentTarget);const pnl=Number(data.get("pnl")||0);const trade={pair:String(data.get("pair")||"").trim().toUpperCase(),direction:data.get("direction"),result:data.get("result"),pnl,notes:String(data.get("notes")||"").trim(),date:new Date().toISOString(),source:"demo"};try{if(ASTRA?.modules?.journal?.addTrade)ASTRA.modules.journal.addTrade(trade);else{const j=JSON.parse(localStorage.getItem("ASTRA_JOURNAL")||'{"trades":[]}');j.trades.push(trade);localStorage.setItem("ASTRA_JOURNAL",JSON.stringify(j));}}catch(err){console.error("ASTRA journal save",err);}closeModal();toast(`${trade.pair} trade saved to journal and Demo Account.`);refreshJournal();});
    $("[data-close-modal]",backdrop).addEventListener("click",closeModal);$("input[name=pair]",backdrop).focus();
  }
  function refreshJournal(){
    const view=$("#view-journal");if(!view)return;const journal=ASTRA?.modules?.journal?.getData?.()||JSON.parse(localStorage.getItem("ASTRA_JOURNAL")||'{"trades":[]}');const trades=Array.isArray(journal.trades)?journal.trades:[];const recent=view.querySelector(".content-card");if(!recent)return;const old=recent.querySelector(".astra-live-trades");if(old)old.remove();const list=document.createElement("div");list.className="astra-live-trades";list.innerHTML=`<h3>JOURNAL DATA</h3><div class="astra-trade-list">${trades.length?trades.map(t=>{const pnl=Number(t.pnl||0);return `<div class="astra-trade-item"><b>${escapeHtml(t.pair||"N/A")}</b><span>${escapeHtml(t.direction||"N/A")}</span><strong class="${pnl<0?"loss":""}">${pnl>=0?"+":""}$${pnl.toFixed(2)}</strong><span>${escapeHtml(t.result||"N/A")}</span><small>${t.date?new Date(t.date).toLocaleDateString():"—"}</small></div>`}).join(""):"<div style=\"padding:10px 0;font-size:9px;color:#8197a2\">No journal trades saved yet.</div>"}</div>`;recent.appendChild(list);
  }
  function showAllTrades(){
    ensureStyles();closeModal();const journal=ASTRA?.modules?.journal?.getData?.()||JSON.parse(localStorage.getItem("ASTRA_JOURNAL")||'{"trades":[]}');const trades=Array.isArray(journal.trades)?journal.trades:[];const backdrop=document.createElement("div");backdrop.className="astra-modal-backdrop";backdrop.innerHTML=`<div class="astra-modal"><h2>ALL TRADES</h2><p>Trades currently stored in ASTRA's journal.</p><div class="astra-trade-list">${trades.length?trades.map(t=>{const pnl=Number(t.pnl||0);return `<div class="astra-trade-item"><b>${escapeHtml(t.pair||"N/A")}</b><span>${escapeHtml(t.direction||"N/A")}</span><strong class="${pnl<0?"loss":""}">${pnl>=0?"+":""}$${pnl.toFixed(2)}</strong><span>${escapeHtml(t.result||"N/A")}</span><small>${t.date?new Date(t.date).toLocaleDateString():"—"}</small></div>`}).join(""):"<div style=\"padding:18px 0;font-size:9px;color:#8197a2\">No trades saved yet.</div>"}</div><div class="astra-modal-actions"><button class="secondary" data-close-modal>CLOSE</button><button data-new-from-list>＋ NEW TRADE</button></div></div>`;document.body.appendChild(backdrop);backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});$("[data-close-modal]",backdrop).addEventListener("click",closeModal);$("[data-new-from-list]",backdrop).addEventListener("click",openTradeModal);
  }
  function switchTabs(container,button){$$('.tab',container).forEach(t=>t.classList.remove('active'));button.classList.add('active');}
  function handleClick(event){
    const button=event.target.closest("button");const row=event.target.closest(".watch-row");
    if(row&&!button){const symbol=row.querySelector("b")?.textContent?.trim()||"market";row.classList.toggle("astra-selected");toast(`${symbol} ${row.classList.contains("astra-selected")?"added to active watch":"removed from active watch"}`);return;}
    if(!button)return;const text=(button.textContent||"").trim().toUpperCase();
    if(text.includes("NEW ENTRY")||text.includes("NEW TRADE")){event.preventDefault();event.stopPropagation();openTradeModal();return;}
    if(text.includes("VIEW ALL TRADES")){event.preventDefault();event.stopPropagation();showAllTrades();return;}
    if(button.id==="resetDemoAccountBtn"){event.preventDefault();event.stopPropagation();if(confirm("Reset the ASTRA Demo Account to $10,000 and clear its demo performance?")){ASTRA.modules.demoAccount?.reset?.();toast("Demo Account reset to $10,000.");}return;}
    if(button.classList.contains("tab")){const container=button.closest(".inner-tabs,.module-tabs");if(container)switchTabs(container,button);if(button.closest("#view-trading"))toast(`${text} tab selected.`);if(button.closest("#view-backtest"))toast(`${text} tab selected.`);if(button.closest("#view-mindset"))toast(`${text} tab selected.`);if(button.closest("#view-journal"))toast(`${text} tab selected.`);return;}
    if(text.includes("ASK ASTRA TO COACH THIS BACKTEST")){event.preventDefault();AstraReply?.("Backtest coaching is ready. Load at least two candles, run the strategy, then I can review the result.");return;}
    if(text.includes("VIEW FULL PLAN")){toast("Today's plan is already open on the dashboard.");return;}
    if(button.classList.contains("mini-link")){toast("Today's plan is already open on the dashboard.");return;}
    if(button.id==="sendBtn")return;if(button.classList.contains("toggle")){button.classList.toggle("on");return;}
  }
  function hydrateTrading(){const view=$("#view-trading");if(!view)return;const card=view.querySelector(".content-card");if(!card)return;if(!$(".watch-row",card)){const h3=card.querySelector("h3");const box=document.createElement("div");box.className="astra-watchlist-live";box.innerHTML=`<div class="watch-row header"><span>SYMBOL</span><span>STATUS</span><span>MOVE</span><span>ACTION</span></div>${[["XAUUSD","Live","+0.35%","↑"],["GBPUSD","Live","-0.12%","↓"],["EURUSD","Live","+0.18%","↑"],["NAS100","Live","+0.41%","↑"]].map(r=>`<div class="watch-row astra-clickable"><b>${r[0]}</b><span>${r[1]}</span><strong>${r[2]}</strong><em>${r[3]}</em></div>`).join("")}`;h3?.after(box);}}
  function boot(){ensureStyles();document.addEventListener("click",handleClick,true);hydrateTrading();refreshJournal();const observer=new MutationObserver(()=>{hydrateTrading();});observer.observe(document.body,{childList:true,subtree:true});console.log("ASTRA Interaction Fix v1.1 Loaded");}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
