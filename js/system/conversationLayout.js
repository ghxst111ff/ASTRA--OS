/* ASTRA CONVERSATION LAYOUT v2.2
   Hard-locked bottom chat surface.
   The chat is removed from normal document flow and its message history
   is the only scrolling region. New messages must never change page height.
*/
window.addEventListener("DOMContentLoaded", () => {
  const dock = document.querySelector(".conversation-dock");
  const output = document.getElementById("output");
  const command = document.querySelector(".conversation-dock .command-area");
  const main = document.querySelector(".main-area");
  if (!dock || !output || !command || !main) return;

  if (dock.parentElement !== main) main.appendChild(dock);
  if (output.parentElement !== dock) dock.insertBefore(output, command);

  dock.classList.add("conversation-panel");
  output.classList.add("core-conversation");
  command.classList.add("core-command-area");

  // Do not rely on the stylesheet alone. These values are deliberately
  // applied inline so another layout rule cannot put the chat back into flow.
  Object.assign(dock.style, {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: "calc(210px + (100vw - 210px) / 2)",
    right: "auto",
    bottom: "16px",
    top: "auto",
    transform: "translateX(-50%)",
    width: "min(1120px, calc(100vw - 250px))",
    height: "205px",
    minHeight: "205px",
    maxHeight: "205px",
    margin: "0",
    visibility: "visible",
    zIndex: "1000",
    overflow: "hidden",
    boxSizing: "border-box",
    contain: "layout paint"
  });

  // Reserve visual space in the page without putting the chat itself in flow.
  main.style.paddingBottom = "225px";

  // Only this element scrolls. The dock and the page never grow with messages.
  Object.assign(output.style, {
    display: "block",
    flex: "1 1 auto",
    minHeight: "0",
    height: "auto",
    maxHeight: "none",
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    scrollbarGutter: "stable",
    scrollBehavior: "auto"
  });

  Object.assign(command.style, {
    flex: "0 0 42px",
    minHeight: "42px",
    maxHeight: "42px",
    overflow: "hidden"
  });

  let mic = document.getElementById("chatMicBtn");
  if (!mic) {
    mic = document.createElement("button");
    mic.id = "chatMicBtn";
    mic.type = "button";
    mic.className = "chat-mic";
    mic.setAttribute("aria-label", "Talk to ASTRA");
    mic.title = "Talk to ASTRA";
    mic.textContent = "🎙";
    const send = document.getElementById("sendBtn");
    if (send) command.insertBefore(mic, send);
    else command.appendChild(mic);
  }

  const screen = document.getElementById("hiddenScreen");
  if (screen) screen.remove();

  if (!mic.dataset.voiceBound) {
    mic.dataset.voiceBound = "true";
    mic.addEventListener("click", () => {
      const voice = ASTRA?.modules?.voice;
      if (!voice) {
        AstraReply?.("Voice module is not loaded yet.");
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

  console.log("ASTRA CONVERSATION LAYOUT v2.2 — hard-locked, internally scrollable chat");
});
