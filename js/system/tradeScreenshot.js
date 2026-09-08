/* ASTRA TRADE SCREENSHOT ATTACHMENT v2.1 */
(function () {
  "use strict";
  var KEY = "ASTRA_TRADE_SCREENSHOTS";
  var pending = new Map();

  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (e) { return {}; }
  }

  function write(value) { localStorage.setItem(KEY, JSON.stringify(value)); }

  function compress(file) {
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
          resolve({ data: canvas.toDataURL("image/jpeg", 0.78), name: file.name, width: canvas.width, height: canvas.height });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function saveFile(tradeId, file, source) {
    if (!tradeId || !file) return Promise.resolve(null);
    return compress(file).then(function (image) {
      var all = read();
      all[tradeId] = { data: image.data, name: image.name, width: image.width, height: image.height, tradeId: tradeId, savedAt: new Date().toISOString(), source: source || "trade" };
      write(all);
      document.dispatchEvent(new CustomEvent("astra:trade-screenshot-saved", { detail: { tradeId: tradeId } }));
      return all[tradeId];
    });
  }

  function remove(tradeId) {
    var all = read();
    if (!all[tradeId]) return false;
    delete all[tradeId];
    write(all);
    return true;
  }

  function inject(form) {
    if (!form || form.dataset.screenshotReady) return;
    form.dataset.screenshotReady = "true";
    var label = document.createElement("label");
    label.className = "full";
    label.innerHTML = "CHART SCREENSHOT<input name='tradeScreenshot' type='file' accept='image/png,image/jpeg,image/webp'><small style='display:block;margin-top:5px;color:#6f8995;font-size:8px'>Optional — attach the chart screenshot you want saved with this trade.</small><div data-screenshot-preview style='margin-top:7px;font-size:8px;color:#62dcff'></div>";
    var notes = form.querySelector("textarea[name='notes']");
    if (notes && notes.parentElement) notes.parentElement.after(label); else form.appendChild(label);
    var input = label.querySelector("input[name='tradeScreenshot']");
    var preview = label.querySelector("[data-screenshot-preview]");
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) { preview.textContent = ""; pending.delete(form); return; }
      pending.set(form, file);
      preview.textContent = "Selected: " + file.name;
    });
  }

  document.addEventListener("submit", function (event) {
    var form = event.target && event.target.closest ? event.target.closest("#astraTradeForm") : null;
    if (!form) return;
    var input = form.querySelector("input[name='tradeScreenshot']");
    if (input && input.files && input.files[0]) pending.set(form, input.files[0]);
  }, true);

  document.addEventListener("astra:journal-trade-added", function (event) {
    var trade = event.detail;
    if (!trade || !trade.id) return;
    var form = document.querySelector("#astraTradeForm");
    var file = form && pending.get(form);
    if (!file) return;
    pending.delete(form);
    saveFile(trade.id, file, trade.tradeType || trade.source || "trade").catch(function (err) { console.error("ASTRA screenshot save failed", err); });
  });

  function loadScript(src) {
    var existing = document.querySelector("script[data-astra-editor-loader]");
    if (existing) return;
    var script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.astraEditorLoader = "true";
    document.head.appendChild(script);
  }

  function applyDashboardSpacing() {
    if (document.getElementById("astraDashboardSpacingFix")) return;
    var style = document.createElement("style");
    style.id = "astraDashboardSpacingFix";
    style.textContent = "/* ASTRA reference dashboard: keep quick actions lower beneath the core. */ .quick-actions{transform:translateY(26px)!important;position:relative;z-index:5}.conversation-dock{margin-top:38px!important}";
    document.head.appendChild(style);
  }

  function boot() {
    applyDashboardSpacing();
    var observer = new MutationObserver(function () {
      var form = document.querySelector("#astraTradeForm");
      if (form) inject(form);
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    var form = document.querySelector("#astraTradeForm");
    if (form) inject(form);
    loadScript("js/system/tradeEditor.js?v=5");
    loadScript("js/system/tradeManagementUI.js?v=3");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  window.ASTRA = window.ASTRA || {};
  window.ASTRA.tradeScreenshots = { get: function (id) { return read()[id] || null; }, has: function (id) { return !!read()[id]; }, saveFile: saveFile, remove: remove };
  console.log("ASTRA Trade Screenshot Attachment v2.1 Loaded — dashboard spacing aligned");
})();
