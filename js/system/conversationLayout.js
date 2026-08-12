/* ASTRA CONVERSATION LAYOUT v1.0 */
window.addEventListener("DOMContentLoaded", () => {
  const host = document.querySelector(".astra-says");
  const dock = document.querySelector(".conversation-dock");
  const output = document.getElementById("output");
  const command = document.querySelector(".conversation-dock .command-area");
  if (!host || !dock || !output || !command) return;

  // Move the existing live conversation into the single ASTRA SAYS panel.
  host.appendChild(output);
  host.appendChild(command);
  dock.remove();

  // Keep one clean input row: text field, mic, then send.
  let mic = document.getElementById("chatMicBtn");
  if (!mic) {
    mic = document.createElement("button");
    mic.id = "chatMicBtn";
    mic.type = "button";
    mic.className = "chat-mic";
    mic.setAttribute("aria-label", "Talk to ASTRA");
    mic.textContent = "🎙";
    command.insertBefore(mic, document.getElementById("sendBtn"));
  }

  const screen = document.getElementById("hiddenScreen");
  if (screen) screen.remove();

  mic.addEventListener("click", () => {
    const voice = ASTRA?.modules?.voice;
    if (voice?.toggle) voice.toggle();
    else if (voice?.start) voice.start();
  });

  console.log("ASTRA CONVERSATION LAYOUT — single-panel mode active");
});
