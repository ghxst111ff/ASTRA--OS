/* ASTRA BUTTON FIX v2.0
   Dashboard controls only.
   Conversation submission is owned by runtimeIntegrity.js.
   Module loading is owned by index.html.
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
                const state = ASTRA.modules.screen?.status?.();
                if (state?.sharing) {
                    ASTRA.modules.screen.stopCapture?.();
                    screen.classList.remove("active");
                    AstraReply("Screen sharing stopped.");
                    return;
                }

                const result = await ASTRA.modules.screen?.startCapture?.();
                if (result !== false) {
                    screen.classList.add("active");
                    AstraReply("Screen sharing is active. I can inspect the shared screen when you ask me to.");
                }
            } catch (error) {
                console.error("ASTRA screen button", error);
                AstraReply("I couldn't start screen sharing. Please allow screen access when your browser asks.");
            }
        });
    }

    const commandArea = $(".core-command-area") || $(".command-area");
    if (commandArea && !$(".chat-mic", commandArea)) {
        const mic = document.createElement("button");
        mic.type = "button";
        mic.className = "chat-mic";
        mic.title = "Talk to ASTRA";
        mic.setAttribute("aria-label", "Talk to ASTRA");
        mic.textContent = "🎙";

        const send = $("#sendBtn", commandArea);
        if (send) commandArea.insertBefore(mic, send);
        else commandArea.appendChild(mic);

        mic.addEventListener("click", () => {
            const voice = ASTRA?.modules?.voice;
            if (!voice) {
                AstraReply("Voice module is not loaded yet.");
                return;
            }

            const state = voice.status?.();
            if (state?.listening) {
                voice.stop?.();
                mic.classList.remove("active");
            } else {
                voice.start?.();
                mic.classList.add("active");
            }
        });
    }

    if (!$("#astraConversationStyle")) {
        const style = document.createElement("style");
        style.id = "astraConversationStyle";
        style.textContent = `
            .chat-mic {
                width: 44px;
                height: 40px;
                padding: 0;
                border: 1px solid rgba(0,194,255,.42);
                background: #05243a;
                color: #78e2ff;
                border-radius: 7px;
                font-size: 16px;
                cursor: pointer;
            }
            .chat-mic.active {
                box-shadow: 0 0 16px rgba(0,190,255,.35);
                border-color: rgba(0,210,255,.8);
            }
            .quick-actions #screenBtn { cursor: pointer; }
            .quick-actions #screenBtn.active {
                box-shadow: 0 0 16px rgba(0,190,255,.35);
                border-color: rgba(0,210,255,.8);
            }
        `;
        document.head.appendChild(style);
    }

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

    console.log("ASTRA Button Fix v2.0 Loaded — controls only");
});
