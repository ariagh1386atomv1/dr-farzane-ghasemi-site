/**
 * Cloudflare Pages Function — Catch-all handler for `/api/chat/*`
 * Automatically active when deploying this repository to Cloudflare Pages!
 */

import { handleChatRequest } from "../../../cloudflare-worker/worker.js";

export async function onRequest(context) {
  return handleChatRequest(context.request, context.env, context);
}
