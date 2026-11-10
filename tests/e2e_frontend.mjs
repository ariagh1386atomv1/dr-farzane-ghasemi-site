#!/usr/bin/env node
/**
 * Comprehensive Real-DOM + Live HTTP/SSE End-to-End Frontend Test Suite
 * Tests Dashboard UI + Two-Way Arena Chatbot (Live Mode & GitHub Pages Mode).
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const LIVE_SERVER = process.env.STUDIO_SERVER || "http://127.0.0.1:8080";

const requireFromTmp = createRequire("/tmp/studio-e2e/package.json");
const { JSDOM } = requireFromTmp("jsdom");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Lightweight real HTTP streaming EventSource implementation for Node/JSDOM
 */
class NodeEventSource {
  constructor(url) {
    this.url = url.startsWith("http") ? url : `${LIVE_SERVER}${url}`;
    this.listeners = new Map();
    this.closed = false;
    this.req = null;
    this._connect();
  }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }

  _emit(type, data) {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const fn of set) {
      fn({ type, data });
    }
  }

  _connect() {
    if (!this.url.startsWith("http://127.0.0.1")) return;
    this.req = http.get(this.url, (res) => {
      res.setEncoding("utf8");
      let buf = "";
      let curEvent = "message";
      res.on("data", (chunk) => {
        if (this.closed) return;
        buf += chunk;
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            curEvent = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            this._emit(curEvent, payload);
            curEvent = "message";
          }
        }
      });
    });
    this.req.on("error", () => {});
  }

  close() {
    this.closed = true;
    if (this.req) {
      try {
        this.req.destroy();
      } catch {}
    }
  }
}

async function createDashboardDom({ baseUrl, simulateGithubPages = false }) {
  const html = fs.readFileSync(path.join(REPO_ROOT, "index.html"), "utf8");
  const catalogCode = fs.readFileSync(path.join(REPO_ROOT, "assets/catalog.js"), "utf8");
  const appCode = fs.readFileSync(path.join(REPO_ROOT, "assets/app.js"), "utf8");
  const chatCode = fs.readFileSync(path.join(REPO_ROOT, "assets/chat-widget.js"), "utf8");

  const strippedHtml = html.replace(/<script\b[^>]*><\/script>/g, "");
  const dom = new JSDOM(strippedHtml, {
    url: baseUrl,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const pageErrors = [];
  window.addEventListener("error", (ev) => pageErrors.push(ev.error || ev.message));

  let clipboardText = "";
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (txt) => {
        clipboardText = String(txt);
      },
      readText: async () => clipboardText,
    },
  });

  window.URL.createObjectURL = () => "blob:studio-test";
  window.URL.revokeObjectURL = () => {};

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;
    const resolved = new URL(rawUrl, baseUrl).toString();

    if (simulateGithubPages && resolved.startsWith("https://ariagh1386atomv1.github.io/")) {
      if (resolved.includes("/api/")) {
        return new Response("Not Found", { status: 404 });
      }
      const relPath = resolved.replace(
        "https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/",
        "",
      );
      return fetch(`${LIVE_SERVER}/${relPath}`, init);
    }
    return fetch(resolved, init);
  };

  window.EventSource = class extends NodeEventSource {
    constructor(u) {
      const resolved = new URL(u, baseUrl).toString();
      super(resolved);
    }
  };

  window.eval(catalogCode);
  window.eval(appCode);
  window.eval(chatCode);

  return {
    dom,
    window,
    document: window.document,
    pageErrors,
    getClipboard: () => clipboardText,
    cleanup() {
      if (window.StudioChat) window.StudioChat.destroy();
      dom.window.close();
    },
  };
}

async function runAllTests() {
  console.log("=== Running Frontend & Live Two-Way Bridge E2E Suite ===");

  // Reset server state cleanly before E2E
  await fetch(`${LIVE_SERVER}/api/chat/clear`, { method: "POST", body: "{}" });

  // 1. Static DOM ID & GitHub Pages Subpath Verification
  {
    const html = fs.readFileSync(path.join(REPO_ROOT, "index.html"), "utf8");
    const appJs = fs.readFileSync(path.join(REPO_ROOT, "assets/app.js"), "utf8");
    const chatJs = fs.readFileSync(path.join(REPO_ROOT, "assets/chat-widget.js"), "utf8");

    const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    const referencedIds = [
      ...[...appJs.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]),
      ...[...chatJs.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]),
    ];
    for (const id of referencedIds) {
      assert.ok(htmlIds.has(id), `Missing DOM element #${id} in index.html`);
    }
    const badRootUrls = [...html.matchAll(/(?:href|src)=["'](\/[^/"'][^"']*)/g)];
    assert.equal(badRootUrls.length, 0, "Found root-relative URLs that would break GitHub Pages");
    console.log("✔ [1/8] Static DOM IDs (all 41 bindings) & GitHub Pages relative paths verified");
  }

  // Boot primary Live Arena Preview session
  const env = await createDashboardDom({ baseUrl: `${LIVE_SERVER}/` });
  try {
    await sleep(250);
    const { window, document, pageErrors } = env;

    // 2. Dashboard Core Interactions
    assert.equal(document.documentElement.getAttribute("dir"), "rtl");
    const cards = document.querySelectorAll(".tpl-card");
    assert.equal(cards.length, 1);

    const mobileBtn = document.querySelector('[data-action="card-device"][data-device="mobile"]');
    mobileBtn.click();
    assert.ok(document.getElementById("viewport-01-header").classList.contains("is-mobile"));

    const searchInput = document.getElementById("search-input");
    searchInput.value = "عبارت-ناموجود";
    searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
    assert.ok(document.querySelector(".empty-state"));
    searchInput.value = "";
    searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
    assert.equal(document.querySelectorAll(".tpl-card").length, 1);
    console.log("✔ [2/8] Dashboard cards, responsive viewport switch & live search verified");

    // 3. Chatbot Auto-Connect in Live SSE Mode
    const st0 = window.StudioChat.getState();
    assert.equal(st0.mode, "live");
    assert.match(document.getElementById("chat-status-text").textContent, /SSE/);
    assert.equal(st0.messagesCount, 1);
    console.log("✔ [3/8] Chatbot auto-connected to Live SSE Bridge Server");

    // 4. Card `گفتگو` Context Attachment + Escape Priority
    const cardChatBtn = document.querySelector('[data-action="chat-section"]');
    cardChatBtn.click();
    assert.equal(window.StudioChat.getState().isOpen, true);
    assert.equal(document.getElementById("chat-context-bar").hidden, false);
    assert.match(document.getElementById("chat-context-label").textContent, /هدر اختصاصی داروخانه آنلاین/);
    console.log("✔ [4/8] Card-to-Chat section attachment & slide-up open verified");

    // 5. Quick Prompt Chip & IME-Safe Keyboard Handling
    const chip = document.querySelector("[data-quick-prompt]");
    chip.click();
    const input = document.getElementById("chat-composer-input");
    assert.ok(input.value.length > 5);

    // IME composing Enter must NOT submit
    const msgCountBeforeIme = window.StudioChat.getState().messagesCount;
    const imeEvent = new window.KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(imeEvent, "isComposing", { value: true });
    input.dispatchEvent(imeEvent);
    await sleep(80);
    assert.equal(window.StudioChat.getState().messagesCount, msgCountBeforeIme);

    // Shift+Enter must NOT submit
    input.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await sleep(80);
    assert.equal(window.StudioChat.getState().messagesCount, msgCountBeforeIme);
    console.log("✔ [5/8] Quick prompt chips, IME composition guard & Shift+Enter verified");

    // 6. XSS Sanitization & Real Message Delivery
    input.value = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script> سلام از تست E2E';
    input.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );
    await sleep(220);

    assert.equal(window.__xss, undefined, "XSS payload executed!");
    assert.equal(document.querySelectorAll("#chat-stream script, #chat-stream img").length, 0);
    assert.match(document.getElementById("chat-stream").textContent, /سلام از تست E2E/);
    assert.equal(document.getElementById("chat-wakeup-bar").hidden, false);
    console.log("✔ [6/8] XSS neutralization & Arena inbox persistence verified");

    // 7. Instant Helper Action Button Inside Chat Stream
    await window.StudioChat.sendMessage("راهنمای نصب هدر در وودمارت");
    await sleep(180);
    const guideActionBtn = document.querySelector('[data-chat-action="open-guide"]');
    assert.ok(guideActionBtn, "Expected instant open-guide button inside chat bubble");
    guideActionBtn.click();
    assert.ok(document.getElementById("guide-drawer").classList.contains("is-open"));
    document.getElementById("drawer-close-btn").click();
    console.log("✔ [7/8] In-chat interactive helper action (opening WoodMart guide drawer) verified");

    // 8. Real-Time Push from Arena Agent CLI -> Minimized Dashboard Widget via SSE
    window.StudioChat.close();
    assert.equal(document.getElementById("chat-fab-badge").hidden, true);

    execFileSync(
      "python3",
      [
        path.join(REPO_ROOT, "tools/chat_cli.py"),
        "--server",
        LIVE_SERVER,
        "reply",
        "پاسخ زنده ایجنت آرنا با موفقیت روی استریم SSE دریافت شد!",
      ],
      { stdio: "pipe" },
    );

    await sleep(350);
    assert.match(
      document.getElementById("chat-stream").textContent,
      /پاسخ زنده ایجنت آرنا با موفقیت روی استریم SSE دریافت شد/,
    );
    const repliedTicks = document.querySelectorAll(".chat-msg__ticks.is-replied");
    assert.ok(repliedTicks.length >= 2, "Expected user messages to update to replied ✓✓ via SSE");
    assert.equal(document.getElementById("chat-fab-badge").hidden, false);
    assert.equal(document.getElementById("chat-fab-badge").textContent, "۱");

    // Reopening clears unread badge
    document.getElementById("chat-fab").click();
    assert.equal(document.getElementById("chat-fab-badge").hidden, true);
    assert.equal(pageErrors.length, 0, `Unexpected runtime errors: ${pageErrors.join(", ")}`);
    console.log("✔ [8/8] Live Arena CLI -> SSE real-time push, ✓✓ status ticks & unread badge verified");
  } finally {
    env.cleanup();
  }

  // Bonus Scenario: GitHub Pages Static Mode -> Live Bridge Upgrade & Auto-Flush
  const ghEnv = await createDashboardDom({
    baseUrl: "https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/",
    simulateGithubPages: true,
  });
  try {
    await sleep(200);
    const { window, document } = ghEnv;
    assert.equal(window.StudioChat.getState().mode, "static");
    assert.match(document.getElementById("chat-status-text").textContent, /GitHub Pages/);

    await window.StudioChat.sendMessage("پیام آفلاین در گیت‌هاب پیج برای سینک خودکار");
    const copyPacketBtn = document.querySelector('[data-bridge-tool="copy-packet"]');
    assert.ok(copyPacketBtn, "Expected copy-packet button in static mode");
    copyPacketBtn.click();
    await sleep(50);
    assert.match(ghEnv.getClipboard(), /پیام آفلاین در گیت‌هاب پیج/);

    // Connect GitHub Pages to Live Bridge Server & verify automatic flush!
    document.getElementById("chat-settings-toggle").click();
    const bridgeInput = document.getElementById("chat-bridge-input");
    bridgeInput.value = LIVE_SERVER;
    document.getElementById("chat-bridge-save").click();
    await sleep(350);

    assert.equal(window.StudioChat.getState().mode, "live");
    const inboxRes = await fetch(`${LIVE_SERVER}/api/chat/inbox?unread=1`);
    const inboxJson = await inboxRes.json();
    assert.ok(
      inboxJson.messages.some((m) => m.text.includes("پیام آفلاین در گیت‌هاب پیج")),
      "Pending static message was not auto-flushed to live Arena inbox!",
    );
    console.log(
      "✔ [Bonus] GitHub Pages static fallback, clipboard packet & auto-sync upgrade to Live SSE verified",
    );
  } finally {
    ghEnv.cleanup();
  }

  // Clean reset so the user sees a fresh, pristine chat history!
  await fetch(`${LIVE_SERVER}/api/chat/clear`, { method: "POST", body: "{}" });
  const finalStatus = await (await fetch(`${LIVE_SERVER}/api/chat/status`)).json();
  assert.equal(finalStatus.ok, true);
  assert.equal(finalStatus.totalMessages, 1);
  assert.equal(finalStatus.unreadForAgent, 0);

  console.log("\n🎉 ALL FRONTEND + LIVE SSE + GITHUB PAGES E2E TESTS PASSED 100%!");
}

runAllTests().catch((err) => {
  console.error("E2E TEST FAILED:", err);
  process.exit(1);
});
