/* =========================================================
   ASTRA RUNTIME INTEGRITY CONTROLLER v2.0
   Canonical owner for critical dashboard controls.
   Quick actions, navigation, tabs, send, and voice are handled here.
   No competing quick-action handlers should exist elsewhere.
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
        else if (typeof AstraReply === "function") AstraReply(`YOU: ${text}`);
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
            if (ASTRA.modules.command?.process) ASTRA.modules.command.process(text);
            else if (ASTRA.modules.naturalIntent?.handle?.(text)) {}
            else if (ASTRA.modules.ai?.ask) ASTRA.modules.ai.ask(text);
            else if (typeof AstraReply === "function") AstraReply("ASTRA conversation engine is not available yet.");
        } catch (error) {
            console.error("ASTRA SEND ERROR", error);
            if (typeof AstraReply === "function") AstraReply(`I couldn't process that request: ${error.message}`);
        }
    }

    function reply(text){
        if (typeof AstraReply === "function") AstraReply(text);
        else console.log("VEGA:", text);
    }

    function silent(text){
        const output = qs("#output");
        if (!output) return;
        const wrap = document.createElement("div");
        wrap.className = "astra-message";
        const body = document.createElement("div");
        body.className = "message-body";
        const p = document.createElement("p");
        p.textContent = text;
        body.innerHTML = '<div class="message-speaker">VEGA</div>';
        body.appendChild(p);
        wrap.appendChild(body);
        output.appendChild(wrap);
        output.scrollTop = output.scrollHeight;
    }

    async function runTopDown(button){
        button.disabled = true;
        const old = button.textContent;
        button.textContent = "◌ STARTING TOP-DOWN...";
        try {
            const coach = ASTRA.modules.topDownCoach;
            if (!coach?.start) throw new Error("TopDownCoach unavailable");
            const result = await coach.start();
            reply(result?.message || "Okay, we're ready. Start with the WEEKLY chart.");
        } catch (error) {
            console.error("ASTRA TOP-DOWN ERROR", error);
            reply("Top-down analysis could not start. Check the console for the exact error.");
        } finally {
            button.disabled = false;
            button.textContent = old;
        }
    }

    async function runScreen(button){
        const screen = ASTRA.modules.screen;
        if (!screen) { reply("Screen module unavailable."); return; }
        try {
            if (screen.sharing) {
                screen.stopCapture?.();
                button.classList.remove("active");
            } else {
                const result = await screen.startCapture?.();
                if (result !== false) button.classList.add("active");
            }
        } catch (error) {
            console.error("ASTRA SCREEN ERROR", error);
            reply("Screen sharing could not be started.");
        }
    }

    function runMarketScan(){
        const ai = ASTRA.modules.ai;
        if (!ai?.ask) { reply("AI Gateway is not available yet."); return; }
        ai.ask("Give me a current market scan and tell me what is actually relevant to my trading plan.",{trading:true,analysis:true});
    }

    function runWatch(button){
        const observer = ASTRA.modules.proactiveMarketObserver;
        if (!observer) { reply("Screen Watch is not loaded yet."); return; }
        try {
            if (observer.status?.().watching) {
                observer.stop?.();
                button.classList.remove("active");
            } else {
                observer.start?.();
                button.classList.add("active");
            }
        } catch (error) {
            console.error("ASTRA WATCH ERROR", error);
            reply("Screen Watch could not be changed.");
        }
    }

    async function runMicTest(button){
        button.disabled = true;
        const old = button.textContent;
        button.textContent = "◌ TESTING MIC...";
        try {
            let diagnostics = ASTRA.modules.microphoneDiagnostics;
            if (!diagnostics?.test) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "js/system/microphoneDiagnostics.js?v=1.1";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                diagnostics = ASTRA.modules.microphoneDiagnostics;
            }
            silent("Microphone test started. Speak normally for about three seconds.");
            const result = await diagnostics?.test?.(3500);
            reply(result?.message || "Microphone test completed.");
        } catch (error) {
            console.error("ASTRA MIC TEST ERROR", error);
            reply("Microphone test could not be completed.");
        } finally {
            button.disabled = false;
            button.textContent = old;
        }
    }

    function handleQuickAction(button){
        const id = button.id;
        if (id === "newTradeBtn") {
            showView("journal");
            reply("Let's log it properly. Tell me the setup, direction, reason for entry, and whether it followed your rules.");
        } else if (id === "journalBtn") {
            showView("journal");
        } else if (id === "topDownBtn") {
            runTopDown(button);
        } else if (id === "analyzeBtn") {
            const result = ASTRA.modules.screen?.showAnalysis?.();
            if (!result?.ready) reply("Share your chart first, then I'll look at the setup with you.");
        } else if (id === "screenBtn") {
            runScreen(button);
        } else if (id === "viewScreenBtn") {
            runMarketScan();
        } else if (id === "watchBtn") {
            runWatch(button);
        } else if (id === "micTestBtn") {
            runMicTest(button);
        } else if (id === "voiceBtn") {
            ASTRA.modules.voice?.setOutput?.(true);
            button.classList.add("active");
            button.textContent = "◉ ASTRA VOICE ALWAYS ON";
            silent("ASTRA voice output is always on.");
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

    document.addEventListener("click", e => {
        const target = e.target?.closest?.("button");
        if (!target) return;

        if (target.matches(".quick-actions button") || target.id === "voiceBtn") {
            e.preventDefault();
            e.stopImmediatePropagation();
            handleQuickAction(target);
            return;
        }

        const sendBtn = target.closest?.("#sendBtn");
        if(sendBtn){ e.preventDefault(); e.stopImmediatePropagation(); send(); return; }

        const nav = target.closest?.(".nav-item[data-module]");
        if(nav){ e.preventDefault(); e.stopImmediatePropagation(); showView(nav.dataset.module); return; }

        const tab = target.closest?.(".inner-tabs .tab");
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
    console.log("ASTRA Runtime Integrity Controller v2.0 Loaded — canonical control owner");
})();
