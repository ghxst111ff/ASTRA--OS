/* ASTRA BUTTON FIX v2.2
   Dashboard controls only.
   Conversation submission is owned by runtimeIntegrity.js.
   In-chat microphone is owned by conversationLayout.js.
*/
window.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const go = name => window.ASTRAShowView?.(name);

    const actions = $(".quick-actions");
    if (actions && !$("#screenBtn", actions)) {
        const screen = document.createElement("button");
        screen.id = "screenBtn";
        screen.type = "button";
        screen.textContent = "▣ SCREEN";
        screen.title = "Share your screen with ASTRA";
        actions.insertBefore(screen, $("#watchBtn", actions) || null);

        screen.addEventListener("click", async () => {
            try {
                const sharing = !!ASTRA.modules.screen?.sharing;
                if (sharing) {
                    ASTRA.modules.screen.stopCapture?.();
                    screen.classList.remove("active");
                    return;
                }

                const result = await ASTRA.modules.screen?.startCapture?.();
                if (result !== false) {
                    screen.classList.add("active");
                }
            } catch (error) {
                console.error("ASTRA screen button", error);
                AstraReply("I couldn't start screen sharing. Please allow screen access when your browser asks.");
            }
        });
    }

    // Do not create or bind the in-chat microphone here.
    // conversationLayout.js owns that control so ASTRA has exactly one chat mic.

    document.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.classList.contains("mini-link")) go("dashboard");
        if (button.textContent.includes("VIEW ALL TRADES")) go("journal");
        if (button.textContent.includes("NEW ENTRY")) go("journal");
        if (button.textContent.includes("VIEW FULL PLAN")) go("dashboard");

        if (button.textContent.includes("NEW TRADE")) {
            ASTRA.modules.coach?.setState?.("LIVE_TRADING", "new-trade-button");
            AstraReply("Before we enter, check the setup against your rules.");
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

    console.log("ASTRA Button Fix v2.2 Loaded — dashboard controls only");
});
