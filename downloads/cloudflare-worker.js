/**
 * ============================================================================
 * Dr. Farzane Ghasemi Studio — 24/7 Serverless Cloudflare AI Chat Worker
 * ============================================================================
 * Copy this ENTIRE file into Cloudflare Dashboard -> Worker -> Edit Code -> Deploy.
 *
 * Works 24/7 on Cloudflare's Edge even when your computer is completely OFF.
 * Runs ONLY for ~1-3 seconds per message (zero idle runtime, zero timeouts).
 *
 * Supported AI Backends (auto-detected in priority order):
 *   1. GEMINI_API_KEY   (Secret)  -> Google Gemini 2.5 Flash / 2.0 Flash
 *   2. OPENAI_API_KEY   (Secret)  -> OpenAI / OpenRouter / Compatible API
 *   3. AI               (Binding) -> Cloudflare Built-in Workers AI (100% Free!)
 * ============================================================================
 */

const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_ITEMS = 16;
const KV_HISTORY_KEY = "studio_chat_history_v1";
const DEFAULT_GITHUB_REPO = "ariagh1386atomv1/dr-farzane-ghasemi-site";
const DEFAULT_GITHUB_BRANCH = "arena/3c1e42b5-dr-farzane-ghasemi-site";

const SYSTEM_PROMPT = `تو دستیار هوشمند ابری ۲۴/۷ «استودیو قالب‌های المنتور سایت دکتر فرزانه قاسمی» هستی که روی لبه ابری کلادفلر (Cloudflare Edge) اجرا می‌شوی.

مشخصات دقیق پروژه کاربر:
- نوع سایت: داروخانه آنلاین و فروشگاه محصولات سلامت و پوست و مو (بر اساس طراحی مرجع دارونیک / Darunik) به زبان فارسی و راست‌چین (RTL).
- پلتفرم هدف کاربر: وردپرس + ووکامرس + قالب وودمارت (WoodMart) + المنتور رایگان + المنتور پرو (Elementor Pro).
- قانون طلایی قالب‌ها: تمام سکشن‌ها و قالب‌های JSON المنتور باید ۱۰۰٪ خالص با کانتینرهای Flexbox المنتور ("elType": "container") و ویجت‌های بومی المنتور / المنتور پرو ساخته شوند؛ بدون هیچ کد سفارشی، بدون ویجت HTML، بدون تگ <style> یا <script> و بدون custom_css.
- پالت رنگی برند داروخانه: سبز زمردی اصلی #0FA47A، سبز تیره #068462، پس‌زمینه سبز روشن #EAFAF4، سرمه‌ای تیره متون #14212E، خاکستری روشن #F4F7F9، خطوط جداکننده #E6ECF1، قرمز تخفیف #E5322D.
- بخش‌های آماده‌شده فعلی در داشبورد:
  1) «۰۱ — هدر اختصاصی داروخانه آنلاین دکتر فرزانه قاسمی» (فایل: 01-header-dr-farzane-ghasemi.json، شامل نوار اطلاع‌رسانی سرمه‌ای، ردیف چسبان لوگو + جستجو + حساب کاربری + سبد خرید کشویی ووکامرس، و نوار منوی دسکتاپ/موبایل).

وظایف تو:
1. همیشه به زبان فارسی روان، دقیق، محترمانه و حرفه‌ای پاسخ بده.
2. اگر کاربر درباره نحوه ایمپورت، تنظیمات وودمارت، المنتور پرو، ووکامرس یا ویرایش بخش‌ها سوال پرسید، راهنمای گام‌به‌گام و دقیق بده.
3. اگر کاربر از تو خواست یک بخش یا بنر جدید المنتوری بسازی، علاوه بر توضیح کوتاه، یک بلوک کد \`\`\`json استاندارد المنتور (با ساختار {"version": "0.4", "title": "...", "type": "section", "content": [...]}) بدون هیچ کد CSS/HTML تولید کن تا دکمه دانلود مستقیم فایل .json زیر پیامت برای کاربر فعال شود.`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Cache-Control",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function safeEnvString(env, key) {
  try {
    const val = env ? env[key] : undefined;
    return typeof val === "string" ? val.trim() : "";
  } catch {
    return "";
  }
}

function hasAiBinding(env) {
  try {
    return Boolean(env && env.AI && typeof env.AI.run === "function");
  } catch {
    return false;
  }
}

function hasKvBinding(env) {
  try {
    return Boolean(env && env.CHAT_KV && typeof env.CHAT_KV.get === "function");
  } catch {
    return false;
  }
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(String(b64 || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function cleanText(raw, maxLen = MAX_MESSAGE_CHARS) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maxLen);
}

function makeId(prefix = "cf") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectProvider(env) {
  if (safeEnvString(env, "GEMINI_API_KEY")) {
    return "gemini";
  }
  if (safeEnvString(env, "OPENAI_API_KEY") || safeEnvString(env, "AI_API_KEY")) {
    return "openai-compatible";
  }
  if (hasAiBinding(env)) {
    return "cloudflare-workers-ai";
  }
  return "setup-needed";
}

function defaultWelcomeMessage(provider) {
  const providerLabel =
    provider === "gemini"
      ? "Google Gemini"
      : provider === "openai-compatible"
        ? "OpenAI API"
        : provider === "cloudflare-workers-ai"
          ? "Cloudflare Workers AI"
          : "آماده اتصال هوش مصنوعی";

  return {
    id: "cf_welcome_0001",
    seq: 1,
    role: "agent",
    author: `دستیار ابری کلادفلر (${providerLabel})`,
    text:
      "سلام! 👋 من روی شبکه ابری **Cloudflare** مستقر هستم و **۲۴ ساعته حتی وقتی کامپیوتر شما خاموش است** کار می‌کنم.\n" +
      "• هر سوالی درباره قالب وودمارت و المنتور دارید یا اگر می‌خواهید بخش جدیدی برایتان تولید کنم، همین‌جا بنویسید.\n" +
      "• فقط در لحظه ارسال پیام چند ثانیه اجرا می‌شوم و بلافاصله خاموش می‌شوم (بدون هیچ تایم‌اوتی).",
    sectionId: null,
    sectionTitle: null,
    source: "cloudflare-edge",
    status: "delivered",
    action: null,
    createdAt: new Date().toISOString(),
  };
}

async function loadKvMessages(env, provider) {
  if (!hasKvBinding(env)) {
    return [defaultWelcomeMessage(provider)];
  }
  try {
    const raw = await env.CHAT_KV.get(KV_HISTORY_KEY, "json");
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
  } catch {
    /* fallback to welcome */
  }
  return [defaultWelcomeMessage(provider)];
}

async function saveKvMessages(env, messages) {
  if (!hasKvBinding(env)) return false;
  try {
    const trimmed = messages.slice(-100);
    await env.CHAT_KV.put(KV_HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

function buildConversationTurns(history, userText, sectionTitle) {
  const turns = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-MAX_HISTORY_ITEMS)) {
      if (!item || typeof item.text !== "string") continue;
      if (String(item.id || "").startsWith("cf_welcome")) continue;
      const role = item.role === "user" ? "user" : "assistant";
      turns.push({ role, content: cleanText(item.text, 3000) });
    }
  }
  const contextPrefix = sectionTitle ? `[بخش انتخابی در داشبورد: ${sectionTitle}]\n` : "";
  turns.push({ role: "user", content: `${contextPrefix}${userText}` });
  return turns;
}

async function callCloudflareWorkersAI(env, turns) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...turns];
  const customModel = safeEnvString(env, "CF_AI_MODEL");
  const models = [
    ...(customModel ? [customModel] : []),
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    "@cf/meta/llama-3.1-8b-instruct",
  ];

  let lastErr = null;
  for (const model of models) {
    try {
      const result = await env.AI.run(model, {
        messages,
        max_tokens: 2200,
        temperature: 0.35,
      });
      const reply =
        (typeof result === "string" && result) ||
        result?.response ||
        result?.result?.response ||
        result?.choices?.[0]?.message?.content;
      if (reply && String(reply).trim()) {
        return String(reply).trim();
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Workers AI response was empty");
}

async function callGeminiAPI(env, turns) {
  const apiKey = safeEnvString(env, "GEMINI_API_KEY");
  const customModel = safeEnvString(env, "GEMINI_MODEL");
  const models = [...(customModel ? [customModel] : []), "gemini-2.5-flash", "gemini-2.0-flash"];

  const contents = turns.map((t) => ({
    role: t.role === "user" ? "user" : "model",
    parts: [{ text: t.content }],
  }));

  let lastErr = null;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 2800,
          },
        }),
      });
      if (!res.ok) {
        lastErr = new Error(`Gemini HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (text) return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Gemini API failed");
}

async function callOpenAICompatible(env, turns) {
  const apiKey = safeEnvString(env, "OPENAI_API_KEY") || safeEnvString(env, "AI_API_KEY");
  const baseUrl = (safeEnvString(env, "AI_BASE_URL") || "https://api.openai.com/v1").replace(
    /\/+$/,
    "",
  );
  const model = safeEnvString(env, "AI_MODEL") || "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...turns],
      temperature: 0.35,
      max_tokens: 2500,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI-compatible HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty completion");
  return text;
}

async function generateAIReply(env, turns) {
  const provider = detectProvider(env);
  if (provider === "setup-needed") {
    return {
      provider,
      text:
        "✅ **ارتباط سایت شما با Cloudflare Worker کاملاً برقرار شد!**\n\n" +
        "فقط یک قدم ۳۰ ثانیه‌ای در پنل کلادفلر باقی مانده تا هوش مصنوعی رایگان آن فعال شود:\n" +
        "۱. در پنل کلادفلر وارد همین Worker شوید و به تب **Settings → Bindings** بروید.\n" +
        "۲. روی **+ Add** کلیک کنید، گزینه **Workers AI** را انتخاب کنید و نام متغیر (Variable name) را دقیقاً `AI` بگذارید و **Deploy** بزنید.\n" +
        "*(یا در بخش Variables and Secrets یک کلید رایگان `GEMINI_API_KEY` اضافه کنید).* \n\n" +
        "بلافاصله پس از آن، بدون روشن بودن کامپیوتر ۲۴ ساعته پاسخگوی شما هستم!",
    };
  }

  if (provider === "gemini") {
    const text = await callGeminiAPI(env, turns);
    return { provider, text };
  }
  if (provider === "openai-compatible") {
    const text = await callOpenAICompatible(env, turns);
    return { provider, text };
  }
  const text = await callCloudflareWorkersAI(env, turns);
  return { provider, text };
}

async function optionalSyncLogToGithub(env, userMsg, replyMsg) {
  const token = safeEnvString(env, "GITHUB_TOKEN");
  if (!token) return false;

  const repo = safeEnvString(env, "GITHUB_REPO") || DEFAULT_GITHUB_REPO;
  const branch = safeEnvString(env, "GITHUB_BRANCH") || DEFAULT_GITHUB_BRANCH;
  const filePath = "cloud-chat-log.json";
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "dr-farzane-cloudflare-worker",
    "Content-Type": "application/json",
  };

  try {
    let existing = [];
    let sha = undefined;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const fileJson = await getRes.json();
      sha = fileJson.sha;
      const decoded = base64ToUtf8(fileJson.content || "");
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) existing = parsed;
    }

    existing.push(
      {
        id: userMsg.id,
        role: "user",
        text: userMsg.text,
        sectionTitle: userMsg.sectionTitle,
        createdAt: userMsg.createdAt,
      },
      { id: replyMsg.id, role: "agent", text: replyMsg.text, createdAt: replyMsg.createdAt },
    );
    const trimmed = existing.slice(-60);
    const b64 = utf8ToBase64(JSON.stringify(trimmed, null, 2));

    await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "chore(cloud-chat): sync Cloudflare 24/7 chat entry",
        content: b64,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });
    return true;
  } catch {
    return false;
  }
}

function normalizeRoute(pathname) {
  const p = String(pathname || "/").replace(/\/+$/, "") || "/";
  if (p.endsWith("/status")) return "status";
  if (p.endsWith("/messages")) return "messages";
  if (p.endsWith("/send")) return "send";
  if (p.endsWith("/clear")) return "clear";
  if (p === "/" || p === "/api/chat") return "root";
  return "unknown";
}

async function handleChatRequest(request, env, ctx) {
  const method = String(request?.method || "GET").toUpperCase();
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const route = normalizeRoute(url.pathname);
  const provider = detectProvider(env);
  const hasKv = hasKvBinding(env);
  const hasGithubSync = Boolean(safeEnvString(env, "GITHUB_TOKEN"));

  if (route === "root" || route === "status") {
    if (method !== "GET" && method !== "HEAD") {
      return jsonResponse(405, { ok: false, error: "Method not allowed" });
    }
    const payload = {
      ok: true,
      mode: "cloudflare-edge",
      alwaysOnCloud: true,
      provider,
      kvEnabled: hasKv,
      githubSyncEnabled: hasGithubSync,
      agentListening: true,
      agentTyping: false,
      arenaTabConnected: true,
      unreadForAgent: 0,
      serverTime: new Date().toISOString(),
    };
    if (method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
      });
    }
    return jsonResponse(200, payload);
  }

  if (route === "messages" && method === "GET") {
    const messages = await loadKvMessages(env, provider);
    const afterSeq = Number(url.searchParams.get("after_seq") || "0") || 0;
    const filtered = messages.filter((m) => (Number(m.seq) || 0) > afterSeq);
    const latestSeq = messages.reduce((mx, m) => Math.max(mx, Number(m.seq) || 0), 0);
    return jsonResponse(200, {
      ok: true,
      mode: "cloudflare-edge",
      provider,
      messages: filtered,
      agentListening: true,
      agentTyping: false,
      arenaTabConnected: true,
      unreadForAgent: 0,
      latestSeq,
    });
  }

  if (route === "clear" || (route === "messages" && method === "DELETE")) {
    const resetList = [defaultWelcomeMessage(provider)];
    await saveKvMessages(env, resetList);
    return jsonResponse(200, {
      ok: true,
      messages: resetList,
      unreadForAgent: 0,
    });
  }

  if (route === "send" && method === "POST") {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, { ok: false, error: "ساختار JSON معتبر نیست." });
    }

    const rawText = typeof body?.text === "string" ? body.text : "";
    const text = cleanText(rawText, MAX_MESSAGE_CHARS + 10);
    if (!text) {
      return jsonResponse(400, { ok: false, error: "متن پیام نمی‌تواند خالی باشد." });
    }
    if (text.length > MAX_MESSAGE_CHARS) {
      return jsonResponse(400, {
        ok: false,
        error: `حداکثر طول مجاز پیام ${MAX_MESSAGE_CHARS} کاراکتر است.`,
      });
    }

    const sectionId = cleanText(body?.sectionId || "", 80) || null;
    const sectionTitle = cleanText(body?.sectionTitle || "", 160) || null;
    const existing = hasKv ? await loadKvMessages(env, provider) : [];
    const baseSeq = existing.reduce((mx, m) => Math.max(mx, Number(m.seq) || 0), 1);

    const nowUser = new Date().toISOString();
    const userMsg = {
      id: makeId("usr"),
      seq: baseSeq + 1,
      role: "user",
      author: "شما",
      text,
      sectionId,
      sectionTitle,
      source: cleanText(body?.source || "cloudflare-client", 50),
      status: "replied",
      action: null,
      createdAt: nowUser,
    };

    const historyInput =
      Array.isArray(body?.history) && body.history.length > 0 ? body.history : existing;
    const turns = buildConversationTurns(historyInput, text, sectionTitle);

    let aiResult;
    try {
      aiResult = await generateAIReply(env, turns);
    } catch (err) {
      aiResult = {
        provider,
        text:
          "خطای موقت در ارتباط با موتور هوش مصنوعی رخ داد. لطفاً چند ثانیه دیگر دوباره امتحان کنید یا تنظیمات کلید/Binding را در کلادفلر بررسی نمایید.\n" +
          `جزئیات فنی: \`${String(err?.message || err)}\``,
      };
    }

    let action = null;
    const low = text.toLowerCase();
    if (["دانلود هدر", "فایل هدر", "json هدر"].some((k) => low.includes(k))) {
      action = {
        type: "download",
        sectionId: sectionId || "01-header",
        label: "دانلود مستقیم فایل هدر (.json)",
      };
    } else if (["راهنمای نصب", "نصب در وودمارت", "ایمپورت هدر"].some((k) => low.includes(k))) {
      action = {
        type: "open-guide",
        sectionId: sectionId || "01-header",
        label: "باز کردن راهنمای گام‌به‌گام نصب",
      };
    }

    const replyMsg = {
      id: makeId("agt"),
      seq: baseSeq + 2,
      role: "agent",
      author:
        aiResult.provider === "setup-needed"
          ? "راهنمای راه‌اندازی کلادفلر"
          : "دستیار هوشمند ابری (۲۴/۷)",
      text: aiResult.text,
      sectionId,
      sectionTitle,
      source: `cloudflare-${aiResult.provider}`,
      status: "delivered",
      action,
      createdAt: new Date().toISOString(),
    };

    if (hasKv) {
      await saveKvMessages(env, [...existing, userMsg, replyMsg]);
    }

    if (hasGithubSync) {
      const syncPromise = optionalSyncLogToGithub(env, userMsg, replyMsg);
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(syncPromise);
      } else {
        await syncPromise;
      }
    }

    return jsonResponse(201, {
      ok: true,
      mode: "cloudflare-edge",
      provider: aiResult.provider,
      message: userMsg,
      reply: replyMsg,
      created: [userMsg, replyMsg],
      unreadForAgent: 0,
    });
  }

  return jsonResponse(404, { ok: false, error: "مسیر مورد نظر در Worker یافت نشد." });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleChatRequest(request, env || {}, ctx || {});
    } catch (err) {
      return jsonResponse(500, {
        ok: false,
        mode: "cloudflare-edge",
        error: "خطای داخلی در اجرای Worker رخ داد.",
        detail: String(err?.message || err),
      });
    }
  },
};
