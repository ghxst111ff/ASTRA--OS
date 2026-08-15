/* ASTRA CONVERSATION LAYOUT v1.1 */
window.addEventListener("DOMContentLoaded", () => {
  const host = document.querySelector(".astra-says");
  const dock = document.querySelector(".conversation-dock");
  const output = document.getElementById("output");
  const command = document.querySelector(".conversation-dock .command-area");
  if (!host || !dock || !output || !command) return;

  host.classList.add("conversation-panel");
  output.classList.add("core-conversation");
  command.classList.add("core-command-area");

  // Move the existing live conversation into the single ASTRA SAYS panel.
  host.appendChild(output);
  host.appendChild(command);
  dock.remove();

  // Keep the original controls: text field, one mic, then SEND.
  // The existing top VOICE COMMAND button remains the dashboard voice control.
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

  // This file is the sole owner of the in-chat microphone.
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

  console.log("ASTRA CONVERSATION LAYOUT v1.1 — single bottom chat + one mic + SEND");
});
