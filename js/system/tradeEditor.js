/* ASTRA TRADE EDITOR v2.0
   Canonical editor for saved Live, Demo, and Backtest trades.
*/
(function () {
  "use strict";

  var JOURNAL_KEY = "ASTRA_JOURNAL";
  var SCREENSHOT_KEY = "ASTRA_TRADE_SCREENSHOTS";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function readTrades() {
    try {
      if (window.ASTRA && window.ASTRA.modules && window.ASTRA.modules.journal && window.ASTRA.modules.journal.getData) {
        var data = window.ASTRA.modules.journal.getData();
        if (data && Array.isArray(data.trades)) return data.trades;
      }
    } catch (e) {}
    try {
      var saved = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '{"trades":[]}');
      return Array.isArray(saved.trades) ? saved.trades : [];
    } catch (e2) {
      return [];
    }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function getScreenshot(id) {
    try {
      var all = JSON.parse(localStorage.getItem(SCREENSHOT_KEY) || "{}");
      return all[id] || null;
    } catch (e) {
      return null;
    }
  }

  function removeScreenshot(id) {
    try {
      var all = JSON.parse(localStorage.getItem(SCREENSHOT_KEY) || "{}");
      delete all[id];
      localStorage.setItem(SCREENSHOT_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function saveScreenshot(id, file, source) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var max = 1600;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          var all = {};
          try { all = JSON.parse(localStorage.getItem(SCREENSHOT_KEY) || "{}"); } catch (e) {}
          all[id] = {
            data: canvas.toDataURL("image/jpeg", 0.78),
            name: file.name,
            width: canvas.width,
            height: canvas.height,
            tradeId: id,
            savedAt: new Date().toISOString(),
            source: source || "trade"
          };
          localStorage.setItem(SCREENSHOT_KEY, JSON.stringify(all));
          resolve(all[id]);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function styles() {
    if (qs("#astra-trade-editor-styles")) return;
    var style = document.createElement("style");
    style.id = "astra-trade-editor-styles";
    style.textContent = ".astra-trade-editor-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px}.astra-trade-editor{width:min(560px,96vw);max-height:90vh;overflow:auto;background:#071722;border:1px solid rgba(0,194,255,.35);border-radius:10px;padding:18px;color:#d9f6ff;box-shadow:0 20px 60px rgba(0,0,0,.55)}.astra-trade-editor h2{margin:0 0 6px;font-size:16px}.astra-trade-editor p{font-size:9px;color:#829aa7}.astra-trade-editor label{display:block;margin:9px 0;font-size:8px;color:#a9ebff}.astra-trade-editor input,.astra-trade-editor select,.astra-trade-editor textarea{box-sizing:border-box;width:100%;margin-top:5px;padding:8px;background:#04111a;border:1px solid rgba(0,194,255,.22);border-radius:5px;color:#e8fbff}.astra-trade-editor textarea{min-height:70px}.astra-trade-editor img{max-width:100%;max-height:220px;margin-top:7px;border-radius:6px}.astra-trade-editor-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px}.astra-trade-editor-actions button{padding:8px 12px;border-radius:5px;border:1px solid rgba(0,194,255,.35);background:#062a40;color:#a9ebff;cursor:pointer}";
    document.head.appendChild(style);
  }

  function openEditor(id) {
    var trade = readTrades().find(function (item) { return String(item.id) === String(id); });
    if (!trade) return;

    styles();
    var old = qs(".astra-trade-editor-backdrop");
    if (old) old.remove();

    var isBacktest = String(trade.tradeType || trade.source || "").toLowerCase() === "backtest";
    var shot = getScreenshot(trade.id);
    var backdrop = document.createElement("div");
    backdrop.className = "astra-trade-editor-backdrop";

    var extra = "";
    if (isBacktest) {
      extra = "<label>TEST DATE<input name='testDate' type='date' value='" + esc(trade.testDate) + "'></label>" +
        "<label>TIMEFRAME<input name='timeframe' value='" + esc(trade.timeframe) + "'></label>" +
        "<label>SETUP<input name='setup' value='" + esc(trade.setup) + "'></label>" +
        "<label>SESSION<input name='session' value='" + esc(trade.session) + "'></label>" +
        "<label>ENTRY<input name='entry' type='number' step='any' value='" + esc(trade.entry) + "'></label>" +
        "<label>STOP LOSS<input name='stopLoss' type='number' step='any' value='" + esc(trade.stopLoss) + "'></label>" +
        "<label>TAKE PROFIT<input name='takeProfit' type='number' step='any' value='" + esc(trade.takeProfit) + "'></label>" +
        "<label>R RESULT<input name='rMultiple' type='number' step='0.01' value='" + esc(trade.rMultiple) + "'></label>" +
        "<label>LESSON LEARNED<textarea name='lesson'>" + esc(trade.lesson) + "</textarea></label>";
    }

    backdrop.innerHTML = "<div class='astra-trade-editor'><h2>EDIT " + (isBacktest ? "BACKTEST " : "") + "TRADE</h2>" +
      "<p>Update this saved trade. The existing trade ID stays unchanged.</p>" +
      "<form id='astraTradeEditForm'>" +
      "<label>SYMBOL<input name='pair' required value='" + esc(trade.pair) + "'></label>" +
      "<label>DIRECTION<select name='direction'><option value='Buy' " + (trade.direction === "Buy" ? "selected" : "") + ">Buy</option><option value='Sell' " + (trade.direction === "Sell" ? "selected" : "") + ">Sell</option></select></label>" +
      extra +
      "<label>RESULT<select name='result'><option value='win' " + (trade.result === "win" ? "selected" : "") + ">Win</option><option value='loss' " + (trade.result === "loss" ? "selected" : "") + ">Loss</option><option value='breakeven' " + (trade.result === "breakeven" ? "selected" : "") + ">Breakeven</option></select></label>" +
      "<label>P/L<input name='pnl' type='number' step='0.01' value='" + esc(trade.pnl) + "'></label>" +
      "<label>NOTES<textarea name='notes'>" + esc(trade.notes) + "</textarea></label>" +
      "<label>CHART SCREENSHOT<input name='tradeScreenshot' type='file' accept='image/png,image/jpeg,image/webp'>" +
      (shot ? "<div style='font-size:8px;color:#62dcff;margin-top:5px'>Current: " + esc(shot.name || "attached") + "</div><img src='" + shot.data + "' alt='Current trade screenshot'>" : "<div style='font-size:8px;color:#829aa7;margin-top:5px'>No screenshot attached.</div>") +
      "</label><div class='astra-trade-editor-actions'><button type='button' data-editor-cancel>CANCEL</button><button type='submit'>SAVE CHANGES</button></div></form></div>";

    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) backdrop.remove();
    });

    qs("[data-editor-cancel]", backdrop).addEventListener("click", function () { backdrop.remove(); });
    qs("#astraTradeEditForm", backdrop).addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;
      var data = new FormData(form);
      var changes = {
        pair: String(data.get("pair") || "").trim().toUpperCase(),
        direction: data.get("direction"),
        result: data.get("result"),
        pnl: Number(data.get("pnl") || 0),
        notes: String(data.get("notes") || "").trim()
      };
      if (isBacktest) {
        changes.testDate = data.get("testDate") || "";
        changes.timeframe = String(data.get("timeframe") || "").trim();
        changes.setup = String(data.get("setup") || "").trim();
        changes.session = String(data.get("session") || "").trim();
        changes.entry = Number(data.get("entry") || 0);
        changes.stopLoss = Number(data.get("stopLoss") || 0);
        changes.takeProfit = Number(data.get("takeProfit") || 0);
        changes.rMultiple = Number(data.get("rMultiple") || 0);
        changes.lesson = String(data.get("lesson") || "").trim();
      }

      var updated = null;
      try {
        if (window.ASTRA && window.ASTRA.modules && window.ASTRA.modules.journal && window.ASTRA.modules.journal.updateTrade) {
          updated = window.ASTRA.modules.journal.updateTrade(trade.id, changes);
        }
      } catch (err) {
        console.error("ASTRA trade update failed", err);
      }
      if (!updated) {
        alert("ASTRA could not update this trade.");
        return;
      }

      var file = qs("input[name='tradeScreenshot']", form).files[0];
      if (file) {
        saveScreenshot(trade.id, file, trade.tradeType || trade.source || "trade").catch(function (err) {
          console.error("ASTRA screenshot update failed", err);
        });
      }
      backdrop.remove();
    });
  }

  function deleteTrade(id) {
    var trade = readTrades().find(function (item) { return String(item.id) === String(id); });
    if (!trade) return;
    if (!window.confirm("Delete " + (trade.pair || "this trade") + "? This cannot be undone.")) return;
    try {
      if (window.ASTRA && window.ASTRA.modules && window.ASTRA.modules.journal && window.ASTRA.modules.journal.deleteTrade) {
        window.ASTRA.modules.journal.deleteTrade(id);
        removeScreenshot(id);
      }
    } catch (err) {
      console.error("ASTRA trade delete failed", err);
    }
  }

  window.ASTRA = window.ASTRA || {};
  window.ASTRA.tradeEditor = {
    ready: true,
    open: openEditor,
    delete: deleteTrade
  };

  console.log("ASTRA Trade Editor v2.0 Loaded");
})();
