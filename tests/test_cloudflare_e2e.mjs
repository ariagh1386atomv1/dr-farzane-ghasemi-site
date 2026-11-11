#!/usr/bin/env node
/**
 * Comprehensive Automated Test Suite for 24/7 Serverless Cloudflare Worker,
 * Cloudflare Pages Functions (`functions/api/chat/[[route]].js`), and
 * Full Browser E2E on `.github.io` / `.pages.dev` (PC-Off Simulation).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import workerDefault from "../cloudflare-worker/worker.js";
import { onRequest as pagesFunctionOnRequest } from "../functions/api/chat/[[route]].js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const requireFromTmp = createRequire("/tmp/studio-e2e/package.json");
const { JSDOM } = requireFromTmp("jsdom");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function createMockKv() {
  const map = new Map();
  return {
    store: map,
    async get(key, type) {
      const val = map.get(key);
      if (val === undefined) return null;
      return type === "json" ? JSON.parse(val) : val;
    },
    async put(key, val) {
      map.set(key, String(val));
    },
  };
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
    s.on("error", reject);
  });
}

async function runWorkerUnitTests() {
  console.log("=== [Part 1] Testing Cloudflare Worker & Pages Function Runtime ===");

  // 1. CORS Preflight + Unconfigured Setup Guide Fallback
  {
    const optRes = await workerDefault.fetch(
      new Request("https://chat.workers.dev/api/chat/send", { method: "OPTIONS" }),
      {},
      {},
    );
    assert.equal(optRes.status, 204);
    assert.equal(optRes.headers.get("Access-Control-Allow-Origin"), "*");

    const unconfRes = await workerDefault.fetch(
      new Request("https://chat.workers.dev/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "سلام" }),
      }),
      {},
      {},
    );
    assert.equal(unconfRes.status, 201);
    const unconfData = await unconfRes.json();
    assert.equal(unconfData.provider, "setup-needed");
    assert.match(unconfData.reply.text, /Workers AI/);
    console.log("✔ [1/6] CORS preflight & friendly setup-needed fallback verified");
  }

  // 2. Cloudflare Built-in Workers AI (Primary + Fallback Model + KV Persistence)
  {
    const kv = createMockKv();
    let callCount = 0;
    const envWithAiAndKv = {
      CHAT_KV: kv,
      AI: {
        async run(model, opts) {
          callCount += 1;
          // Simulate primary model transient error -> fallback to 8b succeeds!
          if (model.includes("70b")) {
            throw new Error("Simulated capacity spike on 70b");
          }
          assert.ok(Array.isArray(opts.messages));
          return { response: "پاسخ فارسی از **Cloudflare Workers AI** بدون نیاز به کلید!" };
        },
      },
    };

    const stRes = await workerDefault.fetch(
      new Request("https://chat.workers.dev/status"),
      envWithAiAndKv,
      {},
    );
    const stJson = await stRes.json();
    assert.equal(stJson.mode, "cloudflare-edge");
    assert.equal(stJson.provider, "cloudflare-workers-ai");
    assert.equal(stJson.kvEnabled, true);

    const sendRes = await workerDefault.fetch(
      new Request("https://chat.workers.dev/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "راهنمای نصب هدر در وودمارت چطور است؟",
          sectionId: "01-header",
          sectionTitle: "هدر داروخانه",
        }),
      }),
      envWithAiAndKv,
      {},
    );
    assert.equal(sendRes.status, 201);
    const sendData = await sendRes.json();
    assert.equal(callCount, 2, "Expected fallback from 70b to 8b model");
    assert.match(sendData.reply.text, /Cloudflare Workers AI/);
    assert.equal(sendData.reply.action.type, "open-guide");

    // Verify KV saved messages across stateless invocations
    const histRes = await workerDefault.fetch(
      new Request("https://chat.workers.dev/api/chat/messages"),
      envWithAiAndKv,
      {},
    );
    const histJson = await histRes.json();
    assert.equal(histJson.messages.length, 3); // welcome + user + agent
    console.log("✔ [2/6] Cloudflare Workers AI binding, model fallback & KV persistence verified");
  }

  // 3. Google Gemini API Secret Mode + Cloudflare Pages Function (`onRequest`)
  {
    const origFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, init) => {
        if (String(url).includes("generativelanguage.googleapis.com")) {
          const body = JSON.parse(init.body);
          assert.ok(body.systemInstruction.parts[0].text.includes("دکتر فرزانه قاسمی"));
          return new Response(
            JSON.stringify({
              candidates: [
                { content: { parts: [{ text: "پاسخ ۲۴ ساعته از موتور Gemini روی کلادفلر!" }] } },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        return origFetch(url, init);
      };

      const pagesRes = await pagesFunctionOnRequest({
        request: new Request("https://dr-farzane.pages.dev/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "سلام از Cloudflare Pages" }),
        }),
        env: { GEMINI_API_KEY: "test-gemini-key" },
        waitUntil() {},
      });
      assert.equal(pagesRes.status, 201);
      const pagesJson = await pagesRes.json();
      assert.equal(pagesJson.provider, "gemini");
      assert.match(pagesJson.reply.text, /موتور Gemini/);
      console.log("✔ [3/6] Cloudflare Pages Function (`functions/api/chat/[[route]].js`) + Gemini verified");
    } finally {
      globalThis.fetch = origFetch;
    }
  }
}

async function runBrowserPcOffE2E() {
  console.log("\n=== [Part 2] Testing Full PC-Off Browser E2E (.github.io -> Cloudflare Worker) ===");

  const port = await getFreePort();
  const workerBaseUrl = `http://127.0.0.1:${port}`;
  const kv = createMockKv();

  // Spin up local HTTP adapter hosting ONLY `cloudflare-worker/worker.js`
  const workerEnv = {
    CHAT_KV: kv,
    AI: {
      async run(_model, opts) {
        const lastUser = opts.messages[opts.messages.length - 1].content;
        if (lastUser.includes("بنر")) {
          return {
            response:
              "بله! این سکشن **بنر ارسال رایگان** ۱۰۰٪ با المنتور آماده است:\n\n" +
              "```json\n" +
              JSON.stringify(
                {
                  version: "0.4",
                  title: "بنر ارسال رایگان داروخانه",
                  type: "section",
                  content: [{ id: "b1000001", elType: "container", settings: {}, elements: [] }],
                },
                null,
                2,
              ) +
              "\n```\n" +
              "از دکمه زیر مستقیم فایل JSON آن را دانلود کنید.",
          };
        }
        return { response: "پاسخ ابری ۲۴ ساعته کلادفلر دریافت شد!" };
      },
    },
  };

  const edgeServer = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const bodyBuf = Buffer.concat(chunks);

    const webReq = new Request(`${workerBaseUrl}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD", "OPTIONS"].includes(req.method) ? undefined : bodyBuf,
    });
    const webRes = await workerDefault.fetch(webReq, workerEnv, { waitUntil() {} });
    res.statusCode = webRes.status;
    webRes.headers.forEach((v, k) => res.setHeader(k, v));
    const outBuf = Buffer.from(await webRes.arrayBuffer());
    res.end(outBuf);
  });

  await new Promise((r) => edgeServer.listen(port, "127.0.0.1", r));

  try {
    const html = fs
      .readFileSync(path.join(REPO_ROOT, "index.html"), "utf8")
      .replace(/<script\b[^>]*><\/script>/g, "");

    // Verify all DOM IDs match 100%
    const appJs = fs.readFileSync(path.join(REPO_ROOT, "assets/app.js"), "utf8");
    const chatJs = fs.readFileSync(path.join(REPO_ROOT, "assets/chat-widget.js"), "utf8");
    const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    for (const m of [
      ...appJs.matchAll(/getElementById\(["']([^"']+)["']\)/g),
      ...chatJs.matchAll(/getElementById\(["']([^"']+)["']\)/g),
    ]) {
      assert.ok(htmlIds.has(m[1]), `Missing #${m[1]} in index.html`);
    }

    const dom = new JSDOM(html, {
      url: "https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    });
    const { window } = dom;
    const { document } = window;

    let copiedClipboard = "";
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (t) => {
          copiedClipboard = String(t);
        },
      },
    });

    const createdBlobs = [];
    window.URL.createObjectURL = (blob) => {
      createdBlobs.push(blob);
      return "blob:generated-elementor-json";
    };
    window.URL.revokeObjectURL = () => {};

    window.fetch = async (input, init) => {
      const raw = typeof input === "string" ? input : input.url;
      if (raw.startsWith("http://127.0.0.1")) return fetch(raw, init);
      if (raw.startsWith("https://raspy-butterfly-bd83.warm-orchard-3899.workers.dev")) {
        const mapped = raw.replace(
          "https://raspy-butterfly-bd83.warm-orchard-3899.workers.dev",
          workerBaseUrl,
        );
        return fetch(mapped, init);
      }
      if (raw.includes("downloads/cloudflare-worker.js")) {
        return new Response(
          fs.readFileSync(path.join(REPO_ROOT, "downloads/cloudflare-worker.js"), "utf8"),
          { status: 200 },
        );
      }
      // Unconfigured .github.io has no /api/chat/status
      return new Response("Not Found", { status: 404 });
    };

    // Pre-seed stale legacy .e2b.app key to verify automatic cleanup!
    window.localStorage.setItem(
      "studio_chat_bridge_url_v1",
      "https://8080-ix43nn68ww0g2p07qf3qp.e2b.app",
    );

    window.eval(fs.readFileSync(path.join(REPO_ROOT, "assets/catalog.js"), "utf8"));
    window.eval(appJs);
    window.eval(chatJs);
    await sleep(250);

    // 4. Verify ZERO-CONFIG auto-connect to raspy-butterfly-bd83...workers.dev + legacy cleanup!
    assert.equal(window.localStorage.getItem("studio_chat_bridge_url_v1"), null);
    const st = window.StudioChat.getState();
    assert.equal(st.mode, "cloudflare");
    assert.equal(
      st.bridgeUrl,
      "https://raspy-butterfly-bd83.warm-orchard-3899.workers.dev",
    );
    assert.equal(st.provider, "cloudflare-workers-ai");
    assert.match(document.getElementById("chat-status-text").textContent, /ابری ۲۴\/۷ کلادفلر فعال/);

    document.getElementById("chat-settings-toggle").click();
    document.getElementById("chat-copy-worker-code").click();
    await sleep(80);
    assert.match(copiedClipboard, /export default/);
    console.log(
      "✔ [4/6] Zero-config auto-connect to raspy-butterfly-bd83.warm-orchard-3899.workers.dev verified!",
    );
    console.log("✔ [5/6] Stale .e2b.app cache cleared & 1-click Copy Worker button verified");

    // 6. Ask Cloudflare AI to build an Elementor banner -> verify JSON card + 1-click JSON download!
    await window.StudioChat.sendMessage("یک بنر ارسال رایگان بالای سایت با المنتور بساز");
    await sleep(150);

    const dlBtn = document.querySelector("[data-download-json-key]");
    assert.ok(dlBtn, "Expected auto-rendered 1-click JSON download button inside AI reply");
    dlBtn.click();
    assert.equal(createdBlobs.length, 1);
    const downloadedJsonText = await createdBlobs[0].text();
    const parsedJson = JSON.parse(downloadedJsonText);
    assert.equal(parsedJson.version, "0.4");
    assert.equal(parsedJson.type, "section");
    console.log("✔ [6/6] In-chat Elementor JSON generation & 1-click .json file download verified");

    window.StudioChat.destroy();
    window.close();
  } finally {
    edgeServer.close();
  }

  console.log("\n🎉 ALL CLOUDFLARE 24/7 WORKER + PAGES + BROWSER E2E TESTS PASSED 100%!");
}

await runWorkerUnitTests();
await runBrowserPcOffE2E();
