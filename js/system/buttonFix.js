/* ASTRA BUTTON FIX v3.2
   Restores dashboard quick actions and conversation dock.
   Voice control waits for the VoiceModule instead of failing during startup.
*/
window.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const main = $(".main-area");
  const dashboard = $("#view-dashboard");
  if (!main || !dashboard) return;
  const go = name => window.ASTRAShowView?.(name);

  async function waitForVoice(timeout = 5000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const voice = window.ASTRA?.modules?.voice;
      if (voice && typeof voice.toggle === "function") return voice;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return null;
  }

  const voiceBtn = $("#voiceBtn");
  if (voiceBtn && !voiceBtn.dataset.voiceBound) {
    voiceBtn.dataset.voiceBound = "true";
    voiceBtn.addEventListener("click", async () => {
      if (voiceBtn.dataset.voiceStarting === "true") return;
      voiceBtn.dataset.voiceStarting = "true";
      const original = voiceBtn.textContent;
      voiceBtn.disabled = true;
      voiceBtn.textContent = "◌  LOADING VOICE...";
      try {
        const voice = await waitForVoice();
        if (!voice) {
          AstraReply?.("Voice is still starting. Please try again in a moment.");
          return;
        }
        const enabled = voice.toggle();
        const active = enabled !== false && voice.status?.().listening;
        voiceBtn.classList.toggle("active", !!active);
        voiceBtn.textContent = active ? "◉  VOICE ON" : "◉  VOICE COMMAND";
      } catch (error) {
        console.error("ASTRA voice button", error);
        AstraReply?.("I couldn't start voice. Please try again.");
        voiceBtn.textContent = original;
      } finally {
        voiceBtn.disabled = false;
        voiceBtn.dataset.voiceStarting = "false";
      }
    });
  }

  $$(".nav-item[data-module]").forEach(button => {
    if (button.dataset.navBound) return;
    button.dataset.navBound = "true";
    button.addEventListener("click", () => go(button.dataset.module));
  });

  let actions = $(".quick-actions");
  if (!actions) {
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
    dashboard.appendChild(actions);
  }

  if (!$("#screenBtn", actions)) {
    const screen = document.createElement("button");
    screen.id = "screenBtn";
    screen.type = "button";
    screen.title = "Share your screen with ASTRA";
    screen.textContent = "▣ SCREEN";
    actions.insertBefore(screen, $("#viewScreenBtn", actions) || null);
  }

  const showActions = () => {
    Object.assign(actions.style, {
      display: "flex", visibility: "visible", opacity: "1", position: "relative",
      zIndex: "130", width: "100%", minHeight: "40px", margin: "12px auto 0",
      justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap"
    });
    actions.querySelectorAll("button").forEach(button => Object.assign(button.style, {
      display: "inline-flex", visibility: "visible", opacity: "1", alignItems: "center",
      justifyContent: "center", minHeight: "34px", border: "1px solid rgba(0,194,255,.45)",
      background: "#052338", color: "#a9eaff", borderRadius: "18px", padding: "8px 17px",
      fontSize: "8px", cursor: "pointer", position: "relative", zIndex: "131"
    }));
  };

  const restoreDock = () => {
    const dock = $(".conversation-dock");
    if (!dock) return;
    if (dock.parentElement !== main) main.appendChild(dock);
    const output = $("#output");
    const command = $(".conversation-dock .command-area");
    if (output && output.parentElement !== dock && command) dock.insertBefore(output, command);
    Object.assign(dock.style, {
      display: "block", visibility: "visible", opacity: "1", position: "relative",
      zIndex: "120", width: "100%", maxWidth: "1280px", margin: "12px auto 0"
    });
  };

  showActions(); restoreDock();
  setTimeout(() => { showActions(); restoreDock(); }, 0);
  setTimeout(() => { showActions(); restoreDock(); }, 250);

  if (!actions.dataset.handlersBound) {
    actions.dataset.handlersBound = "true";
    actions.addEventListener("click", async event => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.id === "newTradeBtn") { go("journal"); AstraReply?.("Let's log it properly. Tell me the setup, direction, reason for entry, and whether it followed your rules."); }
      if (button.id === "analyzeBtn") { const result = ASTRA?.modules?.screen?.showAnalysis?.(); if (!result?.ready) AstraReply?.("Share your chart first, then I'll look at the setup with you."); }
      if (button.id === "journalBtn") go("journal");
      if (button.id === "screenBtn") {
        try { const module = ASTRA?.modules?.screen; if (module?.sharing) { module.stopCapture?.(); button.classList.remove("active"); } else { const result = await module?.startCapture?.(); if (result !== false) button.classList.add("active"); } }
        catch (error) { console.error("ASTRA screen button", error); AstraReply?.("I couldn't start screen sharing. Please allow screen access when your browser asks."); }
      }
      if (button.id === "viewScreenBtn") ASTRA?.modules?.ai?.ask?.("Give me a current market scan and tell me what is actually relevant to my trading plan.", { trading: true, analysis: true });
      if (button.id === "watchBtn") { const observer = ASTRA?.modules?.proactiveMarketObserver; if (!observer) return AstraReply?.("Screen Watch is not loaded yet."); const state = observer.status?.(); if (state?.watching) { observer.stop?.(); button.classList.remove("active"); } else { observer.start?.(); button.classList.add("active"); } }
    });
  }
  console.log("ASTRA Button Fix v3.2 — voice readiness + actions + conversation dock restored");
});
