/* ASTRA CONVERSATION LAYOUT v2.0
   Keep the conversation dock as a real page-level component.
   Do not move it into the fixed-height ASTRA SAYS dashboard card.
*/
window.addEventListener("DOMContentLoaded", () => {
  const dock = document.querySelector(".conversation-dock");
  const output = document.getElementById("output");
  const command = document.querySelector(".conversation-dock .command-area");
  const main = document.querySelector(".main-area");
  if (!dock || !output || !command || !main) return;

  if (dock.parentElement !== main) main.appendChild(dock);
  if (output.parentElement !== dock) dock.insertBefore(output, command);

  Object.assign(dock.style, {
    display: "block",
    visibility: "visible",
    position: "relative",
    zIndex: "120"
  });

  output.classList.add("core-conversation");
  command.classList.add("core-command-area");

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

  console.log("ASTRA CONVERSATION LAYOUT v2.0 — page-level chat dock restored");
});
