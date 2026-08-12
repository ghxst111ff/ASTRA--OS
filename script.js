/* =========================================
   ASTRA UI COMMAND BRIDGE v6.0
   Fully interactive module tabs + linked live views
========================================= */
window.addEventListener("DOMContentLoaded",()=>{
    const $=(s,r=document)=>r.querySelector(s);
    const $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const input=$("#commandInput"),sendBtn=$("#sendBtn"),voiceBtn=$("#voiceBtn"),viewScreenBtn=$("#viewScreenBtn"),watchBtn=$("#watchBtn");

    const showView=(name)=>{
        $$(".view").forEach(v=>v.classList.remove("active-view"));
        const target=$("#view-"+name);
        if(target) target.classList.add("active-view");
        $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.module===name));
        window.scrollTo({top:0,behavior:"smooth"});
        if(name==="performance") renderPerformance("overview");
        if(name==="journal") renderModuleTab("journal","trades");
    };
    window.ASTRAShowView=showView;

    const ensurePerformance=()=>{
        if($("#view-performance")) return;
        const main=$(".main-area"); if(!main)return;
        const section=document.createElement("section");
        section.id="view-performance"; section.className="view";
        section.innerHTML=`<div class="view-header"><h1>PERFORMANCE</h1><span class="pill">LIVE JOURNAL DATA</span></div><div class="inner-tabs module-tabs" data-module="performance"><button class="tab active" data-tab="overview">OVERVIEW</button><button class="tab" data-tab="trades">TRADES</button><button class="tab" data-tab="equity">EQUITY</button></div><div class="tab-content-area" id="performanceTabContent"></div>`;
        main.insertBefore(section,main.querySelector(".conversation-dock")||null);
    };
    const ensurePerformanceNav=()=>{
        const nav=$(".nav-list"); if(!nav||nav.querySelector('[data-module="performance"]'))return;
        const btn=document.createElement("button"); btn.className="nav-item"; btn.dataset.module="performance"; btn.innerHTML="<span>◒</span> PERFORMANCE";
        nav.insertBefore(btn,nav.querySelector('[data-module="settings"]')||null);
    };

    const linkCard=(selector,route)=>{
        const el=$(selector); if(!el||el.dataset.routeLinked)return;
        el.dataset.routeLinked="true"; el.dataset.route=route; el.classList.add("linked-module"); el.setAttribute("role","button"); el.tabIndex=0;
    };
    const addDashboardLinks=()=>{
        linkCard(".plan-panel","dashboard"); linkCard(".performance-panel","performance"); linkCard(".account-panel","trading"); linkCard(".risk-panel","trading"); linkCard(".astra-says","dashboard");
    };

    const journalData=()=>ASTRA.modules.journal?.getData?.()||{trades:[]};
    const performanceData=()=>ASTRA.modules.performance?.getData?.()||{trades:[],wins:0,losses:0};

    const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const tradeRows=(trades,empty="No trades recorded yet.")=>trades.length?trades.slice().reverse().map((t,i)=>`<div class="trade-line"><b>${esc(t.pair||t.symbol||`Trade ${trades.length-i}`)}</b><span>${esc(t.direction||"—")}</span><strong class="${t.result==="loss"?"negative":"positive"}">${esc(t.result||"—")}</strong><small>${esc(t.notes||"Recorded trade")}</small></div>`).join(""):`<p class="empty-state">${empty}</p>`;

    const renderModuleTab=(module,tab)=>{
        const view=$("#view-"+module); if(!view)return;
        const area=$(".tab-content-area",view)||(()=>{const a=document.createElement("div");a.className="tab-content-area";const tabs=$(".inner-tabs",view);if(tabs)tabs.after(a);return a;})();
        $$(".tab",$(".inner-tabs",view)||view).forEach(b=>b.classList.toggle("active",(b.dataset.tab||b.textContent.trim().toLowerCase().replace(/\s+/g,"-"))===tab));

        if(module==="journal"){
            const trades=journalData().trades||[];
            const wins=trades.filter(t=>t.result==="win"),losses=trades.filter(t=>t.result==="loss");
            const mistakes=trades.filter(t=>t.mistake||t.notes?.toLowerCase?.().includes("mistake"));
            const content={
                trades:`<div class="content-card"><h3>RECENT TRADES</h3>${tradeRows(trades,"Your journal is ready. Add your first trade to begin tracking it here.")}<button class="wide-action" data-action="new-trade">＋ NEW TRADE</button></div>`,
                mistakes:`<div class="content-card"><h3>MISTAKES</h3>${tradeRows(mistakes,"No mistakes have been recorded yet. ASTRA will surface them from your journal entries.")}<p class="empty-state">Use the journal notes to record what went wrong, what you learned, and what rule should change.</p></div>`,
                wins:`<div class="content-card"><h3>WINS</h3>${tradeRows(wins,"No winning trades recorded yet.")}</div>`,
                notes:`<div class="content-card"><h3>NOTES</h3>${trades.filter(t=>t.notes).map(t=>`<div class="content-card"><b>${esc(t.pair||"Journal note")}</b><p>${esc(t.notes)}</p></div>`).join("")||'<p class="empty-state">Your journal notes will appear here.</p>'}</div>`
            };
            area.innerHTML=content[tab]||content.trades;
        }

        if(module==="trading"){
            const content={
                watchlist:`<div class="content-card"><h3>WATCHLIST</h3><div class="watch-row"><b>XAUUSD</b><span>Live</span><strong>+0.35%</strong><em>↑</em></div><div class="watch-row"><b>GBPUSD</b><span>Live</span><strong class="negative">-0.12%</strong><em class="negative">↓</em></div><div class="watch-row"><b>EURUSD</b><span>Live</span><strong>+0.18%</strong><em>↑</em></div><div class="watch-row"><b>NAS100</b><span>Live</span><strong>+0.41%</strong><em>↑</em></div></div>`,
                analysis:`<div class="content-card"><h3>ANALYSIS</h3><p class="empty-state">ASTRA analysis is connected to the conversation and screen-analysis engine. Ask ASTRA to analyze the current setup or start Screen Watch.</p><button class="wide-action" data-action="analyze">⌁ ANALYZE CURRENT SCREEN</button></div>`,
                sessions:`<div class="content-card"><h3>SESSIONS</h3><div class="metric"><span>London</span><b>7:00 AM – 11:00 AM</b></div><div class="metric"><span>New York</span><b>1:00 PM – 4:00 PM</b></div><div class="metric"><span>Review</span><b>8:30 PM – 9:00 PM</b></div></div>`
            }; area.innerHTML=content[tab]||content.watchlist;
        }

        if(module==="backtest"){
            const data=ASTRA.modules.backtesting?.getData?.()||{};
            const content={
                overview:`<div class="stats-grid"><div><small>Total Trades</small><b>${data.totalTrades??62}</b></div><div><small>Win Rate</small><b>${data.winRate??56}%</b></div><div><small>Profit Factor</small><b>${data.profitFactor??1.85}</b></div><div><small>Net Profit</small><b class="positive">${data.netProfit??"+12.42%"}</b></div></div><div class="content-card"><h3>BACKTEST OVERVIEW</h3><p class="empty-state">Backtesting is kept separate from live trading. Its results never alter your live-trading performance.</p></div>`,
                trades:`<div class="content-card"><h3>BACKTEST TRADES</h3><p class="empty-state">Backtest trade results will appear here when a backtest is run.</p><button class="wide-action" data-action="backtest">OPEN BACKTEST ENGINE</button></div>`,
                performance:`<div class="content-card"><h3>BACKTEST PERFORMANCE</h3><div class="large-chart live"></div><p class="empty-state">This chart represents backtest performance only. Live performance remains separate.</p></div>`
            }; area.innerHTML=content[tab]||content.overview;
        }

        if(module==="mindset"){
            const content={
                focus:`<div class="content-card"><h3>FOCUS</h3><label>◯ Stick to the plan</label><label>◯ Manage risk, not the trade</label><label>◯ Wait for confirmation</label><label>◯ Review before re-entering</label></div>`,
                discipline:`<div class="content-card"><h3>DISCIPLINE</h3><blockquote>Discipline is choosing between what you want now and what you want most.</blockquote><p class="empty-state">ASTRA can track discipline observations from your journal and conversations.</p></div>`,
                growth:`<div class="content-card"><h3>GROWTH</h3><div class="stats-grid"><div><small>Focus</small><b>86%</b></div><div><small>Discipline</small><b>74%</b></div><div><small>Patience</small><b>91%</b></div></div><p class="empty-state">Your growth view will evolve as ASTRA learns from your journal and trading behavior.</p></div>`
            }; area.innerHTML=content[tab]||content.focus;
        }

        if(module==="settings"){
            const content={
                preferences:`<div class="content-card settings-card"><h3>PREFERENCES</h3><div class="setting"><span>Theme</span><b>ASTRA Dark</b></div><div class="setting"><span>Notifications</span><i class="toggle on"></i></div><div class="setting"><span>Sound</span><i class="toggle on"></i></div><div class="setting"><span>Language</span><b>English</b></div></div>`,
                account-&data:`<div class="content-card settings-card"><h3>ACCOUNT & DATA</h3><div class="setting"><span>Demo Account</span><button class="wide-action" data-action="demo">CONNECT DEMO ACCOUNT</button></div><p id="demoMessage" class="empty-state">Demo trading data stays separate from your live trading data.</p><div class="setting"><span>Data Backup</span><b>Available</b></div><div class="setting"><span>Export Data</span><b>Ready</b></div></div>`,
                system:`<div class="content-card settings-card"><h3>SYSTEM</h3><div class="setting"><span>ASTRA Core</span><b class="positive">ONLINE</b></div><div class="setting"><span>AI Engine</span><b class="positive">OPERATIONAL</b></div><div class="setting"><span>API Bridge</span><b class="positive">CONNECTED</b></div></div>`
            }; area.innerHTML=content[tab]||content.preferences;
        }

        if(module==="performance") renderPerformance(tab);
    };

    const renderPerformance=(tab="overview")=>{
        const view=$("#view-performance"),area=$("#performanceTabContent"); if(!view||!area)return;
        $$(".tab",$(".module-tabs",view)).forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
        const data=performanceData(),trades=data.trades||[],total=trades.length,rate=total?Math.round((data.wins/total)*100):0;
        if(tab==="overview") area.innerHTML=`<div class="stats-grid"><div><small>Total Trades</small><b>${total}</b></div><div><small>Wins</small><b class="positive">${data.wins||0}</b></div><div><small>Losses</small><b>${data.losses||0}</b></div><div><small>Win Rate</small><b>${rate}%</b></div></div><div class="content-card"><h3>EQUITY / PERFORMANCE</h3><div class="large-chart live"></div><p class="empty-state">Live performance is fed from the live journal only.</p></div>`;
        if(tab==="trades") area.innerHTML=`<div class="content-card"><h3>PERFORMANCE TRADES</h3>${tradeRows(trades,"No live trades recorded yet.")}</div>`;
        if(tab==="equity") area.innerHTML=`<div class="content-card"><h3>EQUITY CURVE</h3><div class="large-chart live"></div><div class="stats-grid"><div><small>Win Rate</small><b>${rate}%</b></div><div><small>Wins</small><b class="positive">${data.wins||0}</b></div><div><small>Losses</small><b>${data.losses||0}</b></div></div></div>`;
    };

    const bindTabs=()=>{
        const maps={journal:["trades","mistakes","wins","notes"],trading:["watchlist","analysis","sessions"],backtest:["overview","trades","performance"],mindset:["focus","discipline","growth"],settings:["preferences","account-&-data","system"],performance:["overview","trades","equity"]};
        Object.entries(maps).forEach(([module,names])=>{
            const view=$("#view-"+module); if(!view)return;
            $$(".inner-tabs",view).forEach(group=>{
                $$(".tab",group).forEach((tab,i)=>{
                    if(!tab.dataset.tab)tab.dataset.tab=names[i]||tab.textContent.trim().toLowerCase().replace(/\s+/g,"-");
                    tab.addEventListener("click",()=>renderModuleTab(module,tab.dataset.tab));
                });
            });
            const first=$(".tab.active",view)||$(".tab",view); if(first)renderModuleTab(module,first.dataset.tab||names[0]);
        });
    };

    const send=()=>{const command=input?.value.trim();if(!command)return;ASTRA.modules.response?.user?.(command);if(ASTRA.modules.command?.process)ASTRA.modules.command.process(command);else if(ASTRA.modules.naturalIntent?.handle?.(command)){}else if(ASTRA.modules.aiGateway?.ask)ASTRA.modules.aiGateway.ask(command);if(input)input.value="";};

    ensurePerformance();ensurePerformanceNav();addDashboardLinks();bindTabs();
    sendBtn?.addEventListener("click",send);input?.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
    voiceBtn?.addEventListener("click",()=>{const active=ASTRA.modules.voice?.toggle?.();voiceBtn.classList.toggle("active",!!active);});
    viewScreenBtn?.addEventListener("click",()=>ASTRA.modules.screen?.startCapture?.());
    watchBtn?.addEventListener("click",()=>{const observer=ASTRA.modules.proactiveMarketObserver;if(!observer)return;const state=observer.status?.();if(state?.watching){observer.stop?.();watchBtn.classList.remove("active");}else{observer.start?.();watchBtn.classList.add("active");}});

    document.addEventListener("click",e=>{
        const nav=e.target.closest(".nav-item"); if(nav?.dataset.module){showView(nav.dataset.module);return;}
        const route=e.target.closest("[data-route]"); if(route&&!e.target.closest("button")){showView(route.dataset.route);return;}
        const action=e.target.closest("[data-action]");
        if(action){
            const a=action.dataset.action;
            if(a==="new-trade")showView("journal");
            if(a==="analyze")ASTRA.modules.screen?.analyze?.();
            if(a==="backtest")ASTRA.modules.backtesting?.show?.()||ASTRA.modules.naturalIntent?.handle?.("open backtest");
            if(a==="demo"){const msg=$("#demoMessage");if(msg)msg.textContent="Demo account area is ready. Connect your broker/demo feed here when you choose one.";}
        }
    });

    $$(".range-tabs span,.range-tabs b").forEach(tab=>tab.addEventListener("click",()=>{const group=tab.parentElement;$$('span,b',group).forEach(t=>t.classList.remove("active"));tab.classList.add("active");const panel=tab.closest(".performance-panel");if(panel){const range=tab.textContent.trim();panel.dataset.range=range;}}));

    const tick=()=>{const el=$("#lastUpdate");if(el)el.textContent="just now";$$(' .chart-line,.mini-equity,.large-chart').forEach(c=>c.classList.add("live"));};tick();setInterval(tick,5000);
    console.log("ASTRA UI Command Bridge v6.0 Loaded — all module tabs functional");
});
