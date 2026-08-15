/* ASTRA BUTTON FIX v2.5
   Dashboard controls and navigation only.
   Conversation submission is owned by runtimeIntegrity.js.
   In-chat microphone is owned by conversationLayout.js.
*/
window.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const go = name => window.ASTRAShowView?.(name);

    // Restore sidebar navigation. The markup is canonical in index.html;
    // this only wires the existing buttons to the canonical view controller.
    $$(".nav-item[data-module]").forEach(button => {
        if (button.dataset.navBound) return;
        button.dataset.navBound = "true";
        button.addEventListener("click", () => go(button.dataset.module));
    });

    let actions = $(".quick-actions");
    const main = $(".main-area");
    const dock = $(".conversation-dock");

    if (!actions && main && dock) {
        actions = document.createElement("div");
        actions.className = "quick-actions astra-restored-actions";
        actions.innerHTML = `
            <button id="newTradeBtn" type="button">＋ NEW TRADE</button>
            <button id="analyzeBtn" type="button">⌁ ANALYZE</button>
            <button id="journalBtn" type="button">＋ JOURNAL</button>
            <button id="screenBtn" type="button" title="Share your screen with ASTRA">▣ SCREEN</button>
            <button id="viewScreenBtn" type="button">◉ MARKET SCAN</button>
            <button id="watchBtn" type="button">◉ SCREEN WATCH</button>
        `;
        Object.assign(actions.style, {
            display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: "8px", width: "min(1280px, 100%)", margin: "10px auto 8px",
            position: "relative", zIndex: "110"
        });
        actions.querySelectorAll("button").forEach(button => Object.assign(button.style, {
            minHeight: "34px", border: "1px solid rgba(0,194,255,.32)", borderRadius: "7px",
            background: "linear-gradient(145deg,rgba(5,37,57,.96),rgba(2,19,32,.96))",
            color: "#8de8ff", cursor: "pointer", fontSize: "8px", fontWeight: "700",
            letterSpacing: ".35px", padding: "0 8px"
        }));
        main.insertBefore(actions, dock);
    }

    if (actions && !$("#screenBtn", actions)) {
        const screen = document.createElement("button");
        screen.id = "screenBtn"; screen.type = "button"; screen.textContent = "▣ SCREEN";
        screen.title = "Share your screen with ASTRA";
        actions.insertBefore(screen, $("#viewScreenBtn", actions) || null);
    }

    document.addEventListener("click", async event => {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.classList.contains("mini-link")) go("dashboard");
        if (button.textContent.includes("VIEW ALL TRADES")) go("journal");
        if (button.textContent.includes("NEW ENTRY")) go("journal");
        if (button.textContent.includes("VIEW FULL PLAN")) go("dashboard");

        if (button.id === "newTradeBtn" || button.textContent.includes("NEW TRADE")) {
            ASTRA.modules.coach?.setState?.("LIVE_TRADING", "new-trade-button");
            AstraReply("Before we enter, check the setup against your rules.");
        }
        if (button.id === "analyzeBtn" || button.textContent.includes("ANALYZE")) {
            const input = document.getElementById("commandInput");
            const message = "Analyze the current market context and coach me through what matters right now.";
            if (input) input.value = message;
            ASTRA.modules.ai?.ask?.(message, { trading: true, analysis: true, vision: true });
        }
        if (button.id === "journalBtn" || button.textContent.includes("JOURNAL")) go("journal");
        if (button.id === "screenBtn") {
            try {
                const module = ASTRA.modules.screen;
                if (module?.sharing) { module.stopCapture?.(); button.classList.remove("active"); }
                else { const result = await module?.startCapture?.(); if (result !== false) button.classList.add("active"); }
            } catch (error) {
                console.error("ASTRA screen button", error);
                AstraReply("I couldn't start screen sharing. Please allow screen access when your browser asks.");
            }
        }
        if (button.id === "viewScreenBtn" || button.textContent.includes("MARKET SCAN")) {
            ASTRA.modules.ai?.ask?.("Give me a current market scan and tell me what is actually relevant to my trading plan.", { trading: true, analysis: true });
        }
        if (button.id === "watchBtn" || button.textContent.includes("SCREEN WATCH")) {
            const observer = ASTRA.modules.proactiveMarketObserver;
            if (!observer) { AstraReply("Screen Watch is not loaded yet."); return; }
            const state = observer.status?.();
            if (state?.watching) { observer.stop?.(); button.classList.remove("active"); }
            else { observer.start?.(); button.classList.add("active"); }
        }
        if (button.classList.contains("voice-command")) ASTRA?.modules?.voice?.toggle?.();
        if (button.closest(".range-tabs")) {
            const group = button.closest(".range-tabs");
            $$("span,b", group).forEach(item => item.classList.remove("active"));
            button.classList.add("active");
        }
        if (button.classList.contains("toggle")) button.classList.toggle("on");
    });

    console.log("ASTRA Button Fix v2.5 Loaded — navigation + dashboard controls restored");
});
