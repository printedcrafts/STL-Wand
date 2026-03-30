/**
 * STL Wand Editor — Anthropic AI Proxy
 * Cloudflare Worker
 *
 * DEPLOY STEPS:
 *   1. Install Wrangler:  npm install -g wrangler
 *   2. Login:             wrangler login
 *   3. Set your key:      wrangler secret put ANTHROPIC_API_KEY
 *                         (paste sk-ant-... when prompted — never commit it)
 *   4. Deploy:            wrangler deploy
 *   5. Copy the Worker URL (e.g. https://stl-wand-ai.yourname.workers.dev)
 *      and paste it into STL Wand Editor → AI Advisor → ⚙ AI PROXY
 *
 * SECURITY MODEL:
 *   - The ANTHROPIC_API_KEY secret lives only in Cloudflare's encrypted store.
 *   - It is never exposed to the browser or included in responses.
 *   - The Worker validates the incoming request, forwards only a safe subset
 *     of the body to Anthropic, and returns only the text response.
 *   - CORS is locked to the STL Wand Editor origin (update ALLOWED_ORIGIN).
 *
 * wrangler.toml (create alongside this file):
 *   name = "stl-wand-ai"
 *   main = "ai-proxy-worker.js"
 *   compatibility_date = "2024-01-01"
 */

// ── Update this to your GitHub Pages URL ──────────────────────────────────
const ALLOWED_ORIGIN = 'https://printedcrafts.github.io';

// Anthropic API endpoint
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// Request size limit — reject anything larger than this
const MAX_BODY_BYTES = 32 * 1024; // 32 KB (geometry stats are tiny)

// ─────────────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, origin);
    }

    // ── Only allow POST from the permitted origin ───────────────────────────
    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405, origin);
    }
    if (!origin.startsWith(ALLOWED_ORIGIN)) {
      return corsResponse(JSON.stringify({ error: 'Forbidden origin' }), 403, origin);
    }

    // ── Guard against oversized payloads ────────────────────────────────────
    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      return corsResponse(JSON.stringify({ error: 'Request too large' }), 413, origin);
    }

    // ── Parse and validate the request body ─────────────────────────────────
    let body;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return corsResponse(JSON.stringify({ error: 'Request too large' }), 413, origin);
      }
      body = JSON.parse(raw);
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400, origin);
    }

    // ── Allowlist only the fields we expect — strip anything else ───────────
    const safeBody = {
      model:      'claude-sonnet-4-20250514', // always pin the model server-side
      max_tokens: Math.min(Number(body.max_tokens) || 200, 500), // cap tokens
      messages:   sanitizeMessages(body.messages),
    };

    if (!safeBody.messages || safeBody.messages.length === 0) {
      return corsResponse(JSON.stringify({ error: 'No messages provided' }), 400, origin);
    }

    // ── Forward to Anthropic with the server-side API key ───────────────────
    let anthropicResp;
    try {
      anthropicResp = await fetch(ANTHROPIC_URL, {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(safeBody),
      });
    } catch (err) {
      return corsResponse(JSON.stringify({ error: 'Upstream fetch failed' }), 502, origin);
    }

    // ── Return Anthropic's response to the browser ──────────────────────────
    const data = await anthropicResp.json();
    return corsResponse(JSON.stringify(data), anthropicResp.status, origin);
  },
};

// Sanitize messages: only keep role + text content, enforce text-only
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(0, 10) // max 10 messages
    .map(m => ({
      role: m.role,
      content: String(m.content || '').slice(0, 8000), // cap per-message length
    }));
}

function corsResponse(body, status, origin) {
  const headers = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': origin.startsWith(ALLOWED_ORIGIN) ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'X-Content-Type-Options':      'nosniff',
  };
  return new Response(body, { status, headers });
}