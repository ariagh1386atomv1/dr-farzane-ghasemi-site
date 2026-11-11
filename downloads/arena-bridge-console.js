/* ==========================================================================
   Arena.ai <-> GitHub Pages (.io) Auto-Turn Bridge (Content Script & Console)
   Automatically submits incoming .io Dashboard messages as new Arena turns.
   ========================================================================== */

(function () {
  "use strict";

  if (window.__ARENA_IO_BRIDGE_ACTIVE__) {
    if (typeof window.__ARENA_IO_BRIDGE_ACTIVE__.reconnect === "function") {
      window.__ARENA_IO_BRIDGE_ACTIVE__.reconnect();
    }
    return;
  }

  const GITHUB_PAGES_URL = "https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/";
  const STORAGE_KEY = "arena_io_bridge_server_v1";

  const queue = [];
  const queuedIds = new Set();
  let processingQueue = false;
  let es = null;
  let pollTimer = null;
  let discoveryTimer = null;
  let connected = false;

  function normalizeOrigin(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    try {
      const u = new URL(s.startsWith("http") ? s : `https://${s}`);
      return u.origin;
    } catch {
      return "";
    }
  }

  function detectPreviewOriginFromDom() {
    const iframes = document.querySelectorAll("iframe[src]");
    for (const frame of iframes) {
      const src = frame.getAttribute("src") || "";
      if (/\.e2b\.(?:app|dev)/i.test(src)) {
        const orig = normalizeOrigin(src);
        if (orig) return orig;
      }
    }
    const links = document.querySelectorAll('a[href*=".e2b.app"], a[href*=".e2b.dev"]');
    for (const a of links) {
      const orig = normalizeOrigin(a.getAttribute("href") || "");
      if (orig) return orig;
    }
    return "";
  }

  let bridgeOrigin = normalizeOrigin(
    window.__ARENA_BRIDGE_OVERRIDE_URL__ ||
      detectPreviewOriginFromDom() ||
      (function () {
        try {
          return localStorage.getItem(STORAGE_KEY) || "";
        } catch {
          return "";
        }
      })(),
  );

  function saveOrigin(orig) {
    bridgeOrigin = normalizeOrigin(orig);
    try {
      if (bridgeOrigin) localStorage.setItem(STORAGE_KEY, bridgeOrigin);
    } catch {}
  }

  /* ==================== FLOATING MINI STATUS PILL ==================== */
  const pill = document.createElement("div");
  pill.id = "arena-io-bridge-pill";
  pill.dir = "rtl";
  pill.style.cssText = [
    "position:fixed",
    "bottom:14px",
    "left:14px",
    "z-index:2147483640",
    "display:inline-flex",
    "align-items:center",
    "gap:8px",
    "padding:6px 11px",
    "border-radius:999px",
    "background:#ffffff",
    "border:1px solid #cbd9ec",
    "box-shadow:0 8px 24px rgba(11,25,44,0.14)",
    "font-family:system-ui,-apple-system,sans-serif",
    "font-size:12px",
    "font-weight:700",
    "color:#0b192c",
  ].join(";");

  const dotEl = document.createElement("span");
  dotEl.style.cssText =
    "width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0;";

  const textEl = document.createElement("span");
  textEl.textContent = "پل داشبورد .io: در انتظار لینک پیش‌نمایش...";

  const openIoLink = document.createElement("a");
  openIoLink.target = "_blank";
  openIoLink.rel = "noopener noreferrer";
  openIoLink.textContent = "باز کردن .io متصل ↗";
  openIoLink.style.cssText = [
    "padding:3px 9px",
    "border-radius:999px",
    "background:#1d63ed",
    "color:#ffffff",
    "text-decoration:none",
    "font-size:11px",
    "display:none",
  ].join(";");

  const configBtn = document.createElement("button");
  configBtn.type = "button";
  configBtn.textContent = "تنظیم لینک";
  configBtn.style.cssText = [
    "padding:2px 8px",
    "border-radius:999px",
    "border:1px solid #cbd9ec",
    "background:#f0f5fb",
    "color:#1e2f47",
    "font-size:11px",
    "font-weight:700",
    "cursor:pointer",
  ].join(";");

  configBtn.addEventListener("click", () => {
    const entered = window.prompt(
      "آدرس پیش‌نمایش زنده آرنا (مثلاً https://8080-....e2b.app):",
      bridgeOrigin || "",
    );
    if (entered !== null && entered.trim()) {
      saveOrigin(entered.trim());
      connectToServer();
    }
  });

  pill.appendChild(dotEl);
  pill.appendChild(textEl);
  pill.appendChild(openIoLink);
  pill.appendChild(configBtn);
  document.body.appendChild(pill);

  function updatePillUI() {
    if (connected && bridgeOrigin) {
      dotEl.style.background = "#059669";
      dotEl.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.2)";
      textEl.textContent = "پل چت .io فعال";
      openIoLink.href = `${GITHUB_PAGES_URL}#bridge=${encodeURIComponent(bridgeOrigin)}`;
      openIoLink.style.display = "inline-block";
    } else if (bridgeOrigin) {
      dotEl.style.background = "#f59e0b";
      dotEl.style.boxShadow = "none";
      textEl.textContent = "در حال اتصال به سرور پیش‌نمایش...";
      openIoLink.style.display = "none";
    } else {
      dotEl.style.background = "#f59e0b";
      dotEl.style.boxShadow = "none";
      textEl.textContent = "تب پیش‌نمایش (Template Dashboard) را یک‌بار باز کنید یا لینک بدهید";
      openIoLink.style.display = "none";
    }
  }

  /* ==================== ARENA COMPOSER AUTOMATION ==================== */
  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    return true;
  }

  function isArenaBusyStreaming() {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      if (!isVisible(btn) || btn.disabled) continue;
      const meta = [
        btn.getAttribute("aria-label") || "",
        btn.getAttribute("title") || "",
        btn.getAttribute("data-testid") || "",
        btn.textContent || "",
      ]
        .join(" ")
        .toLowerCase();
      if (/\b(stop|abort|cancel\s+generation|stop\s+generating)\b|توقف/.test(meta)) {
        return true;
      }
    }
    return false;
  }

  function findArenaComposer() {
    const selectors = [
      'form textarea:not([disabled]):not(#chat-composer-input)',
      'textarea[placeholder]:not([disabled]):not(#chat-composer-input)',
      '[contenteditable="true"][role="textbox"]',
      '.ProseMirror[contenteditable="true"]',
      '[data-lexical-editor="true"][contenteditable="true"]',
      'textarea:not([disabled]):not(#chat-composer-input)',
    ];
    for (const sel of selectors) {
      const candidates = document.querySelectorAll(sel);
      for (const el of candidates) {
        if (el.closest("#arena-io-bridge-pill")) continue;
        if (isVisible(el)) return el;
      }
    }
    return null;
  }

  function setComposerText(el, text) {
    el.focus();
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const proto =
        el.tagName === "TEXTAREA"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }),
      );
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (el.isContentEditable || el.getAttribute("contenteditable") === "true") {
      el.textContent = text;
      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }),
      );
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function findSendButton(composerEl) {
    const scope =
      composerEl.closest("form") ||
      composerEl.parentElement?.parentElement?.parentElement ||
      document;

    const buttons = scope.querySelectorAll("button:not([disabled])");
    let bestSubmit = null;

    for (const btn of buttons) {
      if (btn.closest("#arena-io-bridge-pill")) continue;
      if (!isVisible(btn)) continue;

      const meta = [
        btn.getAttribute("aria-label") || "",
        btn.getAttribute("title") || "",
        btn.getAttribute("data-testid") || "",
        btn.textContent || "",
      ]
        .join(" ")
        .toLowerCase();

      // Strictly never click Stop, Attach, Upload, Mic, Plus, Model selector
      if (
        /\b(stop|abort|cancel|attach|upload|file|image|voice|mic|audio|plus|model|new\s+chat)\b|توقف/.test(
          meta,
        )
      ) {
        continue;
      }

      if (/\b(send|submit|ارسال)\b/.test(meta)) {
        return btn;
      }
      if ((btn.getAttribute("type") || "").toLowerCase() === "submit") {
        bestSubmit = btn;
      }
    }
    return bestSubmit;
  }

  function formatPromptForArena(msg) {
    const sectionPart = msg.sectionTitle ? `\nبخش مرتبط: ${msg.sectionTitle}` : "";
    return (
      `[پیام مستقیم از داشبورد .io]${sectionPart}\n` +
      `${msg.text}\n\n` +
      `(یادآوری سیستم پل: پاسخ را با \`python3 tools/chat_cli.py reply "..."\` به داشبورد .io بفرست و بدون اجرای listen نوبت را تمام کن)`
    );
  }

  async function submitSingleMessageToArena(msg) {
    // Wait until Arena is idle and composer is available (up to 180s if a previous turn is finishing)
    const deadline = Date.now() + 180000;
    while (Date.now() < deadline) {
      const composer = findArenaComposer();
      if (composer && !isArenaBusyStreaming()) {
        // Atomically claim on server so it never double-fires
        try {
          const claimRes = await fetch(`${bridgeOrigin}/api/chat/claim-trigger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId: msg.id }),
          });
          const claimJson = await claimRes.json();
          if (!claimJson.ok || !claimJson.claimed) {
            return false;
          }
        } catch {
          return false;
        }

        const promptText = formatPromptForArena(msg);
        setComposerText(composer, promptText);
        await new Promise((r) => setTimeout(r, 150));

        if (isArenaBusyStreaming()) return false;

        const sendBtn = findSendButton(composer);
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
          return true;
        }

        const form = composer.closest("form");
        if (form && typeof form.requestSubmit === "function") {
          form.requestSubmit();
          return true;
        }

        composer.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          }),
        );
        return true;
      }
      await new Promise((r) => setTimeout(r, 700));
    }
    return false;
  }

  async function drainQueue() {
    if (processingQueue) return;
    processingQueue = true;
    try {
      while (queue.length > 0) {
        const nextMsg = queue.shift();
        await submitSingleMessageToArena(nextMsg);
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      processingQueue = false;
    }
  }

  function enqueueTrigger(msg) {
    if (!msg || !msg.id || queuedIds.has(msg.id)) return;
    if (msg.arenaTriggered) return;
    queuedIds.add(msg.id);
    queue.push(msg);
    drainQueue();
  }

  /* ==================== SSE & FALLBACK CONNECTION ==================== */
  async function checkPendingTriggers() {
    if (!bridgeOrigin) return;
    try {
      const res = await fetch(`${bridgeOrigin}/api/chat/pending-triggers`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok) {
        connected = true;
        updatePillUI();
        (data.messages || []).forEach(enqueueTrigger);
      }
    } catch {
      /* ignore transient offline */
    }
  }

  function closeConnections() {
    if (es) {
      try {
        es.close();
      } catch {}
      es = null;
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function connectToServer() {
    closeConnections();
    updatePillUI();
    if (!bridgeOrigin) return;

    if (typeof window.EventSource === "function") {
      try {
        es = new window.EventSource(`${bridgeOrigin}/api/chat/stream?role=arena-tab`);
        es.addEventListener("connected", () => {
          connected = true;
          updatePillUI();
          checkPendingTriggers();
        });
        es.addEventListener("arena_trigger", (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (payload && payload.message) {
              enqueueTrigger(payload.message);
            }
          } catch {}
        });
        es.onerror = () => {
          connected = false;
          updatePillUI();
        };
      } catch {}
    }

    checkPendingTriggers();
    pollTimer = setInterval(checkPendingTriggers, 3000);
  }

  discoveryTimer = setInterval(() => {
    if (!bridgeOrigin) {
      const found = detectPreviewOriginFromDom();
      if (found) {
        saveOrigin(found);
        connectToServer();
      }
    }
  }, 2000);

  connectToServer();

  const api = {
    getOrigin: () => bridgeOrigin,
    isConnected: () => connected,
    setOrigin(url) {
      saveOrigin(url);
      connectToServer();
    },
    reconnect: connectToServer,
    destroy() {
      closeConnections();
      if (discoveryTimer) clearInterval(discoveryTimer);
      pill.remove();
      delete window.__ARENA_IO_BRIDGE_ACTIVE__;
    },
  };

  window.__ARENA_IO_BRIDGE_ACTIVE__ = api;
  window.__ArenaIoBridge = api;
})();
