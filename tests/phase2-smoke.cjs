const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const path = require("node:path");

(async () => {
  const server = spawn(process.platform === "win32" ? "python" : "python3", ["-m", "http.server", "4174", "--bind", "127.0.0.1"], {
    cwd: path.resolve(__dirname, ".."), stdio: "ignore"
  });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

  try {
    await page.route("https://small-sun-ca3e.devernholgate5.workers.dev/**", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer: "Phase 2 live-request stub passed." })
    }));

    await page.goto("http://127.0.0.1:4174/index.html", { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.ASTRA_PHASE2_READY !== undefined);
    await page.waitForFunction(() => window.ASTRA_PHASE2_READY instanceof Promise);
    await page.evaluate(() => ASTRA_PHASE2_READY);
    await page.waitForFunction(() => !!ASTRA.modules.errorRecovery && !!ASTRA.modules.knowledgeBase && !!ASTRA.modules.aiValidation);

    const result = await page.evaluate(async () => {
      const kb = ASTRA.modules.knowledgeBase;
      const entry = kb.add("Phase 2 smoke lesson", "ASTRA must verify before activation.", { tags: ["verification", "phase2"] });
      const found = kb.search("verify activation");
      const recovery = await ASTRA.modules.errorRecovery.recover(new Error("expected smoke failure"), {
        context: { test: "phase2" },
        retry: async () => "recovered"
      });
      const validation = await ASTRA.modules.aiValidation.probe();
      return {
        modules: Object.keys(ASTRA.modules),
        knowledgePersisted: !!kb.get(entry.id),
        knowledgeSearch: found.some(item => item.id === entry.id),
        recoveryPassed: recovery.recovered === true && recovery.strategy === "retry",
        validationPassed: validation.passed === true,
        validationStage: validation.stage
      };
    });

    for (const required of ["errorRecovery", "knowledgeBase", "aiValidation"]) {
      if (!result.modules.includes(required)) throw new Error(`Missing Phase 2 module: ${required}`);
    }
    if (!result.knowledgePersisted || !result.knowledgeSearch) throw new Error("Knowledge Base persistence/search failed.");
    if (!result.recoveryPassed) throw new Error("Error Recovery retry path failed.");
    if (!result.validationPassed || result.validationStage !== "live-request") throw new Error(`AI Gateway live-request validation failed: ${result.validationStage}`);
    if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

    console.log("ASTRA Phase 2 smoke test passed.");
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
