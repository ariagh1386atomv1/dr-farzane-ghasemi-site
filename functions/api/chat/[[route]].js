/**
 * Cloudflare Pages Function — Catch-all handler for `/api/chat/*`
 */

import worker from "../../../cloudflare-worker/worker.js";

export async function onRequest(context) {
  return worker.fetch(context.request, context.env, context);
}
