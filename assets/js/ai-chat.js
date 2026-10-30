/**
 * AI guide chat widget
 * Lets visitors ask an AI about Ali's professional background.
 * Talks to the ai-chat server (Node.js + WebSockets + Ollama) and streams answers.
 *
 * Loaded on every page by app.js. Stays hidden until the AI server is reachable,
 * so the site never shows a broken chat.
 */
(function () {
  "use strict";

  const CONFIG = {
    // The local AI server during development, the hosted one on the live website
    wsUrl: /^(localhost|127\.0\.0\.1|)$/.test(location.hostname)
      ? "ws://localhost:8080/ws"
      : "wss://ali-ai-chat.onrender.com/ws",
    name: "Ali Haydar",
    firstName: "Ali",
    email: "alihaydar.bws@gmail.com",
    avatar: "assets/images/dp_male.svg",
    teaserDelay: 6000,
    contactNudgeAfter: 3
  };

  const QUESTIONS = {
    projects: "What projects has Ali built?",
    grenzlager: "Tell me about the Grenzlager GmbH project",
    ipa: "What was his final project (IPA)?",
    beta: "What did Ali work on at BETA Solutions?",
    role: "What kind of role is he looking for?",
    fit: "Why could he fit a junior developer role?",
    reference: "What does his employment reference say?",
    contactRef: "Who can I contact as a reference?",
    wiss: "What is Ali studying at WISS?",
    goals: "What are his career goals?",
    interests: "What is he interested in?",
    bot: "Why did he build this AI guide?"
  };

  // Page-specific invitation and suggested questions
  const PAGES = [
    { match: /experience/, teaser: "Curious about Ali's two years of client projects at BETA Solutions? Ask me.", questions: ["beta", "reference", "contactRef"] },
    { match: /education/, teaser: "Want to know more about Ali's studies and final project? Just ask.", questions: ["wiss", "ipa", "goals"] },
    { match: /projects/, teaser: "Want the story behind these projects? Ask me about Grenzlager GmbH or Ali's IPA.", questions: ["grenzlager", "ipa", "projects"] }
  ];
  const DEFAULT_PAGE = {
    teaser: "Hi! I'm Ali's AI guide 👋 Ask me about his projects, experience or goals.",
    questions: ["projects", "grenzlager", "beta", "role", "fit"]
  };
  const page = PAGES.find(p => p.match.test(location.pathname)) || DEFAULT_PAGE;

  const ICONS = {
    chat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6a8.4 8.4 0 0 1-.9-3.9A8.5 8.5 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.6"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    reset: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'
  };

  // ---------- State (kept per browser tab, so the chat survives page changes) ----------

  const STORAGE_KEY = "ha-chat";
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { saved = {}; }

  const state = {
    messages: Array.isArray(saved.messages) ? saved.messages : [], // {role: "user"|"ai"|"nudge", text}
    open: !!saved.open,
    teaserDismissed: !!saved.teaserDismissed
  };

  function save() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, Object.assign({ page: location.pathname }, params));
  }

  // ---------- Safe Markdown subset (escape first, then format) ----------

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\b([\w.+-]+@[\w-]+\.[\w.-]+\w)\b/g, '<a href="mailto:$1">$1</a>')
      .replace(/(\+\d[\d ]{7,}\d)/g, m => `<a href="tel:${m.replace(/ /g, "")}">${m}</a>`);
  }

  function renderMarkdown(text) {
    const lines = escapeHtml(text).split("\n");
    let html = "", inList = false;
    for (const raw of lines) {
      const line = raw.trim();
      const item = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
      if (item) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${inline(item[1])}</li>`;
        continue;
      }
      if (inList) { html += "</ul>"; inList = false; }
      if (line) html += `<p>${inline(line)}</p>`;
    }
    if (inList) html += "</ul>";
    return html;
  }

  // ---------- DOM ----------

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "assets/css/ai-chat.css?v=2";
  // The widget only appears once its styles are loaded, so it never shows unstyled
  // when the stylesheet is slower than the server connection (seen in Edge)
  const cssReady = new Promise(resolve => {
    css.addEventListener("load", resolve);
    css.addEventListener("error", resolve);
  });
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "ha-chat";
  root.hidden = true;
  root.innerHTML = `
    <div class="ha-teaser" role="status" hidden>
      <button type="button" class="ha-icon-btn ha-teaser-close" aria-label="Dismiss">${ICONS.close}</button>
      <p class="ha-teaser-text"></p>
      <div class="ha-chips ha-teaser-chips"></div>
    </div>

    <section class="ha-panel" role="dialog" aria-label="${CONFIG.firstName}'s AI guide" hidden>
      <header class="ha-header">
        <img class="ha-avatar" src="${CONFIG.avatar}" alt="">
        <div class="ha-title">
          <strong>${CONFIG.firstName}'s AI Guide</strong>
          <span class="ha-status"><span class="ha-status-dot"></span><span class="ha-status-text">Online</span></span>
        </div>
        <a class="ha-icon-btn ha-mail" href="mailto:${CONFIG.email}" title="Email ${CONFIG.firstName}" aria-label="Email ${CONFIG.firstName}">${ICONS.mail}</a>
        <button type="button" class="ha-icon-btn ha-reset" title="New conversation" aria-label="New conversation">${ICONS.reset}</button>
        <button type="button" class="ha-icon-btn ha-close" title="Close" aria-label="Close chat">${ICONS.close}</button>
      </header>

      <div class="ha-body">
        <div class="ha-intro">
          <p>Hi! I'm an AI guide to <strong>${CONFIG.name}</strong>'s professional background. Ask me about his experience, education, or whether he fits your role.</p>
          <div class="ha-facts">
            <span><b>Live</b> Grenzlager GmbH web app, in use by the company</span>
            <span><b>2 years</b> Client projects at BETA Solutions GmbH</span>
            <span><b>IPA</b> Automated parcel reminders &amp; storage fees, passed</span>
            <span><b>WISS</b> Studying toward Dipl. Informatiker HF</span>
          </div>
        </div>
        <div class="ha-messages" aria-live="polite"></div>
        <div class="ha-chips ha-suggestions"></div>
      </div>

      <form class="ha-form">
        <input class="ha-input" type="text" maxlength="1000" autocomplete="off" placeholder="Ask about ${CONFIG.firstName}..." aria-label="Your question">
        <button type="submit" class="ha-send" aria-label="Send">${ICONS.send}</button>
      </form>
      <p class="ha-disclaimer">Answers are based only on information ${CONFIG.firstName} has shared.</p>
    </section>

    <button type="button" class="ha-launcher" aria-label="Chat with ${CONFIG.firstName}'s AI guide" aria-expanded="false">
      <span class="ha-launcher-icon ha-launcher-open">${ICONS.chat}</span>
      <span class="ha-launcher-icon ha-launcher-close">${ICONS.close}</span>
    </button>`;
  document.body.appendChild(root);

  const $ = sel => root.querySelector(sel);
  const els = {
    teaser: $(".ha-teaser"),
    teaserText: $(".ha-teaser-text"),
    teaserChips: $(".ha-teaser-chips"),
    panel: $(".ha-panel"),
    avatar: $(".ha-avatar"),
    status: $(".ha-status-text"),
    body: $(".ha-body"),
    messages: $(".ha-messages"),
    suggestions: $(".ha-suggestions"),
    form: $(".ha-form"),
    input: $(".ha-input"),
    send: $(".ha-send"),
    launcher: $(".ha-launcher")
  };
  els.avatar.addEventListener("error", () => els.avatar.remove());

  // ---------- Custom cursor (cursor.js) ----------

  // Pages with the custom cursor: hide the native cursor in the chat too,
  // and grow the cursor over the chat's buttons like it does over links
  if (document.querySelector(".cursor-dot")) {
    document.documentElement.classList.add("ha-custom-cursor");

    const INTERACTIVE = "button, a, input";
    const setCursorEnlarged = value => {
      const c = window.cursor; // looked up lazily: cursor.js may load after this script
      if (c && typeof c.toggleCursorSize === "function" && c.cursorEnlarged !== value) {
        c.cursorEnlarged = value;
        c.toggleCursorSize();
      }
    };

    [root, ...document.querySelectorAll("[data-ha-chat-open]")].forEach(scope => {
      scope.addEventListener("mouseover", e => setCursorEnlarged(!!e.target.closest(INTERACTIVE)));
      scope.addEventListener("mouseleave", () => setCursorEnlarged(false));
    });
  }

  // ---------- Rendering ----------

  function scrollDown() {
    els.body.scrollTop = els.body.scrollHeight;
  }

  function addMessage(role, text) {
    const el = document.createElement("div");
    el.className = "ha-msg ha-" + role;
    if (role === "user") {
      el.textContent = text;
    } else {
      el.innerHTML = renderMarkdown(text);
    }
    els.messages.appendChild(el);
    scrollDown();
    return el;
  }

  function addNudge() {
    const el = document.createElement("div");
    el.className = "ha-nudge";
    el.innerHTML = `
      <p><strong>Interested in working with ${CONFIG.firstName}?</strong> He's looking for a role in software development and would be happy to hear from you.</p>
      <a class="ha-nudge-btn" href="mailto:${CONFIG.email}">${ICONS.mail}<span>Email ${CONFIG.firstName}</span></a>`;
    el.querySelector("a").addEventListener("click", () => track("ai_chat_contact_click", { source: "nudge" }));
    els.messages.appendChild(el);
    scrollDown();
  }

  function nextQuestions(count) {
    const asked = new Set(state.messages.filter(m => m.role === "user").map(m => m.text));
    const result = [];
    for (const key of [...page.questions, ...Object.keys(QUESTIONS)]) {
      const q = QUESTIONS[key];
      if (!asked.has(q) && !result.includes(q)) result.push(q);
      if (result.length === count) break;
    }
    return result;
  }

  function renderChips(container, questions, source) {
    container.innerHTML = "";
    questions.forEach(q => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ha-chip";
      chip.textContent = q;
      chip.addEventListener("click", () => ask(q, source));
      container.appendChild(chip);
    });
  }

  function renderSuggestions() {
    renderChips(els.suggestions, busy ? [] : nextQuestions(state.messages.length ? 2 : 3), "suggestion");
  }

  function restoreMessages() {
    state.messages.forEach(m => (m.role === "nudge" ? addNudge() : addMessage(m.role, m.text)));
    renderSuggestions();
  }

  // ---------- Panel ----------

  function openPanel(source, silent) {
    if (!silent && !state.open) track("ai_chat_open", { source });
    state.open = true;
    state.teaserDismissed = true;
    save();
    root.classList.add("ha-open");
    els.panel.hidden = false;
    els.teaser.hidden = true;
    els.launcher.classList.remove("ha-pulse");
    els.launcher.setAttribute("aria-expanded", "true");
    scrollDown();
    // Don't pop up the keyboard on phones
    if (!silent && window.matchMedia("(min-width: 577px)").matches) els.input.focus();
  }

  function closePanel() {
    state.open = false;
    save();
    root.classList.remove("ha-open");
    els.panel.hidden = true;
    els.launcher.setAttribute("aria-expanded", "false");
  }

  function dismissTeaser() {
    els.teaser.hidden = true;
    state.teaserDismissed = true;
    save();
  }

  function scheduleTeaser() {
    if (state.teaserDismissed || state.open || state.messages.length) return;
    els.launcher.classList.add("ha-pulse");
    setTimeout(() => {
      if (state.teaserDismissed || state.open || !online) return;
      els.teaserText.textContent = page.teaser;
      renderChips(els.teaserChips, nextQuestions(2), "teaser");
      els.teaser.hidden = false;
      track("ai_chat_teaser_shown");
    }, CONFIG.teaserDelay);
  }

  function resetChat() {
    if (busy) return;
    state.messages = [];
    save();
    els.messages.innerHTML = "";
    renderSuggestions();
    els.input.focus();
  }

  // ---------- Chat ----------

  let ws = null;
  let online = false;
  let everOnline = false;
  let retries = 0;
  let revealing = false;
  let busy = false;
  let current = null; // { el, text } - the AI answer being streamed

  function setBusy(value) {
    busy = value;
    els.send.disabled = value || !online;
  }

  function setOnline(value) {
    online = value;
    root.classList.toggle("ha-offline", !value);
    els.status.textContent = value ? "Online" : "Reconnecting...";
    els.input.disabled = !value;
    els.send.disabled = !value || busy;

    // First successful connection: reveal the widget and the page's call-to-action buttons
    if (value && root.hidden && !revealing) {
      revealing = true;
      cssReady.then(() => {
        root.hidden = false;
        document.querySelectorAll("[data-ha-chat-open]").forEach(el => { el.hidden = false; });
        restoreMessages();
        if (state.open) openPanel(null, true); else scheduleTeaser();
      });
    }
  }

  function ask(question, source) {
    if (!state.open) openPanel(source);
    send(question, source);
  }

  function send(text, source) {
    text = (text || "").trim();
    if (!text || busy || !online) return;

    const history = state.messages.filter(m => m.role === "user" || m.role === "ai").slice(-20);
    addMessage("user", text);
    state.messages.push({ role: "user", text });
    save();

    const el = addMessage("ai", "");
    el.classList.add("ha-typing");
    el.innerHTML = "<span></span><span></span><span></span>";
    current = { el, text: "" };
    setBusy(true);
    renderSuggestions();

    ws.send(JSON.stringify({ data: { message: text, history } }));
    track("ai_chat_question", { source: source || "typed" });
  }

  function finishAnswer(errorText) {
    if (!current) return;
    if (current.text.trim()) {
      state.messages.push({ role: "ai", text: current.text });
    } else if (errorText) {
      current.el.classList.remove("ha-typing");
      current.el.innerHTML = renderMarkdown(errorText);
    }
    current = null;
    setBusy(false);

    // After a few answers, invite the visitor to get in touch
    const answers = state.messages.filter(m => m.role === "ai").length;
    if (answers === CONFIG.contactNudgeAfter && !state.messages.some(m => m.role === "nudge")) {
      state.messages.push({ role: "nudge" });
      addNudge();
    }
    save();
    renderSuggestions();
  }

  function onMessage(e) {
    let msg;
    try { msg = JSON.parse(e.data); } catch (err) { return; }
    if (msg.type !== "StreamMessage" || !current) return;

    const { chunk, isDone } = msg.data;
    current.text += chunk;
    if (current.text) {
      current.el.classList.remove("ha-typing");
      current.el.innerHTML = renderMarkdown(current.text);
      scrollDown();
    }
    if (isDone) finishAnswer();
  }

  function connect() {
    // An https page can't open an unencrypted ws:// connection, so don't try
    if (location.protocol === "https:" && CONFIG.wsUrl.startsWith("ws:")) return;

    try { ws = new WebSocket(CONFIG.wsUrl); } catch (e) { return; }

    ws.addEventListener("open", () => {
      everOnline = true;
      retries = 0;
      setOnline(true);
    });
    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", () => {
      if (!everOnline) return; // Server not running: stay hidden
      if (busy) finishAnswer(`Sorry, the connection was lost. Please try again, or email ${CONFIG.firstName} at ${CONFIG.email}.`);
      setOnline(false);
      if (retries < 5) setTimeout(connect, 2000 * ++retries);
    });
  }

  // ---------- Events ----------

  els.launcher.addEventListener("click", () => {
    if (state.open) closePanel(); else openPanel("launcher");
  });
  $(".ha-close").addEventListener("click", closePanel);
  $(".ha-reset").addEventListener("click", resetChat);
  $(".ha-mail").addEventListener("click", () => track("ai_chat_contact_click", { source: "header" }));
  $(".ha-teaser-close").addEventListener("click", dismissTeaser);
  els.form.addEventListener("submit", e => {
    e.preventDefault();
    send(els.input.value, "typed");
    els.input.value = "";
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && state.open) closePanel();
  });

  // Any element with data-ha-chat-open opens the chat (optionally asking data-ha-question)
  document.querySelectorAll("[data-ha-chat-open]").forEach(el => {
    el.addEventListener("click", () => {
      const question = el.getAttribute("data-ha-question");
      if (question) ask(question, "cta"); else openPanel("cta");
    });
  });

  // A free hosted server sleeps when nobody uses it: a plain request wakes it up
  // (this can take up to a minute), then the chat connects
  const healthUrl = CONFIG.wsUrl.replace(/^ws/, "http").replace(/\/ws$/, "/health");
  fetch(healthUrl, { mode: "no-cors" }).catch(() => {}).then(connect);
})();
