/* =========================================
   ASTRA v2.2 RESPONSE MODULE
   Readable conversational rendering
========================================= */

const ResponseModule = {
    name: "Response System",
    version: "2.2",

    escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    format(message) {
        let text = String(message ?? "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        const lines = text.split("\n");
        const blocks = [];
        let list = [];

        const flushList = () => {
            if (!list.length) return;
            blocks.push(`<ul>${list.map(item => `<li>${this.inline(item)}</li>`).join("")}</ul>`);
            list = [];
        };

        for (const raw of lines) {
            const line = raw.trim();

            if (!line) {
                flushList();
                continue;
            }

            const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
            if (bullet) {
                list.push(bullet[1]);
                continue;
            }

            flushList();

            if (/^#{1,3}\s+/.test(line)) {
                const title = line.replace(/^#{1,3}\s+/, "");
                blocks.push(`<h3>${this.inline(title)}</h3>`);
                continue;
            }

            if (/^[A-Z][A-Za-z0-9 /&'_-]{1,45}:$/.test(line)) {
                blocks.push(`<h4>${this.inline(line.slice(0, -1))}</h4>`);
                continue;
            }

            blocks.push(`<p>${this.inline(line)}</p>`);
        }

        flushList();
        return blocks.join("");
    },

    inline(value) {
        let text = this.escapeHTML(value);
        text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
        return text;
    },

    reply(message) {
        const output = document.getElementById("output");
        const text = String(message ?? "");

        if (!output) {
            console.log("ASTRA:", text);
        } else {
            const wrapper = document.createElement("div");
            wrapper.className = "astra-message";
            wrapper.innerHTML = `<div class="message-speaker">ASTRA</div><div class="message-body">${this.format(text)}</div>`;
            output.appendChild(wrapper);
            output.scrollTop = output.scrollHeight;
            this.animate();
        }

        ASTRA.modules.voice?.speak?.(text);
    },

    user(message) {
        const output = document.getElementById("output");
        if (!output) return;

        const wrapper = document.createElement("div");
        wrapper.className = "user-message";
        wrapper.innerHTML = `<div class="message-speaker">YOU</div><div class="message-body">${this.format(message)}</div>`;
        output.appendChild(wrapper);
        output.scrollTop = output.scrollHeight;
    },

    animate() {
        const core = document.querySelector(".core-circle");
        if (!core) return;
        core.classList.add("active");
        setTimeout(() => core.classList.remove("active"), 1500);
    }
};

ASTRA.registerModule("response", ResponseModule);
function AstraReply(message) { ResponseModule.reply(message); }
