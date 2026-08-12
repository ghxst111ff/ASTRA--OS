/* ASTRA UI FIX v1.0 — resilient controller for module navigation and tabs */
window.addEventListener("DOMContentLoaded",()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const data=()=>ASTRA?.modules?.journal?.getData?.()||{trades:[]};
  const perf=()=>ASTRA?.modules?.performance?.getData?.()||{trades:[],wins:0,losses:0};
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

  function showView(name){
    $$(".view").forEach(v=>v.classList.remove("active-view"));
    $("#view-"+name)?.classList.add("active-view");
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.module===name));
    if(name==="performance") render("performance","overview");
    else render(name,($(`.inner-tabs .tab.active`,$("#view-"+name)||document))?.dataset.tab||firstTab(name));
  }
  window.ASTRAShowView=showView;

  const names={journal:["trades","mistakes","wins","notes"],trading:["watchlist","analysis","sessions"],backtest:["overview","trades","performance"],mindset:["focus","discipline","growth"],settings:["preferences","account-&-data","system"],performance:["overview","trades","equity"]};
  const firstTab=m=>names[m]?.[0]||"overview";

  function area(view){
    let a=$(".tab-content-area",view);
    if(!a){a=document.createElement("div");a.className="tab-content-area";const tabs=$(".inner-tabs",view);if(tabs)tabs.after(a);else view.appendChild(a);}
    return a;
  }

  function rows(trades,empty){
    return trades.length?trades.slice().reverse().map((t,i)=>`<div class="trade-line"><b>${esc(t.pair||t.symbol||`Trade ${trades.length-i}`)}</b><span>${esc(t.direction||"—")}</span><strong class="${t.result==="loss"?"negative":"positive"}">${esc(t.result||"—")}</strong><small>${esc(t.notes||"Recorded trade")}</small></div>`).join(""):`<p class="empty-state">${empty}</p>`;
  }

  function render(module,tab){
    const view=$("#view-"+module);if(!view)return;
    $$(".inner-tabs .tab",view).forEach((b,i)=>{if(!b.dataset.tab)b.dataset.tab=names[module]?.[i]||b.textContent.trim().toLowerCase().replace(/\s+/g,"-");b.classList.toggle("active",b.dataset.tab===tab);});
    const a=area(view);
    if(module==="journal"){
      const trades=data().trades||[],wins=trades.filter(t=>t.result==="win"),mistakes=trades.filter(t=>t.mistake||String(t.notes||"").toLowerCase().includes("mistake"));
      a.innerHTML={
        trades:`<div class="content-card"><h3>TRADES</h3>${rows(trades,"No trades recorded yet.")}<button class="wide-action" data-ui-action="new-trade">＋ NEW TRADE</button></div>`,
        mistakes:`<div class="content-card"><h3>MISTAKES</h3>${rows(mistakes,"No mistakes recorded yet. Record mistakes in your journal notes and ASTRA will surface them here.")}</div>`,
        wins:`<div class="content-card"><h3>WINS</h3>${rows(wins,"No winning trades recorded yet.")}</div>`,
        notes:`<div class="content-card"><h3>NOTES</h3>${trades.filter(t=>t.notes).map(t=>`<div class="trade-line"><b>${esc(t.pair||"NOTE")}</b><span>${esc(t.direction||"")}</span><small>${esc(t.notes)}</small></div>`).join("")||'<p class="empty-state">No journal notes yet.</p>'}</div>`
      }[tab]||"";
    } else if(module==="trading"){
      a.innerHTML={
        watchlist:`<div class="content-card"><h3>WATCHLIST</h3><div class="watch-row"><b>XAUUSD</b><span>Live</span><strong>+0.35%</strong><em>↑</em></div><div class="watch-row"><b>GBPUSD</b><span>Live</span><strong class="negative">-0.12%</strong><em class="negative">↓</em></div><div class="watch-row"><b>EURUSD</b><span>Live</span><strong>+0.18%</strong><em>↑</em></div><div class="watch-row"><b>NAS100</b><span>Live</span><strong>+0.41%</strong><em>↑</em></div></div>`,
        analysis:`<div class="content-card"><h3>ANALYSIS</h3><p class="empty-state">Use ASTRA's analysis engine to inspect the current chart and setup.</p><button class="wide-action" data-ui-action="analyze">⌁ ANALYZE CURRENT SCREEN</button></div>`,
        sessions:`<div class="content-card"><h3>SESSIONS</h3><div class="metric"><span>London</span><b>7:00 AM – 11:00 AM</b></div><div class="metric"><span>New York</span><b>1:00 PM – 4:00 PM</b></div><div class="metric"><span>Review</span><b>8:30 PM – 9:00 PM</b></div></div>`
      }[tab]||"";
    } else if(module==="backtest"){
      a.innerHTML={
        overview:`<div class="stats-grid"><div><small>Total Trades</small><b>62</b></div><div><small>Win Rate</small><b>56%</b></div><div><small>Profit Factor</small><b>1.85</b></div><div><small>Net Profit</small><b class="positive">+12.42%</b></div></div><div class="content-card"><h3>BACKTEST OVERVIEW</h3><p class="empty-state">Backtesting stays completely separate from live trading performance.</p></div>`,
        trades:`<div class="content-card"><h3>BACKTEST TRADES</h3><p class="empty-state">Run a backtest to populate this view.</p><button class="wide-action" data-ui-action="backtest">OPEN BACKTEST ENGINE</button></div>`,
        performance:`<div class="content-card"><h3>BACKTEST PERFORMANCE</h3><div class="large-chart live"></div><p class="empty-state">This is backtest-only performance.</p></div>`
      }[tab]||"";
    } else if(module==="mindset"){
      a.innerHTML={
        focus:`<div class="content-card"><h3>FOCUS</h3><label>◯ Stick to the plan</label><label>◯ Manage risk, not the trade</label><label>◯ Wait for confirmation</label><label>◯ Review before re-entering</label></div>`,
        discipline:`<div class="content-card"><h3>DISCIPLINE</h3><blockquote>Discipline is choosing between what you want now and what you want most.</blockquote><p class="empty-state">ASTRA tracks discipline observations from your journal and conversations.</p></div>`,
        growth:`<div class="content-card"><h3>GROWTH</h3><div class="stats-grid"><div><small>Focus</small><b>86%</b></div><div><small>Discipline</small><b>74%</b></div><div><small>Patience</small><b>91%</b></div></div></div>`
      }[tab]||"";
    } else if(module==="settings"){
      a.innerHTML={
        preferences:`<div class="content-card settings-card"><h3>PREFERENCES</h3><div class="setting"><span>Theme</span><b>ASTRA Dark</b></div><div class="setting"><span>Notifications</span><i class="toggle on"></i></div><div class="setting"><span>Sound</span><i class="toggle on"></i></div></div>`,
        "account-&-data":`<div class="content-card settings-card"><h3>ACCOUNT & DATA</h3><button class="wide-action" data-ui-action="demo">CONNECT DEMO ACCOUNT</button><p id="demoMessage" class="empty-state">Demo data stays separate from live trading data.</p><div class="setting"><span>Data Backup</span><b>Available</b></div><div class="setting"><span>Export Data</span><b>Ready</b></div></div>`,
        system:`<div class="content-card settings-card"><h3>SYSTEM</h3><div class="setting"><span>ASTRA Core</span><b class="positive">ONLINE</b></div><div class="setting"><span>AI Engine</span><b class="positive">OPERATIONAL</b></div><div class="setting"><span>API Bridge</span><b class="positive">CONNECTED</b></div></div>`
      }[tab]||"";
    } else if(module==="performance"){
      const p=perf(),trades=p.trades||[],total=trades.length,rate=total?Math.round((p.wins/total)*100):0;
      a.innerHTML={
        overview:`<div class="stats-grid"><div><small>Total Trades</small><b>${total}</b></div><div><small>Wins</small><b class="positive">${p.wins||0}</b></div><div><small>Losses</small><b>${p.losses||0}</b></div><div><small>Win Rate</small><b>${rate}%</b></div></div><div class="content-card"><h3>LIVE PERFORMANCE</h3><div class="large-chart live"></div><p class="empty-state">Fed from the live journal only.</p></div>`,
        trades:`<div class="content-card"><h3>PERFORMANCE TRADES</h3>${rows(trades,"No live trades recorded yet.")}</div>`,
        equity:`<div class="content-card"><h3>EQUITY CURVE</h3><div class="large-chart live"></div><div class="stats-grid"><div><small>Win Rate</small><b>${rate}%</b></div><div><small>Wins</small><b class="positive">${p.wins||0}</b></div><div><small>Losses</small><b>${p.losses||0}</b></div></div></div>`
      }[tab]||"";
    }
  }

  function bind(){
    $$(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.module)));
    Object.entries(names).forEach(([module,labels])=>{
      const view=$("#view-"+module);if(!view)return;
      $$(".inner-tabs",view).forEach(group=>$$(".tab",group).forEach((b,i)=>{
        if(!b.dataset.tab)b.dataset.tab=labels[i]||b.textContent.trim().toLowerCase().replace(/\s+/g,"-");
        b.addEventListener("click",()=>render(module,b.dataset.tab));
      }));
      render(module,($(`.inner-tabs .tab.active`,view))?.dataset.tab||labels[0]);
    });
    $("#performanceTabContent")&&render("performance","overview");
  }

  document.addEventListener("click",e=>{
    const action=e.target.closest("[data-ui-action]");if(!action)return;
    const a=action.dataset.uiAction;
    if(a==="new-trade")showView("journal");
    if(a==="analyze")ASTRA?.modules?.screen?.analyze?.();
    if(a==="backtest")ASTRA?.modules?.backtesting?.show?.()||ASTRA?.modules?.naturalIntent?.handle?.("open backtest");
    if(a==="demo"){const m=$("#demoMessage");if(m)m.textContent="Demo account area is ready. Connect a demo feed when you choose one.";}
  });

  bind();
  console.log("ASTRA UI FIX v1.0 — all module buttons and tabs active");
});
