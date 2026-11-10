/* ==========================================================================
   Arena Direct Chatbot Widget — Two-Way Live SSE Bridge + GitHub Sync
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_BRIDGE_KEY = "studio_chat_bridge_url_v1";
  const STORAGE_STATIC_MSGS_KEY = "studio_chat_static_msgs_v1";
  const GITHUB_REPO_ISSUES_NEW =
    "https://github.com/ariagh1386atomv1/dr-farzane-ghasemi-site/issues/new";

  const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (val) => String(val).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

  function escapeHtml(raw) {
    return String(raw ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMessageHtml(raw) {
    const escaped = escapeHtml(raw);
    return escaped
      .replace(/`([^`\n]+)`/g, '<code class="chat-msg__code">$1</code>')
      .replace(/\n/g, "<br/>");
  }

  function formatTimeFa(iso) {
    try {
      const d = iso ? new Date(iso) : new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return toFa(`${hh}:${mm}`);
    } catch {
      return "";
    }
  }

  function normalizeBaseUrl(raw) {
    const trimmed = String(raw || "").trim().replace(/\/+$/, "");
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  }

  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetStorage(key, val) {
    try {
      if (val === null || val === undefined || val === "") {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, String(val));
      }
    } catch {
      /* ignore private-mode storage restrictions */
    }
  }

  function notify(msg) {
    if (window.StudioHub && typeof window.StudioHub.showToast === "function") {
      window.StudioHub.showToast(msg);
    }
  }

  function defaultStaticMessages() {
    return [
      {
        id: "static_welcome_1",
        seq: 1,
        role: "agent",
        author: "ایجنت اصلی چت آرنا",
        text:
          "سلام! 👋 شما روی نسخه استاتیک داشبورد (GitHub Pages) هستید.\n" +
          "• برای اتصال زنده دوطرفه (SSE)، آیکون تنظیمات بالا را بزنید و لینک پیش‌نمایش زنده آرنا را وارد کنید.\n" +
          "• یا همین‌جا پیامتان را بفرستید تا با یک کلیک بسته آماده چت آرنا یا GitHub Issue برایتان ساخته شود.",
        sectionId: null,
        sectionTitle: null,
        source: "static-init",
        status: "delivered",
        action: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  function buildLocalHelper(text, sectionId) {
    const low = String(text || "").toLowerCase();
    const targetId = sectionId || "01-header";
    if (["دانلود هدر", "فایل هدر", "download header", "json هدر"].some((k) => low.includes(k))) {
      return {
        text: "فایل استاندارد «۰۱ — هدر اصلی داروخانه آنلاین» آماده دانلود مستقیم است:",
        action: { type: "download", sectionId: targetId, label: "دانلود مستقیم هدر (.json)" },
      };
    }
    if (
      ["راهنمای نصب", "چطور نصب", "چجوری ایمپورت", "نصب در وودمارت", "ایمپورت هدر"].some((k) =>
        low.includes(k),
      )
    ) {
      return {
        text: "مراحل کامل نصب هدر در قالب وودمارت و المنتور پرو را از دکمه زیر ببینید:",
        action: { type: "open-guide", sectionId: targetId, label: "باز کردن راهنمای گام‌به‌گام" },
      };
    }
    if (["پیش نمایش", "پریویو", "نمای موبایل"].some((k) => low.includes(k))) {
      return {
        text: "پیش‌نمایش زنده دسکتاپ، تبلت و موبایل بخش را باز کنید:",
        action: { type: "open-modal", sectionId: targetId, label: "باز کردن پیش‌نمایش تمام‌صفحه" },
      };
    }
    return null;
  }

  const state = {
    isOpen: false,
    settingsOpen: false,
    mode: "connecting", // "live" | "static"
    bridgeUrl: normalizeBaseUrl(safeGetStorage(STORAGE_BRIDGE_KEY) || ""),
    messages: [],
    latestSeq: 0,
    unreadForAgent: 0,
    unreadAgentReplies: 0,
    attachedSection: null, // { id, title }
    sending: false,
    eventSource: null,
    pollTimer: null,
  };

  const els = {
    topbarBtn: document.getElementById("topbar-chat-btn"),
    topbarDot: document.getElementById("topbar-chat-dot"),
    fab: document.getElementById("chat-fab"),
    fabBadge: document.getElementById("chat-fab-badge"),
    panel: document.getElementById("chat-panel"),
    statusPill: document.getElementById("chat-status-pill"),
    statusText: document.getElementById("chat-status-text"),
    settingsToggle: document.getElementById("chat-settings-toggle"),
    clearBtn: document.getElementById("chat-clear-btn"),
    closeBtn: document.getElementById("chat-close-btn"),
    settingsBox: document.getElementById("chat-settings-box"),
    bridgeInput: document.getElementById("chat-bridge-input"),
    bridgeSaveBtn: document.getElementById("chat-bridge-save"),
    stream: document.getElementById("chat-stream"),
    wakeupBar: document.getElementById("chat-wakeup-bar"),
    wakeupText: document.getElementById("chat-wakeup-text"),
    wakeupCopyBtn: document.getElementById("chat-wakeup-copy"),
    quickRow: document.getElementById("chat-quick-row"),
    contextBar: document.getElementById("chat-context-bar"),
    contextLabel: document.getElementById("chat-context-label"),
    contextRemoveBtn: document.getElementById("chat-context-remove"),
    form: document.getElementById("chat-composer-form"),
    input: document.getElementById("chat-composer-input"),
    sendBtn: document.getElementById("chat-composer-send"),
  };

  if (!els.panel || !els.fab) return;

  function apiEndpoint(path) {
    return `${state.bridgeUrl}${path}`;
  }

  function statusLabelForMsg(msg) {
    if (msg.role !== "user") return null;
    if (msg.status === "replied") {
      return { text: "پاسخ داده شد ✓✓", cls: "chat-msg__ticks is-replied" };
    }
    if (msg.status === "read_by_arena") {
      return { text: "دیده شد توسط ایجنت ✓✓", cls: "chat-msg__ticks" };
    }
    if (msg.status === "local_only") {
      return { text: "ذخیره محلی · آماده انتقال", cls: "chat-msg__ticks" };
    }
    return { text: "ثبت در صندوق چت آرنا ✓", cls: "chat-msg__ticks" };
  }

  function formatArenaClipboardPacket(msg) {
    const secLine = msg.sectionTitle ? `[بخش: ${msg.sectionTitle}]\n` : "";
    return `پیام ارسالی از داشبورد:\n${secLine}${msg.text}`;
  }

  function buildGithubIssueUrl(msg) {
    const title = `[پیام داشبورد] ${msg.sectionTitle ? `${msg.sectionTitle} — ` : ""}${msg.text.slice(0, 48)}`;
    const body =
      `### پیام ارسال‌شده از چت‌بات داشبورد\n\n` +
      (msg.sectionTitle ? `**بخش مرتبط:** ${msg.sectionTitle} (\`${msg.sectionId || ""}\`)\n\n` : "") +
      `${msg.text}\n`;
    const params = new URLSearchParams({ title, body });
    return `${GITHUB_REPO_ISSUES_NEW}?${params.toString()}`;
  }

  function updateConnectionUI() {
    const isLive = state.mode === "live";
    els.statusPill.classList.toggle("is-static", !isLive);
    if (els.topbarDot) els.topbarDot.classList.toggle("is-static", !isLive);

    els.statusText.textContent = isLive
      ? "متصل زنده به چت آرنا · SSE"
      : "حالت GitHub Pages · پل همگام‌ساز";

    if (els.wakeupBar) {
      if (isLive && state.unreadForAgent > 0) {
        els.wakeupBar.hidden = false;
        els.wakeupText.textContent = `${toFa(state.unreadForAgent)} پیام در صندوق آرنا منتظر بررسی است`;
      } else {
        els.wakeupBar.hidden = true;
      }
    }
  }

  function updateUnreadBadge() {
    if (!els.fabBadge) return;
    if (state.unreadAgentReplies > 0 && !state.isOpen) {
      els.fabBadge.hidden = false;
      els.fabBadge.textContent = toFa(state.unreadAgentReplies);
    } else {
      els.fabBadge.hidden = true;
      els.fabBadge.textContent = "۰";
    }
  }

  function updateContextUI() {
    if (!els.contextBar) return;
    if (state.attachedSection) {
      els.contextBar.hidden = false;
      els.contextLabel.textContent = `درباره بخش: ${state.attachedSection.title}`;
    } else {
      els.contextBar.hidden = true;
      els.contextLabel.textContent = "";
    }
  }

  function renderMessages(scrollToEnd = true) {
    els.stream.innerHTML = state.messages
      .map((msg) => {
        const roleClass =
          msg.role === "user"
            ? "chat-msg--user"
            : msg.role === "assistant"
              ? "chat-msg--assistant"
              : "chat-msg--agent";

        const verifiedBadge =
          msg.role === "agent"
            ? '<span class="chat-msg__verified">تأییدشده</span>'
            : "";

        const sectionPill = msg.sectionTitle
          ? `<div class="chat-msg__section-tag">📌 ${escapeHtml(msg.sectionTitle)}</div>`
          : "";

        let actionHtml = "";
        if (msg.action && msg.action.type) {
          actionHtml = `
            <button
              type="button"
              class="chat-msg__action-btn"
              data-chat-action="${escapeHtml(msg.action.type)}"
              data-section-id="${escapeHtml(msg.action.sectionId || "01-header")}"
            >
              <span>${escapeHtml(msg.action.label || "مشاهده")}</span>
            </button>
          `;
        }

        let staticToolsHtml = "";
        if (msg.role === "user" && msg.status === "local_only") {
          staticToolsHtml = `
            <div class="chat-msg__bridge-tools">
              <button type="button" class="chat-mini-link" data-bridge-tool="copy-packet" data-msg-id="${escapeHtml(msg.id)}">
                کپی برای چت آرنا
              </button>
              <a class="chat-mini-link" href="${escapeHtml(buildGithubIssueUrl(msg))}" target="_blank" rel="noopener noreferrer">
                ارسال به GitHub Issue
              </a>
            </div>
          `;
        }

        const ticks = statusLabelForMsg(msg);
        const ticksHtml = ticks
          ? `<span class="${ticks.cls}" data-msg-ticks="${escapeHtml(msg.id)}">${ticks.text}</span>`
          : "";

        return `
          <div class="chat-msg ${roleClass}" data-msg-id="${escapeHtml(msg.id)}">
            <div class="chat-msg__sender">
              <span>${escapeHtml(msg.author || (msg.role === "user" ? "شما" : "ایجنت چت آرنا"))}</span>
              ${verifiedBadge}
            </div>
            <div class="chat-msg__bubble">
              ${sectionPill}
              <div>${formatMessageHtml(msg.text)}</div>
              ${actionHtml}
              ${staticToolsHtml}
            </div>
            <div class="chat-msg__meta">
              <span class="num">${formatTimeFa(msg.createdAt)}</span>
              ${ticksHtml}
            </div>
          </div>
        `;
      })
      .join("");

    if (scrollToEnd) {
      els.stream.scrollTop = els.stream.scrollHeight;
    }
  }

  function upsertMessage(msg, notifyIfClosed = false) {
    if (!msg || !msg.id) return false;
    const idx = state.messages.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      state.messages[idx] = { ...state.messages[idx], ...msg };
      if (typeof msg.seq === "number" && msg.seq > state.latestSeq) {
        state.latestSeq = msg.seq;
      }
      renderMessages(false);
      return false;
    }
    state.messages.push(msg);
    if (typeof msg.seq === "number" && msg.seq > state.latestSeq) {
      state.latestSeq = msg.seq;
    }
    renderMessages(true);

    if (notifyIfClosed && msg.role === "agent" && !state.isOpen) {
      state.unreadAgentReplies += 1;
      updateUnreadBadge();
      notify("پاسخ جدید از ایجنت چت آرنا دریافت شد");
    }
    return true;
  }

  function applyStatusUpdate(ids, newStatus, unreadForAgent) {
    if (Array.isArray(ids)) {
      const idSet = new Set(ids);
      state.messages.forEach((m) => {
        if (idSet.has(m.id)) m.status = newStatus;
      });
    }
    if (typeof unreadForAgent === "number") {
      state.unreadForAgent = unreadForAgent;
    }
    updateConnectionUI();
    renderMessages(false);
  }

  function saveStaticMessages() {
    safeSetStorage(STORAGE_STATIC_MSGS_KEY, JSON.stringify(state.messages.slice(-100)));
  }

  function loadStaticMessages() {
    const raw = safeGetStorage(STORAGE_STATIC_MSGS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.messages = parsed;
          return;
        }
      } catch {
        /* ignore invalid cache */
      }
    }
    state.messages = defaultStaticMessages();
  }

  function closeLiveStreams() {
    if (state.eventSource) {
      try {
        state.eventSource.close();
      } catch {
        /* ignore */
      }
      state.eventSource = null;
    }
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  async function pollIncremental() {
    if (state.mode !== "live") return;
    try {
      const res = await fetch(apiEndpoint(`/api/chat/messages?after_seq=${state.latestSeq}`), {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.ok) return;
      if (typeof data.unreadForAgent === "number") {
        state.unreadForAgent = data.unreadForAgent;
        updateConnectionUI();
      }
      (data.messages || []).forEach((m) => upsertMessage(m, true));
    } catch {
      /* transient network error */
    }
  }

  function openSseStream() {
    closeLiveStreams();
    if (typeof window.EventSource === "function") {
      try {
        const es = new window.EventSource(apiEndpoint("/api/chat/stream"));
        es.addEventListener("connected", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (typeof payload.unreadForAgent === "number") {
              state.unreadForAgent = payload.unreadForAgent;
              updateConnectionUI();
            }
          } catch {
            /* ignore */
          }
        });
        es.addEventListener("message", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (typeof payload.unreadForAgent === "number") {
              state.unreadForAgent = payload.unreadForAgent;
              updateConnectionUI();
            }
            if (payload.message) {
              upsertMessage(payload.message, true);
            }
          } catch {
            /* ignore */
          }
        });
        es.addEventListener("status_update", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            applyStatusUpdate(payload.messageIds, payload.status, payload.unreadForAgent);
          } catch {
            /* ignore */
          }
        });
        es.addEventListener("reset", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            state.messages = Array.isArray(payload.messages) ? payload.messages : [];
            state.latestSeq = state.messages.reduce((mx, m) => Math.max(mx, m.seq || 0), 0);
            state.unreadForAgent = payload.unreadForAgent || 0;
            updateConnectionUI();
            renderMessages(true);
          } catch {
            /* ignore */
          }
        });
        state.eventSource = es;
      } catch {
        /* fallback to polling below */
      }
    }
    state.pollTimer = setInterval(pollIncremental, 4000);
  }

  async function flushUnsyncedStaticMessages(unsyncedList) {
    for (const m of unsyncedList) {
      try {
        await fetch(apiEndpoint("/api/chat/send"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: m.text,
            sectionId: m.sectionId || null,
            sectionTitle: m.sectionTitle || null,
            source: "github-pages-synced",
          }),
        });
      } catch {
        /* ignore individual flush error */
      }
    }
    safeSetStorage(STORAGE_STATIC_MSGS_KEY, "");
  }

  async function connectBridge(customBaseUrl) {
    if (customBaseUrl !== undefined) {
      state.bridgeUrl = normalizeBaseUrl(customBaseUrl);
      safeSetStorage(STORAGE_BRIDGE_KEY, state.bridgeUrl);
    }
    if (els.bridgeInput) {
      els.bridgeInput.value = state.bridgeUrl;
    }

    const pendingLocal = state.messages.filter(
      (m) => m.role === "user" && m.status === "local_only",
    );

    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 3500) : null;
      const statusRes = await fetch(apiEndpoint("/api/chat/status"), {
        cache: "no-store",
        signal: controller ? controller.signal : undefined,
      });
      if (timer) clearTimeout(timer);
      if (!statusRes.ok) throw new Error("bridge_unavailable");
      const statusJson = await statusRes.json();
      if (!statusJson || statusJson.mode !== "live-bridge") {
        throw new Error("invalid_bridge");
      }

      if (pendingLocal.length > 0) {
        await flushUnsyncedStaticMessages(pendingLocal);
      }

      const histRes = await fetch(apiEndpoint("/api/chat/messages?after_seq=0"), {
        cache: "no-store",
      });
      const histJson = await histRes.json();

      state.mode = "live";
      state.messages = Array.isArray(histJson.messages) ? histJson.messages : [];
      state.latestSeq = histJson.latestSeq || 0;
      state.unreadForAgent = histJson.unreadForAgent || 0;

      updateConnectionUI();
      renderMessages(true);
      openSseStream();
      return true;
    } catch {
      closeLiveStreams();
      state.mode = "static";
      state.unreadForAgent = 0;
      loadStaticMessages();
      updateConnectionUI();
      renderMessages(true);
      return false;
    }
  }

  async function sendMessage(rawText) {
    const text = String(rawText ?? els.input.value ?? "").trim();
    if (!text || state.sending) return null;

    const section = state.attachedSection ? { ...state.attachedSection } : null;
    state.sending = true;
    els.sendBtn.disabled = true;

    try {
      if (state.mode === "live") {
        const res = await fetch(apiEndpoint("/api/chat/send"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sectionId: section ? section.id : null,
            sectionTitle: section ? section.title : null,
            source: state.bridgeUrl ? "github-pages-live" : "arena-preview",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          notify(data?.error || "ارسال پیام با خطا مواجه شد");
          return null;
        }
        els.input.value = "";
        autoResizeInput();
        state.attachedSection = null;
        updateContextUI();

        state.unreadForAgent =
          typeof data.unreadForAgent === "number" ? data.unreadForAgent : state.unreadForAgent + 1;
        (data.created || [data.message]).forEach((m) => upsertMessage(m, false));
        updateConnectionUI();
        return data.message;
      }

      /* Static GitHub Pages Fallback Mode */
      const nowIso = new Date().toISOString();
      const userMsg = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        seq: state.messages.length + 1,
        role: "user",
        author: "شما (از داشبورد)",
        text,
        sectionId: section ? section.id : null,
        sectionTitle: section ? section.title : null,
        source: "github-pages-static",
        status: "local_only",
        action: null,
        createdAt: nowIso,
      };
      els.input.value = "";
      autoResizeInput();
      state.attachedSection = null;
      updateContextUI();

      upsertMessage(userMsg, false);

      const helper = buildLocalHelper(text, section ? section.id : null);
      if (helper) {
        upsertMessage(
          {
            id: `local_helper_${Date.now()}`,
            seq: state.messages.length + 1,
            role: "assistant",
            author: "دستیار فوری استودیو",
            text: helper.text,
            sectionId: section ? section.id : null,
            sectionTitle: section ? section.title : null,
            source: "instant-helper",
            status: "delivered",
            action: helper.action,
            createdAt: nowIso,
          },
          false,
        );
      }
      saveStaticMessages();
      return userMsg;
    } catch {
      notify("ارتباط با سرور برقرار نشد — در حال سوییچ به حالت محلی");
      state.mode = "static";
      updateConnectionUI();
      return null;
    } finally {
      state.sending = false;
      els.sendBtn.disabled = false;
    }
  }

  async function clearConversation() {
    if (state.mode === "live") {
      try {
        const res = await fetch(apiEndpoint("/api/chat/clear"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const data = await res.json();
        if (data && data.ok) {
          state.messages = data.messages || [];
          state.latestSeq = state.messages.reduce((mx, m) => Math.max(mx, m.seq || 0), 0);
          state.unreadForAgent = 0;
          updateConnectionUI();
          renderMessages(true);
          notify("تاریخچه گفتگو پاک‌سازی شد");
        }
      } catch {
        notify("امکان پاک‌سازی در حال حاضر وجود ندارد");
      }
      return;
    }

    state.messages = defaultStaticMessages();
    saveStaticMessages();
    renderMessages(true);
    notify("تاریخچه محلی پاک‌سازی شد");
  }

  function autoResizeInput() {
    els.input.style.height = "auto";
    const next = Math.min(112, Math.max(40, els.input.scrollHeight || 40));
    els.input.style.height = `${next}px`;
  }

  function openChat(options = {}) {
    state.isOpen = true;
    state.unreadAgentReplies = 0;
    if (options.sectionId && options.sectionTitle) {
      state.attachedSection = { id: options.sectionId, title: options.sectionTitle };
      updateContextUI();
    }
    if (typeof options.prefill === "string") {
      els.input.value = options.prefill;
      autoResizeInput();
    }
    els.panel.classList.add("is-open");
    els.panel.setAttribute("aria-hidden", "false");
    els.fab.classList.add("is-hidden");
    els.fab.setAttribute("aria-expanded", "true");
    updateUnreadBadge();
    els.stream.scrollTop = els.stream.scrollHeight;
    setTimeout(() => els.input.focus(), 60);
  }

  function closeChat() {
    state.isOpen = false;
    els.panel.classList.remove("is-open");
    els.panel.setAttribute("aria-hidden", "true");
    els.fab.classList.remove("is-hidden");
    els.fab.setAttribute("aria-expanded", "false");
    updateUnreadBadge();
  }

  function toggleChat() {
    if (state.isOpen) closeChat();
    else openChat();
  }

  /* ==================== EVENT LISTENERS ==================== */
  els.fab.addEventListener("click", () => openChat());
  if (els.topbarBtn) {
    els.topbarBtn.addEventListener("click", () => toggleChat());
  }
  els.closeBtn.addEventListener("click", closeChat);
  els.clearBtn.addEventListener("click", clearConversation);

  els.settingsToggle.addEventListener("click", () => {
    state.settingsOpen = !state.settingsOpen;
    els.settingsBox.hidden = !state.settingsOpen;
    els.settingsToggle.classList.toggle("is-active", state.settingsOpen);
    if (state.settingsOpen) {
      els.bridgeInput.value = state.bridgeUrl;
      els.bridgeInput.focus();
    }
  });

  els.bridgeSaveBtn.addEventListener("click", async () => {
    const val = els.bridgeInput.value.trim();
    els.bridgeSaveBtn.disabled = true;
    const ok = await connectBridge(val);
    els.bridgeSaveBtn.disabled = false;
    if (ok) {
      state.settingsOpen = false;
      els.settingsBox.hidden = true;
      els.settingsToggle.classList.remove("is-active");
      notify("اتصال زنده دوطرفه با سرور چت آرنا برقرار شد");
    } else {
      notify(val ? "سرور پاسخ نداد — آدرس پیش‌نمایش زنده آرنا را بررسی کنید" : "در حالت استاتیک قرار گرفت");
    }
  });

  if (els.wakeupCopyBtn) {
    els.wakeupCopyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("پیام‌های جدید داشبورد را بخوان و در چت داشبورد جواب بده");
        notify("دستور بیدارباش کپی شد — در چت آرنا Paste کنید");
      } catch {
        notify("در چت آرنا بنویسید: بخوان");
      }
    });
  }

  els.quickRow.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-quick-prompt]");
    if (!chip) return;
    const prompt = chip.getAttribute("data-quick-prompt") || "";
    els.input.value = prompt;
    autoResizeInput();
    els.input.focus();
  });

  els.contextRemoveBtn.addEventListener("click", () => {
    state.attachedSection = null;
    updateContextUI();
    els.input.focus();
  });

  els.stream.addEventListener("click", async (e) => {
    const actionBtn = e.target.closest("[data-chat-action]");
    if (actionBtn && window.StudioHub) {
      const act = actionBtn.getAttribute("data-chat-action");
      const secId = actionBtn.getAttribute("data-section-id") || "01-header";
      if (act === "download") window.StudioHub.downloadById(secId, actionBtn);
      else if (act === "open-guide") window.StudioHub.openGuideById(secId);
      else if (act === "open-modal") window.StudioHub.openModalById(secId);
      return;
    }

    const copyBtn = e.target.closest('[data-bridge-tool="copy-packet"]');
    if (copyBtn) {
      const msgId = copyBtn.getAttribute("data-msg-id");
      const msg = state.messages.find((m) => m.id === msgId);
      if (msg) {
        try {
          await navigator.clipboard.writeText(formatArenaClipboardPacket(msg));
          notify("بسته پیام کپی شد — مستقیم در چت آرنا Paste کنید");
        } catch {
          notify("امکان کپی خودکار نبود");
        }
      }
    }
  });

  els.input.addEventListener("input", autoResizeInput);

  /* IME-safe Enter handling per UX guidelines */
  els.input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (e.isComposing || e.keyCode === 229) return;
    if (!e.repeat) {
      sendMessage();
    }
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.isOpen) {
      const modalOpen = document.getElementById("preview-modal")?.classList.contains("is-open");
      const drawerOpen = document.getElementById("guide-drawer")?.classList.contains("is-open");
      if (!modalOpen && !drawerOpen) {
        closeChat();
      }
    }
  });

  /* Public Controller API */
  window.StudioChat = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    sendMessage,
    connectBridge,
    clearConversation,
    destroy: closeLiveStreams,
    getState() {
      return {
        isOpen: state.isOpen,
        mode: state.mode,
        bridgeUrl: state.bridgeUrl,
        messagesCount: state.messages.length,
        unreadForAgent: state.unreadForAgent,
        unreadAgentReplies: state.unreadAgentReplies,
        attachedSection: state.attachedSection ? { ...state.attachedSection } : null,
      };
    },
  };

  connectBridge();
})();
