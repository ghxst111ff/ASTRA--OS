/* ASTRA BUTTON FIX v3.0
   Restores dashboard quick actions and guarantees they are visible.
   Navigation is owned by runtimeIntegrity.js / uiFix.js.
*/
window.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const main = $(".main-area");
  const dashboard = $("#view-dashboard");
  if (!main || !dashboard) return;
  const go = name => window.ASTRAShowView?.(name);

  $$(".nav-item[data-module]").forEach(button => {
    if (button.dataset.navBound) return;
    button.dataset.navBound = "true";
    button.addEventListener("click", () => go(button.dataset.module));
  });

  let actions = $(".quick-actions");
  const dock = $(".conversation-dock");

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

  Object.assign(actions.style, {
    display: "flex",
    visibility: "visible",
    opacity: "1",
    position: "relative",
    zIndex: "130",
    width: "100%",
    minHeight: "40px",
    margin: "12px auto 0",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  });

  if (!$("#screenBtn", actions)) {
    const screen = document.createElement("button");
    screen.id = "screenBtn";
    screen.type = "button";
    screen.title = "Share your screen with ASTRA";
    screen.textContent = "▣ SCREEN";
    actions.insertBefore(screen, $("#viewScreenBtn", actions) || null);
  }

  actions.querySelectorAll("button").forEach(button => Object.assign(button.style, {
    display: "inline-flex",
    visibility: "visible",
    opacity: "1",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    border: "1px solid rgba(0,194,255,.45)",
    background: "#052338",
    color: "#a9eaff",
    borderRadius: "18px",
    padding: "8px 17px",
    fontSize: "8px",
    cursor: "pointer",
    position: "relative",
    zIndex: "131"
  }));

  if (dock) {
    if (dock.parentElement !== main) main.appendChild(dock);
    Object.assign(dock.style, {
      display: "block",
      visibility: "visible",
      opacity: "1",
      position: "relative",
      zIndex: "120",
      width: "100%"
    });
  }

  if (!actions.dataset.handlersBound) {
    actions.dataset.handlersBound = "true";
    actions.addEventListener("click", async event => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.id === "newTradeBtn") {
        go("journal");
        AstraReply?.("Let's log it properly. Tell me the setup, direction, reason for entry, and whether it followed your rules.");
      }
      if (button.id === "analyzeBtn") {
        const result = ASTRA?.modules?.screen?.showAnalysis?.();
        if (!result?.ready) AstraReply?.("Share your chart first, then I'll look at the setup with you.");
      }
      if (button.id === "journalBtn") go("journal");
      if (button.id === "screenBtn") {
        try {
          const module = ASTRA?.modules?.screen;
          if (module?.sharing) {
            module.stopCapture?.();
            button.classList.remove("active");
          } else {
            const result = await module?.startCapture?.();
            if (result !== false) button.classList.add("active");
          }
        } catch (error) {
          console.error("ASTRA screen button", error);
          AstraReply?.("I couldn't start screen sharing. Please allow screen access when your browser asks.");
        }
      }
      if (button.id === "viewScreenBtn") {
        ASTRA?.modules?.ai?.ask?.("Give me a current market scan and tell me what is actually relevant to my trading plan.", { trading: true, analysis: true });
      }
      if (button.id === "watchBtn") {
        const observer = ASTRA?.modules?.proactiveMarketObserver;
        if (!observer) return AstraReply?.("Screen Watch is not loaded yet.");
        const state = observer.status?.();
        if (state?.watching) {
          observer.stop?.();
          button.classList.remove("active");
        } else {
          observer.start?.();
          button.classList.add("active");
        }
      }
    });
  }

  console.log("ASTRA Button Fix v3.0 — quick actions forced visible");
});
