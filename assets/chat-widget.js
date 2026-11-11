/* ==========================================================================
   24/7 Serverless Cloudflare AI + Local Studio Chatbot Controller
   Works 24/7 even when your computer is completely OFF (via Cloudflare Pages
   Functions or Cloudflare Worker), plus supports Arena's local preview server.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_BRIDGE_KEY = "studio_chat_worker_url_v2";
  const LEGACY_BRIDGE_KEY = "studio_chat_bridge_url_v1";
  const STORAGE_CLOUD_MSGS_KEY = "studio_chat_cloud_msgs_v1";
  const STORAGE_STATIC_MSGS_KEY = "studio_chat_static_msgs_v1";

  const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (val) => String(val).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

  const generatedJsonBlobs = new Map();

  function escapeHtml(raw) {
    return String(raw ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatInlineMarkdown(escaped) {
    return escaped
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`\n]+)`/g, '<code class="chat-msg__code">$1</code>')
      .replace(/\n/g, "<br/>");
  }

  function renderRichMessageBody(msg) {
    const raw = String(msg.text ?? "");
    const fenceRe = /```(?:json)?\s*\n([\s\S]*?)```/gi;
    let lastIndex = 0;
    let htmlParts = [];
    let match;
    let jsonBlockIndex = 0;

    while ((match = fenceRe.exec(raw)) !== null) {
      const before = raw.slice(lastIndex, match.index);
      if (before.trim()) {
        htmlParts.push(`<div>${formatInlineMarkdown(escapeHtml(before.trim()))}</div>`);
      }
      const codeBody = match[1].trim();
      let isJson = false;
      try {
        JSON.parse(codeBody);
        isJson = true;
      } catch {
        isJson = false;
      }

      const codeKey = `${msg.id}_code_${jsonBlockIndex++}`;
      if (isJson) {
        generatedJsonBlobs.set(codeKey, codeBody);
      }

      htmlParts.push(`
        <div class="chat-code-card">
          <div class="chat-code-card__head">
            <span>${isJson ? "Elementor JSON" : "Code"}</span>
            <span>${toFa(codeBody.length)} chars</span>
          </div>
          <pre class="chat-code-card__pre">${escapeHtml(codeBody)}</pre>
        </div>
        ${
          isJson
            ? `<button type="button" class="chat-msg__action-btn" data-download-json-key="${escapeHtml(codeKey)}">
                 <span>⬇ دانلود مستقیم فایل JSON ساخته‌شده</span>
               </button>`
            : ""
        }
      `);
      lastIndex = fenceRe.lastIndex;
    }

    const tail = raw.slice(lastIndex);
    if (tail.trim() || htmlParts.length === 0) {
      htmlParts.push(`<div>${formatInlineMarkdown(escapeHtml(tail))}</div>`);
    }
    return htmlParts.join("");
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
      if (!val) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, String(val));
    } catch {
      /* ignore storage restrictions */
    }
  }

  function notify(msg) {
    if (window.StudioHub && typeof window.StudioHub.showToast === "function") {
      window.StudioHub.showToast(msg);
    }
  }

  function extractWorkerParamFromUrl() {
    try {
      const hash = String(window.location.hash || "");
      const hashMatch = hash.match(/(?:^|[#&])(?:worker|bridge)=([^&]+)/i);
      if (hashMatch && hashMatch[1]) {
        const decoded = normalizeBaseUrl(decodeURIComponent(hashMatch[1]));
        if (decoded && window.history && typeof window.history.replaceState === "function") {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        return decoded;
      }
      const sp = new URLSearchParams(window.location.search || "");
      const qVal = sp.get("worker") || sp.get("bridge");
      if (qVal) return normalizeBaseUrl(qVal);
    } catch {
      /* ignore */
    }
    return "";
  }

  function defaultStaticMessages() {
    return [
      {
        id: "static_welcome_1",
        seq: 1,
        role: "agent",
        author: "دستیار هوشمند ابری (۲۴/۷)",
        text:
          "سلام! 👋 برای اینکه این چت‌بات **۲۴ ساعته حتی با خاموش بودن کامپیوتر شما** کار کند:\n" +
          "• اگر سایت را روی **Cloudflare Pages** منتشر کنید، به صورت کاملاً خودکار و بدون هیچ تنظیماتی متصل می‌شود!\n" +
          "• یا اگر روی `.github.io` هستید، آیکون تنظیمات (🔗) بالا را بزنید، کد آماده Worker کلادفلر را کپی و Deploy کنید و لینک `workers.dev` خود را وارد نمایید.",
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
        text: "فایل استاندارد «۰۱ — هدر اختصاصی داروخانه آنلاین دکتر فرزانه قاسمی» آماده دانلود مستقیم است:",
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

  safeSetStorage(LEGACY_BRIDGE_KEY, "");
  const initialUrlBridge = extractWorkerParamFromUrl();
  if (initialUrlBridge) {
    safeSetStorage(STORAGE_BRIDGE_KEY, initialUrlBridge);
  }

  const state = {
    isOpen: false,
    settingsOpen: false,
    mode: "connecting", // "cloudflare" | "live" | "static"
    provider: "",
    kvEnabled: false,
    bridgeUrl: normalizeBaseUrl(
      initialUrlBridge ||
        safeGetStorage(STORAGE_BRIDGE_KEY) ||
        window.STUDIO_DEFAULT_WORKER_URL ||
        "",
    ),
    messages: [],
    latestSeq: 0,
    unreadForAgent: 0,
    agentListening: false,
    agentTyping: false,
    unreadAgentReplies: 0,
    attachedSection: null,
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
    copyWorkerBtn: document.getElementById("chat-copy-worker-code"),
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
    if (msg.status === "sending") {
      return { text: "در حال پردازش ابری...", cls: "chat-msg__ticks" };
    }
    if (msg.status === "replied") {
      return { text: "پاسخ داده شد ✓✓", cls: "chat-msg__ticks is-replied" };
    }
    if (msg.status === "read_by_arena") {
      return { text: "دیده شد ✓✓", cls: "chat-msg__ticks" };
    }
    if (msg.status === "local_only") {
      return { text: "حالت آفلاین", cls: "chat-msg__ticks" };
    }
    return { text: "ارسال شد ✓", cls: "chat-msg__ticks" };
  }

  function updateConnectionUI() {
    const isCloudflare = state.mode === "cloudflare";
    const isLive = state.mode === "live";
    const active = isCloudflare || isLive;

    els.statusPill.classList.toggle("is-static", !active);
    els.statusPill.classList.toggle("is-listening", isCloudflare || state.agentListening);
    if (els.topbarDot) els.topbarDot.classList.toggle("is-static", !active);

    if (isCloudflare) {
      els.statusText.textContent =
        state.provider === "setup-needed"
          ? "متصل به کلادفلر · آماده فعال‌سازی AI"
          : "ابری ۲۴/۷ کلادفلر فعال · بدون نیاز به سیستم";
    } else if (isLive) {
      els.statusText.textContent = "متصل به پیش‌نمایش محلی استودیو";
    } else {
      els.statusText.textContent = "آماده اتصال به کلادفلر ۲۴/۷";
    }

    if (els.wakeupBar) {
      els.wakeupBar.hidden = active;
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
          msg.role === "agent" ? '<span class="chat-msg__verified">ابری ۲۴/۷</span>' : "";

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

        const ticks = statusLabelForMsg(msg);
        const ticksHtml = ticks
          ? `<span class="${ticks.cls}" data-msg-ticks="${escapeHtml(msg.id)}">${ticks.text}</span>`
          : "";

        return `
          <div class="chat-msg ${roleClass}" data-msg-id="${escapeHtml(msg.id)}">
            <div class="chat-msg__sender">
              <span>${escapeHtml(msg.author || (msg.role === "user" ? "شما" : "دستیار ابری"))}</span>
              ${verifiedBadge}
            </div>
            <div class="chat-msg__bubble">
              ${sectionPill}
              ${renderRichMessageBody(msg)}
              ${actionHtml}
            </div>
            <div class="chat-msg__meta">
              <span class="num">${formatTimeFa(msg.createdAt)}</span>
              ${ticksHtml}
            </div>
          </div>
        `;
      })
      .join("");

    if (state.agentTyping) {
      const typingEl = document.createElement("div");
      typingEl.className = "chat-typing";
      typingEl.id = "chat-typing-indicator";
      typingEl.innerHTML =
        '<span>دستیار هوشمند ابری در حال آماده‌سازی پاسخ است</span>' +
        '<span class="chat-typing__dots" aria-hidden="true"><span></span><span></span><span></span></span>';
      els.stream.appendChild(typingEl);
    }

    if (scrollToEnd) {
      els.stream.scrollTop = els.stream.scrollHeight;
    }
  }

  function upsertMessage(msg, notifyIfClosed = false) {
    if (!msg || !msg.id) return false;
    const idx = state.messages.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      state.messages[idx] = { ...state.messages[idx], ...msg };
      if (typeof msg.seq === "number" && msg.seq > state.latestSeq) state.latestSeq = msg.seq;
      renderMessages(false);
      return false;
    }
    state.messages.push(msg);
    if (typeof msg.seq === "number" && msg.seq > state.latestSeq) state.latestSeq = msg.seq;
    renderMessages(true);

    if (notifyIfClosed && msg.role === "agent" && !state.isOpen) {
      state.unreadAgentReplies += 1;
      updateUnreadBadge();
      notify("پاسخ جدید از دستیار ابری دریافت شد");
    }
    return true;
  }

  function saveLocalHistory(storageKey) {
    safeSetStorage(storageKey, JSON.stringify(state.messages.slice(-80)));
  }

  function loadLocalHistory(storageKey, fallbackFactory) {
    const raw = safeGetStorage(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return fallbackFactory();
  }

  function closeLiveStreams() {
    if (state.eventSource) {
      try {
        state.eventSource.close();
      } catch {}
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
      (data.messages || []).forEach((m) => upsertMessage(m, true));
    } catch {}
  }

  function openLocalSseStream() {
    closeLiveStreams();
    if (typeof window.EventSource === "function") {
      try {
        const es = new window.EventSource(apiEndpoint("/api/chat/stream"));
        es.addEventListener("message", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (payload.message) upsertMessage(payload.message, true);
          } catch {}
        });
        es.addEventListener("status_update", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (Array.isArray(payload.messageIds)) {
              const idSet = new Set(payload.messageIds);
              state.messages.forEach((m) => {
                if (idSet.has(m.id)) m.status = payload.status;
              });
              renderMessages(false);
            }
          } catch {}
        });
        es.addEventListener("reset", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            state.messages = Array.isArray(payload.messages) ? payload.messages : [];
            renderMessages(true);
          } catch {}
        });
        state.eventSource = es;
      } catch {}
    }
    state.pollTimer = setInterval(pollIncremental, 4000);
  }

  async function probeStatusJson(base) {
    const paths = ["/api/chat/status", "/status"];
    for (const p of paths) {
      try {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), 4500) : null;
        const res = await fetch(`${base}${p}`, {
          cache: "no-store",
          signal: controller ? controller.signal : undefined,
        });
        if (timer) clearTimeout(timer);
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.ok) return data;
      } catch {}
    }
    return null;
  }

  async function connectBridge(customBaseUrl) {
    closeLiveStreams();
    let candidates = [];
    if (customBaseUrl !== undefined) {
      const normalized = normalizeBaseUrl(customBaseUrl);
      state.bridgeUrl = normalized;
      safeSetStorage(STORAGE_BRIDGE_KEY, normalized);
      candidates = [normalized];
    } else {
      const defWorker = normalizeBaseUrl(window.STUDIO_DEFAULT_WORKER_URL || "");
      const host = String(window.location?.hostname || "").toLowerCase();
      const isCloudflareHost = host.endsWith(".workers.dev") || host.endsWith(".pages.dev");
      candidates = isCloudflareHost
        ? [...new Set(["", safeGetStorage(STORAGE_BRIDGE_KEY), defWorker])]
        : [...new Set([state.bridgeUrl, defWorker, ""])];
    }

    let statusJson = null;
    for (const cand of candidates) {
      const probed = await probeStatusJson(cand);
      if (probed) {
        state.bridgeUrl = cand;
        statusJson = probed;
        break;
      }
    }

    if (els.bridgeInput) {
      els.bridgeInput.value = state.bridgeUrl;
    }

    /* 1. Serverless 24/7 Cloudflare Edge Mode */
    if (statusJson && statusJson.mode === "cloudflare-edge") {
      state.mode = "cloudflare";
      state.provider = statusJson.provider || "cloudflare-workers-ai";
      state.kvEnabled = Boolean(statusJson.kvEnabled);
      state.agentListening = true;
      state.agentTyping = false;

      if (state.kvEnabled) {
        try {
          const histRes = await fetch(apiEndpoint("/api/chat/messages?after_seq=0"), {
            cache: "no-store",
          });
          const histJson = await histRes.json();
          if (Array.isArray(histJson?.messages) && histJson.messages.length > 0) {
            state.messages = histJson.messages;
          }
        } catch {}
      }

      if (!state.messages || state.messages.length === 0) {
        const cached = loadLocalHistory(STORAGE_CLOUD_MSGS_KEY, () => []);
        if (cached.length > 0) {
          state.messages = cached;
        } else {
          try {
            const histRes = await fetch(apiEndpoint("/api/chat/messages?after_seq=0"), {
              cache: "no-store",
            });
            const histJson = await histRes.json();
            state.messages = Array.isArray(histJson?.messages)
              ? histJson.messages
              : defaultStaticMessages();
          } catch {
            state.messages = defaultStaticMessages();
          }
        }
      }

      updateConnectionUI();
      renderMessages(true);
      return true;
    }

    /* 2. Local Arena Preview Server Mode */
    if (statusJson && statusJson.mode === "live-bridge") {
      state.mode = "live";
      const histRes = await fetch(apiEndpoint("/api/chat/messages?after_seq=0"), {
        cache: "no-store",
      });
      const histJson = await histRes.json();
      state.messages = Array.isArray(histJson.messages) ? histJson.messages : [];
      state.latestSeq = histJson.latestSeq || 0;
      state.agentListening = Boolean(statusJson.agentListening);
      updateConnectionUI();
      renderMessages(true);
      openLocalSseStream();
      return true;
    }

    /* 3. Unconfigured Static Host Fallback */
    state.mode = "static";
    state.agentListening = false;
    state.agentTyping = false;
    state.messages = loadLocalHistory(STORAGE_STATIC_MSGS_KEY, defaultStaticMessages);
    updateConnectionUI();
    renderMessages(true);
    return false;
  }

  async function sendMessage(rawText) {
    const text = String(rawText ?? els.input.value ?? "").trim();
    if (!text || state.sending) return null;

    const section = state.attachedSection ? { ...state.attachedSection } : null;
    state.sending = true;
    els.sendBtn.disabled = true;

    try {
      /* === Mode 1: 24/7 Serverless Cloudflare Edge === */
      if (state.mode === "cloudflare") {
        const tempId = `temp_usr_${Date.now()}`;
        const historyContext = state.messages.slice(-14);

        els.input.value = "";
        autoResizeInput();
        state.attachedSection = null;
        updateContextUI();

        upsertMessage(
          {
            id: tempId,
            seq: state.messages.length + 1,
            role: "user",
            author: "شما",
            text,
            sectionId: section ? section.id : null,
            sectionTitle: section ? section.title : null,
            status: "sending",
            createdAt: new Date().toISOString(),
          },
          false,
        );
        state.agentTyping = true;
        renderMessages(true);

        const res = await fetch(apiEndpoint("/api/chat/send"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sectionId: section ? section.id : null,
            sectionTitle: section ? section.title : null,
            history: historyContext,
            source: "web-dashboard",
          }),
        });
        const data = await res.json();
        state.agentTyping = false;

        if (!res.ok || !data.ok) {
          state.messages = state.messages.filter((m) => m.id !== tempId);
          renderMessages(true);
          notify(data?.error || "ارسال پیام به کلادفلر با خطا مواجه شد");
          return null;
        }

        // Replace optimistic user message with server record + append AI reply
        state.messages = state.messages.filter((m) => m.id !== tempId);
        (data.created || [data.message, data.reply].filter(Boolean)).forEach((m) =>
          upsertMessage(m, true),
        );
        saveLocalHistory(STORAGE_CLOUD_MSGS_KEY);
        renderMessages(true);
        return data.reply || data.message;
      }

      /* === Mode 2: Local Arena Preview Server === */
      if (state.mode === "live") {
        const res = await fetch(apiEndpoint("/api/chat/send"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sectionId: section ? section.id : null,
            sectionTitle: section ? section.title : null,
            source: "arena-preview",
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
        (data.created || [data.message]).forEach((m) => upsertMessage(m, false));
        return data.message;
      }

      /* === Mode 3: Offline Static Helper === */
      const nowIso = new Date().toISOString();
      const userMsg = {
        id: `local_${Date.now()}`,
        seq: state.messages.length + 1,
        role: "user",
        author: "شما",
        text,
        sectionId: section ? section.id : null,
        sectionTitle: section ? section.title : null,
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
      upsertMessage(
        {
          id: `local_helper_${Date.now()}`,
          seq: state.messages.length + 1,
          role: "assistant",
          author: "راهنمای اتصال کلادفلر",
          text: helper
            ? helper.text
            : "برای دریافت پاسخ هوشمند ۲۴/۷ (حتی زمانی که کامپیوترتان خاموش است)، از آیکون تنظیمات بالا (🔗) لینک Cloudflare Worker خود را متصل کنید یا سایت را روی Cloudflare Pages بالا بیاورید.",
          sectionId: section ? section.id : null,
          sectionTitle: section ? section.title : null,
          status: "delivered",
          action: helper ? helper.action : null,
          createdAt: nowIso,
        },
        false,
      );
      saveLocalHistory(STORAGE_STATIC_MSGS_KEY);
      return userMsg;
    } catch {
      state.agentTyping = false;
      renderMessages(false);
      notify("ارتباط با سرور ابری برقرار نشد — آدرس Worker را بررسی کنید");
      return null;
    } finally {
      state.sending = false;
      els.sendBtn.disabled = false;
    }
  }

  async function clearConversation() {
    if (state.mode === "cloudflare" || state.mode === "live") {
      try {
        const res = await fetch(apiEndpoint("/api/chat/clear"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const data = await res.json();
        if (data && data.ok) {
          state.messages = data.messages || [];
          safeSetStorage(STORAGE_CLOUD_MSGS_KEY, "");
          renderMessages(true);
          notify("تاریخچه گفتگو پاک‌سازی شد");
          return;
        }
      } catch {}
    }
    state.messages = defaultStaticMessages();
    safeSetStorage(STORAGE_CLOUD_MSGS_KEY, "");
    safeSetStorage(STORAGE_STATIC_MSGS_KEY, "");
    renderMessages(true);
    notify("تاریخچه گفتگو پاک‌سازی شد");
  }

  function downloadGeneratedJson(codeKey) {
    const jsonStr = generatedJsonBlobs.get(codeKey);
    if (!jsonStr) return;
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `elementor-section-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    notify("فایل JSON ساخته‌شده با موفقیت دانلود شد");
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
  if (els.topbarBtn) els.topbarBtn.addEventListener("click", () => toggleChat());
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
    state.messages = [];
    const ok = await connectBridge(val);
    els.bridgeSaveBtn.disabled = false;
    if (ok) {
      state.settingsOpen = false;
      els.settingsBox.hidden = true;
      els.settingsToggle.classList.remove("is-active");
      notify("اتصال ابری ۲۴/۷ کلادفلر با موفقیت برقرار شد!");
    } else {
      notify(val ? "آدرس Worker پاسخ نداد — لینک را بررسی کنید" : "در حالت استاتیک قرار گرفت");
    }
  });

  if (els.copyWorkerBtn) {
    els.copyWorkerBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("./downloads/cloudflare-worker.js", { cache: "no-store" });
        const code = await res.text();
        await navigator.clipboard.writeText(code);
        notify("کد کامل Worker کلادفلر در کلیپ‌بورد کپی شد!");
      } catch {
        notify("از دکمه «دانلود فایل worker.js» استفاده کنید");
      }
    });
  }

  if (els.wakeupCopyBtn) {
    els.wakeupCopyBtn.addEventListener("click", () => {
      state.settingsOpen = true;
      els.settingsBox.hidden = false;
      els.settingsToggle.classList.add("is-active");
      els.bridgeInput.focus();
    });
  }

  els.quickRow.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-quick-prompt]");
    if (!chip) return;
    els.input.value = chip.getAttribute("data-quick-prompt") || "";
    autoResizeInput();
    els.input.focus();
  });

  els.contextRemoveBtn.addEventListener("click", () => {
    state.attachedSection = null;
    updateContextUI();
    els.input.focus();
  });

  els.stream.addEventListener("click", (e) => {
    const genBtn = e.target.closest("[data-download-json-key]");
    if (genBtn) {
      downloadGeneratedJson(genBtn.getAttribute("data-download-json-key"));
      return;
    }

    const actionBtn = e.target.closest("[data-chat-action]");
    if (actionBtn && window.StudioHub) {
      const act = actionBtn.getAttribute("data-chat-action");
      const secId = actionBtn.getAttribute("data-section-id") || "01-header";
      if (act === "download") window.StudioHub.downloadById(secId, actionBtn);
      else if (act === "open-guide") window.StudioHub.openGuideById(secId);
      else if (act === "open-modal") window.StudioHub.openModalById(secId);
    }
  });

  els.input.addEventListener("input", autoResizeInput);

  els.input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (e.isComposing || e.keyCode === 229) return;
    if (!e.repeat) sendMessage();
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.isOpen) {
      const modalOpen = document.getElementById("preview-modal")?.classList.contains("is-open");
      const drawerOpen = document.getElementById("guide-drawer")?.classList.contains("is-open");
      if (!modalOpen && !drawerOpen) closeChat();
    }
  });

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
        provider: state.provider,
        kvEnabled: state.kvEnabled,
        bridgeUrl: state.bridgeUrl,
        messagesCount: state.messages.length,
        agentTyping: state.agentTyping,
        unreadAgentReplies: state.unreadAgentReplies,
        attachedSection: state.attachedSection ? { ...state.attachedSection } : null,
      };
    },
  };

  connectBridge();
})();
