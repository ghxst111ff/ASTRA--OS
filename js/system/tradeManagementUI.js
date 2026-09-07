/* ASTRA TRADE MANAGEMENT UI v2.0 */
(function () {
  "use strict";
  var KEY = "ASTRA_JOURNAL";

  function qs(s, r) { return (r || document).querySelector(s); }
  function getTrades() {
    try {
      if (window.ASTRA && window.ASTRA.modules && window.ASTRA.modules.journal) return window.ASTRA.modules.journal.getData().trades || [];
    } catch (e) {}
    try { return JSON.parse(localStorage.getItem(KEY) || '{"trades":[]}').trades || []; } catch (e2) { return []; }
  }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>\"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function openEdit(id) {
    if (window.ASTRA && window.ASTRA.tradeEditor && window.ASTRA.tradeEditor.open) {
      window.ASTRA.tradeEditor.open(id);
      return;
    }
    alert("ASTRA Trade Editor did not load. Please refresh ASTRA once.");
  }

  function removeTrade(id) {
    var trade = getTrades().find(function (t) { return String(t.id) === String(id); });
    if (!trade || !window.confirm("Delete " + (trade.pair || "this trade") + "? This cannot be undone.")) return;
    try {
      if (window.ASTRA && window.ASTRA.modules && window.ASTRA.modules.journal && window.ASTRA.modules.journal.deleteTrade) {
        window.ASTRA.modules.journal.deleteTrade(id);
      }
    } catch (e) { console.error("ASTRA trade delete failed", e); }
  }

  function render() {
    var card = qs("#view-journal .content-card");
    if (!card) return;
    var box = qs("#astra-trade-manager", card);
    if (!box) { box = document.createElement("div"); box.id = "astra-trade-manager"; card.appendChild(box); }
    var list = getTrades();
    var html = "<div style='margin-top:18px'><h3>MANAGE SAVED TRADES</h3><div style='font-size:8px;color:#829aa7;margin:5px 0 10px'>Edit an existing entry, replace its chart screenshot, or delete it.</div>";
    if (!list.length) html += "<div style='font-size:9px;color:#829aa7;padding:10px 0'>No saved trades yet.</div>";
    list.forEach(function (t) {
      html += "<div class='astra-managed-trade' data-id='" + esc(t.id) + "'><div><b>" + esc(t.pair || "N/A") + "</b><span>" + esc(t.direction || "") + " · " + esc(String(t.tradeType || t.source || "trade").toUpperCase()) + "</span><small>" + esc(t.date ? new Date(t.date).toLocaleDateString() : "") + "</small></div><div class='astra-managed-actions'><button type='button' data-edit-saved>EDIT</button><button type='button' data-delete-saved>DELETE</button></div></div>";
    });
    html += "</div>";
    box.innerHTML = html;

    box.querySelectorAll("[data-edit-saved]").forEach(function (button) {
      button.onclick = function (event) {
        event.preventDefault(); event.stopPropagation();
        var row = button.closest("[data-id]");
        openEdit(row && row.dataset ? row.dataset.id : null);
      };
    });
    box.querySelectorAll("[data-delete-saved]").forEach(function (button) {
      button.onclick = function (event) {
        event.preventDefault(); event.stopPropagation();
        var row = button.closest("[data-id]");
        removeTrade(row && row.dataset ? row.dataset.id : null);
      };
    });
  }

  function boot() {
    if (!qs("#astra-trade-manager-styles")) {
      var style = document.createElement("style");
      style.id = "astra-trade-manager-styles";
      style.textContent = "#astra-trade-manager .astra-managed-trade{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(90,160,190,.12);font-size:9px}#astra-trade-manager .astra-managed-trade span,#astra-trade-manager .astra-managed-trade small{display:block;color:#829aa7;font-size:7px;margin-top:3px}.astra-managed-actions{display:flex;gap:5px}.astra-managed-actions button{border:1px solid rgba(0,194,255,.35);background:#062a40;color:#a9ebff;border-radius:5px;padding:6px 9px;font-size:7px;cursor:pointer}.astra-managed-actions [data-delete-saved]{color:#ff9ca2;border-color:rgba(255,101,109,.35)}";
      document.head.appendChild(style);
    }
    render();
    document.addEventListener("astra:journal-trade-added", render);
    document.addEventListener("astra:journal-trade-updated", render);
    document.addEventListener("astra:journal-trade-deleted", render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
  console.log("ASTRA Trade Management UI v2.0 Loaded");
})();
