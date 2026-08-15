/* ASTRA BUTTON FIX v2.3
   Dashboard controls only.
   Conversation submission is owned by runtimeIntegrity.js.
   In-chat microphone is owned by conversationLayout.js.
   Restores the original dashboard quick-action row without duplicating
   the conversation controls.
*/
window.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const go = name => window.ASTRAShowView?.(name);

    // The dashboard originally exposed these actions directly above the chat.
    // Recreate the row if an earlier cleanup removed it from index.html.
    let actions = $(".quick-actions");
    if (!actions) {
        const dashboard = $("#view-dashboard");
        const dock = $(".conversation-dock");
        if (dashboard && dock) {
            actions = document.createElement("div");
            actions.className = "quick-actions";
            actions.innerHTML = `
                <button id="newTradeBtn">＋ NEW TRADE</button>
                <button id="analyzeBtn">⌁ ANALYZE</button>
                <button id="journalBtn">＋ JOURNAL</button>
                <button id="viewScreenBtn">◉ MARKET SCAN</button>
                <button id="watchBtn">◉ SCREEN WATCH</button>
            `;
            dashboard.insertBefore(actions, dock);
        }
    }

    // Dedicated screen control used by the dashboard quick-action row.
    if (actions && !$("#screenBtn", actions)) {
        const screen = document.createElement("button");
        screen.id = "screenBtn";
        screen.type = "button";
        screen.textContent = "▣ SCREEN";
        screen.title = "Share your screen with ASTRA";
        actions.insertBefore(screen, $("#watchBtn", actions) || null);

        screen.addEventListener("click", async () => {
            try {
                const module = ASTRA.modules.screen;
                const sharing = !!module?.sharing;
                if (sharing) {
                    module.stopCapture?.();
                    screen.classList.remove("active");
                    return;
                }

                const result = await module?.startCapture?.();
                if (result !== false) {
                    screen.classList.add("active");
                }
            } catch (error) {
                console.error("ASTRA screen button", error);
                AstraReply("I couldn't start screen sharing. Please allow screen access when your browser asks.");
            }
        });
    }

    document.addEventListener("click", event => {
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

        if (button.id === "journalBtn" || button.textContent.includes("JOURNAL")) {
            go("journal");
        }

        if (button.id === "viewScreenBtn" || button.textContent.includes("MARKET SCAN")) {
            ASTRA.modules.ai?.ask?.("Give me a current market scan and tell me what is actually relevant to my trading plan.", { trading: true, analysis: true });
        }

        if (button.id === "watchBtn" || button.textContent.includes("SCREEN WATCH")) {
            const observer = ASTRA.modules.proactiveMarketObserver;
            if (!observer) {
                AstraReply("Screen Watch is not loaded yet.");
                return;
            }
            const state = observer.status?.();
            if (state?.watching) {
                observer.stop?.();
                button.classList.remove("active");
            } else {
                observer.start?.();
                button.classList.add("active");
            }
        }

        if (button.classList.contains("voice-command")) {
            ASTRA?.modules?.voice?.toggle?.();
        }

        if (button.closest(".range-tabs")) {
            const group = button.closest(".range-tabs");
            $$("span,b", group).forEach(item => item.classList.remove("active"));
            button.classList.add("active");
        }

        if (button.classList.contains("toggle")) {
            button.classList.toggle("on");
        }
    });

    console.log("ASTRA Button Fix v2.3 Loaded — dashboard quick actions restored");
});
