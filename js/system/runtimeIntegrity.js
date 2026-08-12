/* =========================================================
   ASTRA RUNTIME INTEGRITY CONTROLLER v1.0
   One final event boundary for the dashboard/chat.
   Prevents duplicate UI handlers and keeps module data live.
========================================================= */
(() => {
    const qs = (s, r=document) => r.querySelector(s);
    const qsa = (s, r=document) => [...r.querySelectorAll(s)];
    let lastSendAt = 0;

    function showView(name){
        if (typeof window.ASTRAShowView === "function") {
            window.ASTRAShowView(name);
            return;
        }
        qsa(".view").forEach(v => v.classList.remove("active-view"));
        qs(`#view-${name}`)?.classList.add("active-view");
    }

    function addUserMessage(text){
        if (ASTRA.modules.response?.user) ASTRA.modules.response.user(text);
        else AstraReply(`YOU: ${text}`);
    }

    function send(){
        const input = qs("#commandInput");
        const text = input?.value?.trim();
        if (!text) return;
        const now = Date.now();
        if (now - lastSendAt < 300) return;
        lastSendAt = now;
        input.value = "";
        addUserMessage(text);
        try {
            if (ASTRA.modules.command?.process) {
                ASTRA.modules.command.process(text);
            } else if (ASTRA.modules.naturalIntent?.handle?.(text)) {
                // handled locally
            } else if (ASTRA.modules.ai?.ask) {
                ASTRA.modules.ai.ask(text);
            } else {
                AstraReply("ASTRA conversation engine is not available yet.");
            }
        } catch (error) {
            console.error("ASTRA SEND ERROR", error);
            AstraReply(`I couldn't process that request: ${error.message}`);
        }
    }

    function renderBacktest(tab="overview"){
        const area = qs("#backtestTabContent") || qs("#view-backtest .tab-content-area");
        if (!area) return;
        const bt = ASTRA.modules.BacktestingModule || ASTRA.modules.backtesting;
        const trades = bt?.getTrades?.() || [];
        const stats = bt?.status?.() || {};
        const wins = trades.filter(t => Number(t.pnl) > 0).length;
        const losses = trades.filter(t => Number(t.pnl) < 0).length;
        const total = trades.length;
        const winRate = total ? (wins / total * 100).toFixed(1) : "0.0";
        const pnl = trades.reduce((s,t) => s + (Number(t.pnl)||0), 0);
        const rows = trades.slice().reverse().map((t,i)=>`<div class="trade-line"><b>Backtest ${total-i}</b><span>${t.side||"—"}</span><strong class="${Number(t.pnl)>=0?"positive":"negative"}">${Number(t.pnl||0).toFixed(2)}</strong></div>`).join("");
        if(tab === "trades") area.innerHTML = `<div class="content-card"><h3>BACKTEST TRADES</h3>${rows || '<p class="empty-state">No backtest trades recorded yet.</p>'}</div>`;
        else if(tab === "performance") area.innerHTML = `<div class="stats-grid"><div><small>Trades</small><b>${total}</b></div><div><small>Win Rate</small><b>${winRate}%</b></div><div><small>Net P&amp;L</small><b class="${pnl>=0?"positive":"negative"}">${pnl.toFixed(2)}</b></div><div><small>Engine</small><b>${stats.online?"ONLINE":"OFFLINE"}</b></div></div><div class="content-card"><h3>BACKTEST PERFORMANCE</h3><p class="empty-state">This is backtesting data only. It never changes live-trading performance.</p></div>`;
        else area.innerHTML = `<div class="stats-grid"><div><small>Total Trades</small><b>${total}</b></div><div><small>Wins</small><b>${wins}</b></div><div><small>Losses</small><b>${losses}</b></div><div><small>Win Rate</small><b>${winRate}%</b></div></div><div class="content-card"><h3>BACKTEST OVERVIEW</h3><p class="empty-state">Live trading and backtesting remain completely separate datasets.</p></div>`;
    }

    function renderPerformance(tab="overview"){
        const area = qs("#performanceTabContent");
        if (!area) return;
        const data = ASTRA.modules.performance?.getData?.() || {trades:[],wins:0,losses:0};
        const trades = data.trades || [];
        const total = trades.length;
        const rate = total ? (Number(data.wins||0)/total*100).toFixed(1) : "0.0";
        if(tab === "trades") area.innerHTML = `<div class="content-card"><h3>LIVE TRADING PERFORMANCE TRADES</h3>${trades.slice().reverse().map(t=>`<div class="trade-line"><b>${t.pair||t.symbol||"Trade"}</b><span>${t.direction||"—"}</span><strong class="${t.result==="loss"?"negative":"positive"}">${t.result||"—"}</strong></div>`).join("") || '<p class="empty-state">No live trades recorded yet.</p>'}</div>`;
        else area.innerHTML = `<div class="stats-grid"><div><small>Live Trades</small><b>${total}</b></div><div><small>Wins</small><b>${data.wins||0}</b></div><div><small>Losses</small><b>${data.losses||0}</b></div><div><small>Win Rate</small><b>${rate}%</b></div></div><div class="content-card"><h3>LIVE PERFORMANCE</h3><p class="empty-state">This view is fed from live journal data only. Backtesting is kept separate.</p></div>`;
    }

    // Capture the critical controls before older UI listeners can double-handle them.
    document.addEventListener("click", e => {
        const sendBtn = e.target.closest?.("#sendBtn");
        if(sendBtn){ e.preventDefault(); e.stopImmediatePropagation(); send(); return; }

        const nav = e.target.closest?.(".nav-item[data-module]");
        if(nav){ e.preventDefault(); e.stopImmediatePropagation(); showView(nav.dataset.module); return; }

        const tab = e.target.closest?.(".inner-tabs .tab");
        if(tab){
            const view = tab.closest(".view");
            const module = view?.id?.replace(/^view-/,"");
            const name = tab.dataset.tab || tab.textContent.trim().toLowerCase().replace(/\s+/g,"-");
            if(module === "backtest"){ e.preventDefault(); e.stopImmediatePropagation(); renderBacktest(name); return; }
            if(module === "performance"){ e.preventDefault(); e.stopImmediatePropagation(); renderPerformance(name); return; }
        }
    }, true);

    document.addEventListener("keydown", e => {
        if(e.key !== "Enter" || e.shiftKey) return;
        if(document.activeElement?.id !== "commandInput") return;
        e.preventDefault(); e.stopImmediatePropagation(); send();
    }, true);

    window.ASTRA_RuntimeIntegrity = { send, showView, renderBacktest, renderPerformance };
    console.log("ASTRA Runtime Integrity Controller v1.0 Loaded");
})();
