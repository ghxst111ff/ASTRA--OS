/* ASTRA SCREEN BUTTON */
window.addEventListener("DOMContentLoaded", () => {
  const actions = document.querySelector(".quick-actions");
  if (!actions || document.getElementById("screenBtn")) return;
  const button = document.createElement("button");
  button.id = "screenBtn";
  button.type = "button";
  button.textContent = "▣ SCREEN";
  actions.insertBefore(button, document.getElementById("watchBtn") || null);
  button.addEventListener("click", async () => {
    try {
      if (ASTRA.modules.screen?.status?.().sharing) {
        ASTRA.modules.screen.stopCapture?.();
        button.classList.remove("active");
        AstraReply("Screen sharing stopped.");
      } else {
        const result = await ASTRA.modules.screen?.startCapture?.();
        if (result !== false) {
          button.classList.add("active");
          AstraReply("Screen sharing is active. I can now watch the visible chart.");
        }
      }
    } catch (error) {
      console.error("ASTRA screen button:", error);
      AstraReply("I couldn't start screen sharing. Please allow screen access when the browser asks.");
    }
  });
});
