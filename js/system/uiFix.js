/* ASTRA UI FIX v2.1
   Module views and dashboard routing only.
   Conversation submission is owned by runtimeIntegrity.js.
   Conversation layout/voice control is owned by conversationLayout.js.
*/
window.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    const data = () => ASTRA?.modules?.journal?.getData?.() || { trades: [] };
    const perf = () => ASTRA?.modules?.performance?.getData?.() || { trades: [], wins: 0, losses: 0 };
    const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[char]));

    const names = {
        journal: ["trades", "mistakes", "wins", "notes"],
        trading: ["watchlist", "analysis", "sessions"],
        backtest: ["overview", "trades", "performance"],
        mindset: ["focus", "discipline", "growth"],
        settings: ["preferences", "account-&-data", "system"],
        performance: ["overview", "trades", "equity"]
    };

    const firstTab = module => names[module]?.[0] || "overview";

    const area = view => {
        let target = $(".tab-content-area", view);
        if (!target) {
            target = document.createElement("div");
            target.className = "tab-content-area";
            const tabs = $(".inner-tabs", view);
            if (tabs) tabs.after(target);
            else view.appendChild(target);
        }
        return target;
    };

    const rows = (trades, empty) => trades.length
        ? trades.slice().reverse().map((trade, index) => `
            <div class="trade-line">
                <b>${esc(trade.pair || trade.symbol || `Trade ${trades.length - index}`)}</b>
                <span>${esc(trade.direction || "—")}</span>
                <strong class="${trade.result === "loss" ? "negative" : "positive"}">${esc(trade.result || "—")}</strong>
                <small>${esc(trade.notes || "Recorded trade")}</small>
            </div>
        `).join("")
        : `<p class="empty-state">${empty}</p>`;

    function render(module, tab) {
        const view = $("#view-" + module);
        if (!view) return;

        $$(".inner-tabs .tab", view).forEach((button, index) => {
            if (!button.dataset.tab) {
                button.dataset.tab = names[module]?.[index]
                    || button.textContent.trim().toLowerCase().replace(/\s+/g, "-");
            }
            button.classList.toggle("active", button.dataset.tab === tab);
        });

        const target = area(view);

        if (module === "journal") {
            const trades = data().trades || [];
            const wins = trades.filter(trade => trade.result === "win");
            const mistakes = trades.filter(trade => trade.mistake || String(trade.notes || "").toLowerCase().includes("mistake"));
            target.innerHTML = {
                trades: `<div class="content-card"><h3>TRADES</h3>${rows(trades, "No trades recorded yet.")}<button class="wide-action" data-ui-action="new-trade">＋ NEW TRADE</button></div>`,
                mistakes: `<div class="content-card"><h3>MISTAKES</h3>${rows(mistakes, "No mistakes recorded yet. Record mistakes in your journal notes and ASTRA will surface them here.")}</div>`,
                wins: `<div class="content-card"><h3>WINS</h3>${rows(wins, "No winning trades recorded yet.")}</div>`,
                notes: `<div class="content-card"><h3>NOTES</h3>${trades.filter(trade => trade.notes).map(trade => `<div class="trade-line"><b>${esc(trade.pair || "NOTE")}</b><span>${esc(trade.direction || "")}</span><small>${esc(trade.notes)}</small></div>`).join("") || '<p class="empty-state">No journal notes yet.</p>'}</div>`
            }[tab] || "";
        }

        if (module === "trading") {
            target.innerHTML = {
                watchlist: `<div class="content-card"><h3>WATCHLIST</h3><div class="watch-row"><b>XAUUSD</b><span>Live</span><strong>+0.35%</strong><em>↑</em></div><div class="watch-row"><b>GBPUSD</b><span>Live</span><strong class="negative">-0.12%</strong><em class="negative">↓</em></div><div class="watch-row"><b>EURUSD</b><span>Live</span><strong>+0.18%</strong><em>↑</em></div><div class="watch-row"><b>NAS100</b><span>Live</span><strong>+0.41%</strong><em>↑</em></div></div>`,
                analysis: `<div class="content-card"><h3>ANALYSIS</h3><p class="empty-state">Use ASTRA's analysis engine to inspect the current chart and setup.</p><button class="wide-action" data-ui-action="analyze">⌁ ANALYZE CURRENT SCREEN</button></div>`,
                sessions: `<div class="content-card"><h3>SESSIONS</h3><div class="metric"><span>London</span><b>7:00 AM – 11:00 AM</b></div><div class="metric"><span>New York</span><b>1:00 PM – 4:00 PM</b></div><div class="metric"><span>Review</span><b>8:30 PM – 9:00 PM</b></div></div>`
            }[tab] || "";
        }

        if (module === "backtest") {
            const trades = ASTRA?.modules?.backtesting?.getTrades?.() || [];
            const insight = ASTRA?.modules?.coach?.backtestInsight?.() || {};
            target.innerHTML = {
                overview: `<div class="stats-grid"><div><small>Total Trades</small><b>${insight.total ?? trades.length}</b></div><div><small>Win Rate</small><b>${insight.winRate ?? 0}%</b></div><div><small>Wins</small><b>${insight.wins ?? 0}</b></div><div><small>Net P/L</small><b class="positive">${insight.netPnl ?? 0}</b></div></div><div class="content-card"><h3>BACKTEST COACH</h3><p class="empty-state">Backtesting stays completely separate from live trading.</p></div>`,
                trades: `<div class="content-card"><h3>BACKTEST TRADES</h3>${rows(trades, "Run a backtest to populate this view.")}<button class="wide-action" data-ui-action="backtest">OPEN BACKTEST ENGINE</button></div>`,
                performance: `<div class="content-card"><h3>BACKTEST PERFORMANCE</h3><div class="large-chart live"></div><p class="empty-state">Backtest-only performance.</p></div>`
            }[tab] || "";
        }

        if (module === "mindset") {
            target.innerHTML = {
                focus: `<div class="content-card"><h3>FOCUS</h3><label>◯ Stick to the plan</label><label>◯ Manage risk, not the trade</label><label>◯ Wait for confirmation</label><label>◯ Review before re-entering</label></div>`,
                discipline: `<div class="content-card"><h3>DISCIPLINE</h3><blockquote>Discipline is choosing between what you want now and what you want most.</blockquote><p class="empty-state">ASTRA tracks discipline observations from your journal and conversations.</p></div>`,
                growth: `<div class="content-card"><h3>GROWTH</h3><div class="stats-grid"><div><small>Focus</small><b>86%</b></div><div><small>Discipline</small><b>74%</b></div><div><small>Patience</small><b>91%</b></div></div></div>`
            }[tab] || "";
        }

        if (module === "settings") {
            target.innerHTML = {
                preferences: `<div class="content-card settings-card"><h3>PREFERENCES</h3><div class="setting"><span>Theme</span><b>ASTRA Dark</b></div><div class="setting"><span>Notifications</span><i class="toggle on"></i></div><div class="setting"><span>Sound</span><i class="toggle on"></i></div></div>`,
                "account-&-data": `<div class="content-card settings-card"><h3>ACCOUNT & DATA</h3><button class="wide-action" data-ui-action="demo">CONNECT DEMO ACCOUNT</button><p id="demoMessage" class="empty-state">Demo data stays separate from live trading data.</p><div class="setting"><span>Data Backup</span><b>Available</b></div><div class="setting"><span>Export Data</span><b>Ready</b></div></div>`,
                system: `<div class="content-card settings-card"><h3>SYSTEM</h3><div class="setting"><span>ASTRA Core</span><b class="positive">ONLINE</b></div><div class="setting"><span>AI Engine</span><b class="positive">OPERATIONAL</b></div><div class="setting"><span>API Bridge</span><b class="positive">CONNECTED</b></div></div>`
            }[tab] || "";
        }

        if (module === "performance") {
            const performance = perf();
            const trades = performance.trades || [];
            const total = trades.length;
            const rate = total ? Math.round((Number(performance.wins || 0) / total) * 100) : 0;
            const insight = ASTRA?.modules?.coach?.performanceInsight?.() || {};
            target.innerHTML = {
                overview: `<div class="stats-grid"><div><small>Total Trades</small><b>${total}</b></div><div><small>Wins</small><b class="positive">${performance.wins || 0}</b></div><div><small>Losses</small><b>${performance.losses || 0}</b></div><div><small>Win Rate</small><b>${rate}%</b></div></div><div class="content-card"><h3>PERFORMANCE COACH</h3><p class="empty-state">${insight.bestSetup ? `Best recorded setup: ${esc(insight.bestSetup.name)} at ${insight.bestSetup.winRate}%.` : "ASTRA will surface performance patterns as your journal grows."}</p></div>`,
                trades: `<div class="content-card"><h3>PERFORMANCE TRADES</h3>${rows(trades, "No live trades recorded yet.")}</div>`,
                equity: `<div class="content-card"><h3>EQUITY CURVE</h3><div class="large-chart live"></div><div class="stats-grid"><div><small>Win Rate</small><b>${rate}%</b></div><div><small>Wins</small><b class="positive">${performance.wins || 0}</b></div><div><small>Losses</small><b>${performance.losses || 0}</b></div></div></div>`
            }[tab] || "";
        }
    }

    function showView(name) {
        $$(".view").forEach(view => view.classList.remove("active-view"));
        $("#view-" + name)?.classList.add("active-view");
        $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.module === name));
        render(name, firstTab(name));
    }

    window.ASTRAShowView = showView;

    // Dashboard cards retain their navigation behavior without touching conversation controls.
    const linkCard = (selector, route) => {
        const element = $(selector);
        if (!element || element.dataset.routeLinked) return;
        element.dataset.routeLinked = "true";
        element.dataset.route = route;
        element.classList.add("linked-module");
        element.setAttribute("role", "button");
        element.tabIndex = 0;
    };

    linkCard(".plan-panel", "dashboard");
    linkCard(".performance-panel", "performance");
    linkCard(".account-panel", "trading");
    linkCard(".risk-panel", "trading");

    Object.entries(names).forEach(([module, labels]) => {
        const view = $("#view-" + module);
        if (!view) return;
        $$(".inner-tabs", view).forEach(group => {
            $$(".tab", group).forEach((button, index) => {
                if (!button.dataset.tab) button.dataset.tab = labels[index] || button.textContent.trim().toLowerCase().replace(/\s+/g, "-");
                if (!button.dataset.uiBound) {
                    button.dataset.uiBound = "true";
                    button.addEventListener("click", () => render(module, button.dataset.tab));
                }
            });
        });
        render(module, $(".inner-tabs .tab.active", view)?.dataset.tab || firstTab(module));
    });

    document.addEventListener("click", event => {
        const route = event.target.closest("[data-route]");
        if (route && !event.target.closest("button")) {
            showView(route.dataset.route);
            return;
        }

        const action = event.target.closest("[data-ui-action]");
        if (!action) return;
        const name = action.dataset.uiAction;
        if (name === "new-trade") showView("journal");
        if (name === "analyze") ASTRA?.modules?.screen?.analyze?.();
        if (name === "backtest") ASTRA?.modules?.naturalIntent?.handle?.("open backtest");
        if (name === "demo") {
            const message = $("#demoMessage");
            if (message) message.textContent = "Demo account area is ready. Connect a demo feed when you choose one.";
        }
    });

    console.log("ASTRA UI Fix v2.1 Loaded — module views + dashboard routing only");
});
