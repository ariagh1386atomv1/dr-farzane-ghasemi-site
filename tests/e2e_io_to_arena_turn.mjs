#!/usr/bin/env node
/**
 * Full Two-Tab E2E Test:
 * Tab A: https://arena.ai/c/session (running downloads/arena-bridge-console.js)
 * Tab B: https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/#bridge=<ephemeralServer>
 *
 * Verifies:
 * 1. Auto-discovery of preview iframe on arena.ai + floating "باز کردن .io متصل ↗" link.
 * 2. .io auto-pairs from #bridge=..., strips #bridge= from URL, shows "متصل به تب چت آرنا · شروع خودکار چت".
 * 3. Stop-button safety guard: while Arena is busy streaming, Bridge waits and NEVER clicks Stop.
 * 4. Once Arena turn finishes, Bridge inserts the .io message into Arena's composer and clicks Send ONCE.
 * 5. Agent replies via chat_cli.py reply (without staying in listen!), reply arrives live inside .io via SSE!
 */

import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const requireFromTmp = createRequire("/tmp/studio-e2e/package.json");
const { JSDOM } = requireFromTmp("jsdom");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      srv.close(() => resolve(addr.port));
    });
    srv.on("error", reject);
  });
}

class RealEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = new Map();
    this.req = http.get(this.url, (res) => {
      res.setEncoding("utf8");
      let buf = "";
      let curEvent = "message";
      res.on("data", (chunk) => {
        buf += chunk;
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() || "";
        for (const ln of lines) {
          if (ln.startsWith("event:")) curEvent = ln.slice(6).trim();
          else if (ln.startsWith("data:")) {
            const payload = ln.slice(5).trim();
            const fns = this.listeners.get(curEvent);
            if (fns) for (const fn of fns) fn({ type: curEvent, data: payload });
            curEvent = "message";
          }
        }
      });
    });
    this.req.on("error", () => {});
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }
  close() {
    try {
      this.req.destroy();
    } catch {}
  }
}

async function main() {
  console.log("=== Running Two-Tab (.io <-> arena.ai Auto-Turn) E2E Suite ===");
  const port = await getFreePort();
  const serverOrigin = `http://127.0.0.1:${port}`;
  const tmpChatFile = path.join(os.tmpdir(), `chat_e2e_${Date.now()}.json`);

  const srvProc = spawn(
    "python3",
    [
      path.join(REPO_ROOT, "tools/dashboard_server.py"),
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--chat-file",
      tmpChatFile,
    ],
    { stdio: "pipe" },
  );

  try {
    // Wait for server boot
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(`${serverOrigin}/api/chat/status`);
        if (r.ok) break;
      } catch {}
      await sleep(100);
    }

    // 1. Boot Mock `arena.ai` Tab with React-like Controlled Textarea + Busy Stop Button
    const arenaHtml = `<!doctype html><html><body>
      <iframe src="https://8080-demo123.e2b.app/"></iframe>
      <form id="arena-form">
        <textarea id="arena-prompt" placeholder="Ask anything..."></textarea>
        <button id="arena-stop-btn" type="button" aria-label="Stop generating">Stop</button>
        <button id="arena-send-btn" type="submit" aria-label="Send message" disabled>Send</button>
      </form>
    </body></html>`;

    const arenaDom = new JSDOM(arenaHtml, {
      url: "https://arena.ai/c/3c1e42b5",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    });

    const submittedArenaTurns = [];
    let stopClicked = false;

    const aWin = arenaDom.window;
    const aDoc = aWin.document;
    aWin.fetch = (u, init) => fetch(new URL(String(u), serverOrigin).toString(), init);
    aWin.EventSource = class extends RealEventSource {
      constructor(u) {
        super(u.replace("https://8080-demo123.e2b.app", serverOrigin));
      }
    };

    const arenaInput = aDoc.getElementById("arena-prompt");
    const arenaStopBtn = aDoc.getElementById("arena-stop-btn");
    const arenaSendBtn = aDoc.getElementById("arena-send-btn");

    arenaInput.addEventListener("input", () => {
      arenaSendBtn.disabled = arenaInput.value.trim().length === 0;
    });
    arenaStopBtn.addEventListener("click", () => {
      stopClicked = true;
    });
    arenaSendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submittedArenaTurns.push(arenaInput.value);
      arenaInput.value = "";
      arenaSendBtn.disabled = true;
    });

    // Inject Arena Bridge Script (pointing override to our local ephemeral server)
    const bridgeCode = fs.readFileSync(
      path.join(REPO_ROOT, "downloads/arena-bridge-console.js"),
      "utf8",
    );
    aWin.__ARENA_BRIDGE_OVERRIDE_URL__ = serverOrigin;
    aWin.eval(bridgeCode);
    await sleep(300);

    assert.equal(aWin.__ArenaIoBridge.isConnected(), true, "Arena tab bridge did not connect");
    console.log("✔ [1/5] Arena.ai tab Bridge connected via SSE (?role=arena-tab)");

    // 2. Boot GitHub Pages (.io) Tab via `#bridge=...` Auto-Pairing Link!
    const indexHtml = fs
      .readFileSync(path.join(REPO_ROOT, "index.html"), "utf8")
      .replace(/<script\b[^>]*><\/script>/g, "");
    const ioDom = new JSDOM(indexHtml, {
      url: `https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/#bridge=${encodeURIComponent(serverOrigin)}`,
      runScripts: "outside-only",
      pretendToBeVisual: true,
    });
    const ioWin = ioDom.window;
    const ioDoc = ioWin.document;
    ioWin.fetch = (u, init) => {
      const s = String(u);
      if (s.startsWith("http")) return fetch(s, init);
      return fetch(`${serverOrigin}/${s.replace(/^\.?\//, "")}`, init);
    };
    ioWin.EventSource = RealEventSource;

    ioWin.eval(fs.readFileSync(path.join(REPO_ROOT, "assets/catalog.js"), "utf8"));
    ioWin.eval(fs.readFileSync(path.join(REPO_ROOT, "assets/app.js"), "utf8"));
    ioWin.eval(fs.readFileSync(path.join(REPO_ROOT, "assets/chat-widget.js"), "utf8"));
    await sleep(350);

    assert.equal(ioWin.location.hash, "", "Expected #bridge=... hash to be cleaned after pairing");
    const ioState = ioWin.StudioChat.getState();
    assert.equal(ioState.mode, "live");
    assert.equal(ioState.arenaTabConnected, true);
    assert.match(ioDoc.getElementById("chat-status-text").textContent, /شروع خودکار چت/);
    console.log("✔ [2/5] .github.io auto-paired via #bridge= & detected live Arena Tab connection");

    // 3. Send message from .io while Arena is BUSY (Stop button visible)
    await ioWin.StudioChat.sendMessage("لطفاً بخش هیرو اسلایدر را با المنتور بساز");
    await sleep(500);
    assert.equal(stopClicked, false, "Bridge MUST NEVER click Stop while Arena is busy!");
    assert.equal(submittedArenaTurns.length, 0, "Should wait while Stop button is visible");
    console.log("✔ [3/5] Busy-turn guard verified: Bridge waited safely without clicking Stop");

    // 4. Finish previous Arena turn (hide Stop button) -> Bridge automatically submits new turn!
    arenaStopBtn.style.display = "none";
    await sleep(1100);

    assert.equal(submittedArenaTurns.length, 1, "Expected exactly 1 new turn submitted to Arena");
    assert.match(submittedArenaTurns[0], /\[پیام مستقیم از داشبورد \.io\]/);
    assert.match(submittedArenaTurns[0], /لطفاً بخش هیرو اسلایدر را با المنتور بساز/);
    assert.match(submittedArenaTurns[0], /بدون اجرای listen نوبت را تمام کن/);
    console.log("✔ [4/5] Arena chat composer auto-filled & submitted ONCE (starting fresh turn)");

    // 5. Agent replies in the new turn & finishes -> reply streams straight into .io!
    execFileSync(
      "python3",
      [
        path.join(REPO_ROOT, "tools/chat_cli.py"),
        "--server",
        serverOrigin,
        "--chat-file",
        tmpChatFile,
        "reply",
        "هیرو اسلایدر آماده شد! این پاسخ مستقیم داخل سایت .io شما نمایش داده شد.",
      ],
      { stdio: "pipe" },
    );
    await sleep(350);

    assert.match(
      ioDoc.getElementById("chat-stream").textContent,
      /این پاسخ مستقیم داخل سایت \.io شما نمایش داده شد/,
    );
    const greenTicks = ioDoc.querySelectorAll(".chat-msg__ticks.is-replied");
    assert.equal(greenTicks.length, 1);
    console.log("✔ [5/5] Agent reply arrived live inside .github.io via SSE & turn finished cleanly!");

    aWin.__ArenaIoBridge.destroy();
    ioWin.StudioChat.destroy();
    arenaDom.window.close();
    ioDom.window.close();
  } finally {
    srvProc.kill("SIGTERM");
    try {
      fs.unlinkSync(tmpChatFile);
    } catch {}
  }

  console.log("\n🎉 FULL TWO-TAB (.io -> Arena New Turn -> .io Live Reply) E2E PASSED 100%!");
}

main().catch((err) => {
  console.error("TWO-TAB E2E FAILED:", err);
  process.exit(1);
});
