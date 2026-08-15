/* ASTRA CONVERSATION LAYOUT v2.1
   Locked bottom chat surface.
   Messages scroll inside the chat; the page never grows from chat output.
*/
window.addEventListener("DOMContentLoaded", () => {
  const dock = document.querySelector(".conversation-dock");
  const output = document.getElementById("output");
  const command = document.querySelector(".conversation-dock .command-area");
  const main = document.querySelector(".main-area");
  if (!dock || !output || !command || !main) return;

  if (dock.parentElement !== main) main.appendChild(dock);
  if (output.parentElement !== dock) dock.insertBefore(output, command);

  // The CSS already defines the stable fixed chat surface. The previous
  // layout forgot to apply the class, so the dock stayed in normal flow and
  // every new message increased page height. Apply the class and keep the
  // viewport clear of the fixed dock.
  dock.classList.add("conversation-panel");
  output.classList.add("core-conversation");
  command.classList.add("core-command-area");

  Object.assign(dock.style, {
    display: "flex",
    visibility: "visible",
    position: "fixed",
    zIndex: "120"
  });

  // Keep the main content independently scrollable without allowing the
  // conversation surface to contribute to document height.
  main.style.paddingBottom = "225px";

  // The message history itself is the scroll container.
  output.style.minHeight = "0";
  output.style.overflowY = "auto";
  output.style.overflowX = "hidden";
  output.style.flex = "1 1 auto";
  output.style.scrollBehavior = "smooth";

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

  console.log("ASTRA CONVERSATION LAYOUT v2.1 — locked bottom chat + internal scroll restored");
});
