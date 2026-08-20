/* =========================================
   ASTRA MINDSET JOURNEY
   Personal development lessons and progress
========================================= */

const MindsetJourney = (() => {
  const STORAGE_KEY = "ASTRA_MINDSET_JOURNEY_V1";

  const chapters = [
    { n: 1, title: "Introduction", lesson: "Build a clear direction and commit to becoming the person your goal requires.", takeaway: "Know where I am going and act with purpose." },
    { n: 2, title: "Desire", lesson: "Decide exactly what you want, what you will give, set a deadline, and act on a plan.", takeaway: "Show up. Follow my plan. Learn. Repeat." },
    { n: 3, title: "Faith", lesson: "Develop confidence in your ability to improve and support that confidence with action.", takeaway: "I can develop the discipline and skill I need by doing the work." },
    { n: 4, title: "Autosuggestion", lesson: "Repeatedly focus on the attitudes and habits you want to strengthen.", takeaway: "I am becoming disciplined. I follow my plan. I am patient. I learn." },
    { n: 5, title: "Specialized Knowledge", lesson: "Build deep knowledge in the specific skill you have chosen.", takeaway: "Study my system. Practice it. Learn from my mistakes." },
    { n: 6, title: "Imagination", lesson: "Think through possibilities and prepare for scenarios while staying flexible to reality.", takeaway: "Study the market. Plan scenarios. Wait for my setup. Adapt." },
    { n: 7, title: "Organized Planning", lesson: "Turn your goal into a repeatable process of action and review.", takeaway: "Prepare. Analyze. Wait. Execute. Review." },
    { n: 8, title: "Decision", lesson: "Make decisions based on your rules instead of constantly changing direction emotionally.", takeaway: "Decide my plan. Follow my rules. Accept the result. Review." },
    { n: 9, title: "Persistence", lesson: "Continue the work through setbacks while learning and correcting mistakes.", takeaway: "Review. Learn. Correct. Continue." },
    { n: 10, title: "Master Mind", lesson: "Use useful knowledge, honest feedback, and support to improve faster.", takeaway: "Learn. Get feedback. Improve." },
    { n: 11, title: "Directed Energy", lesson: "Direct strong energy and attention toward meaningful goals instead of letting distractions control you.", takeaway: "Protect my focus. Direct my energy. Stay committed." },
    { n: 12, title: "The Subconscious Mind", lesson: "Repeated thoughts and actions can help shape attitudes and habits over time.", takeaway: "Think it. Act on it. Repeat it." },
    { n: 13, title: "The Brain", lesson: "Train your thinking through study, experience, reflection, and better decisions.", takeaway: "Train my mind. Study my system. Learn from experience." },
    { n: 14, title: "The Sixth Sense", lesson: "Use reflection and experience to develop better judgment while keeping your decisions grounded in evidence and rules.", takeaway: "Reflect. Learn. Trust experience, but stay grounded in my process." }
  ];

  let state = load();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        activeChapter: 2,
        completed: [],
        notes: {},
        chiefAim: "By December 24, 2026, I will become a disciplined, consistent, and profitable trader, working toward averaging at least $500 per week. In return, I will give my time, effort, focus, and commitment. My plan is simple: show up, follow my trading plan, learn from my mistakes, and repeat every day.",
        dailyStatement: "I am becoming a disciplined trader. I follow my plan. I stay patient. I learn from my mistakes."
      };
    } catch (error) {
      return { activeChapter: 2, completed: [], notes: {}, chiefAim: "", dailyStatement: "" };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function chapterByNumber(n) {
    return chapters.find(chapter => chapter.n === Number(n)) || chapters[1];
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  }

  function render() {
    const root = document.getElementById("mindsetJourney");
    if (!root) return;
    const chapter = chapterByNumber(state.activeChapter);
    const done = state.completed.includes(chapter.n);
    const progress = Math.round((state.completed.length / chapters.length) * 100);

    root.innerHTML = `
      <div class="mindset-hero">
        <div><div class="mindset-eyebrow">ASTRA PERSONAL DEVELOPMENT JOURNEY</div><h2>THINK & GROW RICH</h2><p>Study the lesson, write what it means to you, then let ASTRA connect it to your daily trading process.</p></div>
        <div class="mindset-progress"><strong>${state.completed.length}/${chapters.length}</strong><span>chapters completed</span><div><i style="width:${progress}%"></i></div></div>
      </div>
      <div class="mindset-grid">
        <aside class="chapter-list">${chapters.map(ch => `<button class="journey-chapter ${ch.n === chapter.n ? "active" : ""} ${state.completed.includes(ch.n) ? "done" : ""}" data-chapter="${ch.n}"><b>${String(ch.n).padStart(2,"0")}</b><span>${escapeHTML(ch.title)}</span>${state.completed.includes(ch.n) ? "✓" : ""}</button>`).join("")}</aside>
        <section class="chapter-card">
          <div class="chapter-number">CHAPTER ${chapter.n}</div>
          <h2>${escapeHTML(chapter.title)}</h2>
          <div class="chapter-section"><label>CORE LESSON</label><p>${escapeHTML(chapter.lesson)}</p></div>
          <div class="chapter-section takeaway"><label>YOUR SIMPLE TAKEAWAY</label><p>${escapeHTML(chapter.takeaway)}</p></div>
          <label class="note-label">WHAT THIS CHAPTER MEANS TO ME</label>
          <textarea id="chapterNote" placeholder="Write your personal takeaway here...">${escapeHTML(state.notes[chapter.n] || "")}</textarea>
          <div class="journey-actions"><button id="saveChapterNote">SAVE NOTE</button><button id="completeChapter" class="${done ? "completed" : ""}">${done ? "✓ COMPLETED" : "MARK CHAPTER COMPLETE"}</button></div>
        </section>
      </div>
      <div class="mindset-statements">
        <section><label>MY DEFINITE CHIEF AIM</label><textarea id="chiefAim">${escapeHTML(state.chiefAim)}</textarea><button id="saveChiefAim">SAVE CHIEF AIM</button></section>
        <section><label>MY DAILY STATEMENT</label><textarea id="dailyStatement">${escapeHTML(state.dailyStatement)}</textarea><button id="saveDailyStatement">SAVE DAILY STATEMENT</button></section>
      </div>`;

    root.querySelectorAll("[data-chapter]").forEach(button => button.addEventListener("click", () => {
      state.activeChapter = Number(button.dataset.chapter); save(); render();
    }));

    document.getElementById("saveChapterNote").addEventListener("click", () => {
      state.notes[chapter.n] = document.getElementById("chapterNote").value.trim(); save(); reply("Your Chapter " + chapter.n + " personal takeaway has been saved.");
    });
    document.getElementById("completeChapter").addEventListener("click", () => {
      state.notes[chapter.n] = document.getElementById("chapterNote").value.trim();
      if (!state.completed.includes(chapter.n)) state.completed.push(chapter.n);
      save(); render(); reply("Chapter " + chapter.n + " is complete. ASTRA will remember this lesson as part of your mindset journey.");
    });
    document.getElementById("saveChiefAim").addEventListener("click", () => { state.chiefAim = document.getElementById("chiefAim").value.trim(); save(); reply("Your definite chief aim has been saved."); });
    document.getElementById("saveDailyStatement").addEventListener("click", () => { state.dailyStatement = document.getElementById("dailyStatement").value.trim(); save(); reply("Your daily statement has been saved."); });
  }

  function reply(message) {
    if (typeof AstraReply === "function") AstraReply(message);
    else if (window.ASTRA && ASTRA.reply) ASTRA.reply(message);
  }

  function init() { render(); }
  function getData() { return { chapters, state }; }
  function getCurrentLesson() { return chapterByNumber(state.activeChapter); }

  return { init, render, getData, getCurrentLesson };
})();

ASTRA.modules.mindsetJourney = MindsetJourney;
ASTRA.registerModule("mindsetJourney", MindsetJourney);
document.addEventListener("DOMContentLoaded", () => MindsetJourney.init());
console.log("Mindset Journey Module Loaded");
