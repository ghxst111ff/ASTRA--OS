const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const path = require("node:path");

(async () => {
  const server = spawn(process.platform === "win32" ? "python" : "python3", ["-m", "http.server", "4173", "--bind", "127.0.0.1"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "ignore"
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", request => failedRequests.push(`${request.url()} — ${request.failure()?.errorText || "failed"}`));

  try {
    await page.route("https://small-sun-ca3e.devernholgate5.workers.dev/**", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ answer: "Smoke test response." })
      })
    );

    await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });

    await page.waitForSelector(".conversation-panel");
    await page.waitForSelector("#commandInput");
    await page.waitForSelector("#sendBtn");
    await page.waitForSelector("#voiceBtn");
    await page.waitForSelector("#chatMicBtn");

    if (await page.locator(".conversation-panel #chatMicBtn").count() !== 1) throw new Error("Expected exactly one in-chat microphone.");
    if (await page.locator(".conversation-panel #sendBtn").count() !== 1) throw new Error("Expected exactly one SEND button in the conversation panel.");
    if (await page.locator("#chatMicBtn").count() !== 1) throw new Error("Expected exactly one chat microphone in the document.");
    if (await page.locator("#hiddenScreen").count() !== 0) throw new Error("Legacy hidden screen control should be removed.");
    if (await page.locator("#voiceBtn").count() !== 1) throw new Error("Expected exactly one dashboard VOICE COMMAND button.");

    const modules = await page.evaluate(() => typeof ASTRA !== "undefined" ? Object.keys(ASTRA.modules || {}) : []);
    const requiredModules = ["mode", "moduleManager", "command", "response", "ai", "trading", "journal", "performance", "screen", "voice", "verification", "verifier", "installer", "backup"];
    const missingModules = requiredModules.filter(required => !modules.includes(required));
    if (missingModules.length) {
      throw new Error(`Required modules not loaded: ${missingModules.join(", ")}\nLoaded: ${modules.join(", ")}\nRuntime errors: ${errors.join(" | ")}\nFailed resources: ${failedRequests.join(" | ")}`);
    }

    await page.fill("#commandInput", "hey");
    await page.click("#sendBtn");
    await page.waitForFunction(() => document.querySelectorAll("#output .user-message").length === 1);

    const userText = await page.locator("#output .user-message .message-body").innerText();
    if (userText.trim() !== "hey") throw new Error(`Unexpected user message: ${userText}`);
    await page.waitForFunction(() => document.querySelectorAll("#output .astra-message").length >= 1);

    // Natural-language research must not require an exact command phrase.
    const researchExamples = [
      {
        text: "Astra, what's the red folder news for GBP?",
        currency: "GBP",
        requestType: "calendar_and_news",
        highImpact: true
      },
      {
        text: "What are the news coming out for the pound?",
        currency: "GBP",
        requestType: "calendar_and_news"
      },
      {
        text: "Is there anything important for sterling this week?",
        currency: "GBP",
        requestType: "research"
      },
      {
        text: "Why is GBP moving today?",
        currency: "GBP",
        requestType: "market_drivers"
      }
    ];

    for (const example of researchExamples) {
      await page.evaluate(text => ASTRA.modules.command.process(text), example.text);
      await page.waitForFunction(() => !!ASTRA.modules.research);
      const classification = await page.evaluate(text => ASTRA.modules.research.classify(text), example.text);
      if (classification.intent !== "web_research") throw new Error(`Natural research was not classified: ${example.text}`);
      if (classification.currency !== example.currency) throw new Error(`Expected ${example.currency} for: ${example.text}; got ${classification.currency}.`);
      if (classification.requestType !== example.requestType) throw new Error(`Expected ${example.requestType} for: ${example.text}; got ${classification.requestType}.`);
      if (example.highImpact && !classification.highImpact) throw new Error(`High-impact request was not detected: ${example.text}`);
    }

    const researchStatus = await page.evaluate(() => ASTRA.modules.research.status());
    if (!researchStatus.naturalLanguage) throw new Error("Research module is not marked natural-language capable.");
    if (!researchStatus.sourceGroundingRequired) throw new Error("Research module must require source grounding.");

    const loadedModules = await page.evaluate(() => Object.keys(ASTRA.modules || {}));
    if (!loadedModules.includes("research")) throw new Error("Research module was not loaded after a natural research request.");

    if (errors.length) throw new Error(`Browser console/runtime errors: ${errors.join(" | ")}`);
    if (failedRequests.length) throw new Error(`Failed resources: ${failedRequests.join(" | ")}`);

    console.log("ASTRA browser smoke test passed.");
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
