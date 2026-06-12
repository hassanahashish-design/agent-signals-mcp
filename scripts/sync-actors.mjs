#!/usr/bin/env node
// Sync the agent-signals MCP toolkit with the live Apify actor portfolio.
//
// - Source of truth for "published": authenticated per-actor isPublic flag
//   (the public store search index lags new actors by hours/days — measured 2026-06-12).
// - Theme gate: sync-config.json autoInclude/exclude lists; anything published but
//   unlisted there is flagged for review, never auto-added (coherence > coverage).
// - Verifies the MCP endpoint (initialize + tools/list) on EVERY run, even with no
//   changes — doubles as a daily health check of the live product.
// - Writes server.json / README.md / LISTINGS.md only after the new URL verifies.
// - Publishes a Smithery release (preserving the existing configSchema) when
//   SMITHERY_API_KEY is set; otherwise flags for manual update.
//
// Env: APIFY_TOKEN (required), SMITHERY_API_KEY (optional),
//      GITHUB_OUTPUT / GITHUB_STEP_SUMMARY (set by Actions; optional).
// Flags: --dry-run  (no file writes, no Smithery release)

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY;

const out = [];
const log = (m) => { console.log(m); out.push(m); };
const fail = (m) => { console.error(`FAIL: ${m}`); out.push(`**FAIL:** ${m}`); finish(); process.exit(1); };
function finish() {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join('\n') + '\n');
}
function setOutput(k, v) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
}

if (!APIFY_TOKEN) fail('APIFY_TOKEN env/secret is missing — cannot verify the MCP endpoint, refusing to sync.');

const cfg = JSON.parse(readFileSync(path.join(root, 'sync-config.json'), 'utf8'));
const serverJsonPath = path.join(root, 'server.json');
const readmePath = path.join(root, 'README.md');
const listingsPath = path.join(root, 'LISTINGS.md');
const serverJson = JSON.parse(readFileSync(serverJsonPath, 'utf8'));

const apify = async (p, attempt = 1) => {
  try {
    const r = await fetch(`https://api.apify.com/v2${p}`, { headers: { Authorization: `Bearer ${APIFY_TOKEN}` } });
    if (r.status >= 500 && attempt < 4) throw new Error(`HTTP ${r.status}`);
    if (!r.ok) { fail(`Apify API ${p} -> HTTP ${r.status}`); }
    return (await r.json()).data;
  } catch (e) {
    if (attempt >= 4) fail(`Apify API ${p} failed after ${attempt} attempts: ${e.message}`);
    await new Promise((res) => setTimeout(res, attempt * 3000));
    return apify(p, attempt + 1);
  }
};

// ---- 1. live published actors (authoritative: per-actor isPublic) ----
const mine = await apify(`/acts?my=1&limit=200`);
const details = [];
for (const a of mine.items) {
  details.push(await apify(`/acts/${cfg.username}~${a.name}`));
}
const published = details.filter((d) => d.isPublic && !d.isDeprecated);
const publishedSlugs = new Set(published.map((d) => d.name));
log(`Live published actors: ${published.length} of ${details.length} total (${[...publishedSlugs].join(', ')})`);

// ---- 2. current toolkit from server.json ----
const url = new URL(serverJson.remotes[0].url);
const current = (url.searchParams.get('actors') || '').split(',').filter(Boolean)
  .map((s) => s.split('/')[1]);

// ---- 3. theme gate -> desired list ----
const kept = current.filter((s) => publishedSlugs.has(s));
const removed = current.filter((s) => !publishedSlugs.has(s));
const additions = [...publishedSlugs].filter((s) =>
  !current.includes(s) && cfg.autoInclude.includes(s));
const reviewFlags = [...publishedSlugs].filter((s) =>
  !current.includes(s) && !cfg.autoInclude.includes(s) && !cfg.exclude.includes(s));
const desired = [...kept, ...additions];

if (removed.length) log(`Removing (no longer public): ${removed.join(', ')}`);
if (additions.length) log(`Adding (published + in-theme): ${additions.join(', ')}`);
if (reviewFlags.length) log(`REVIEW NEEDED (published but not theme-gated — candidates for a second listing?): ${reviewFlags.join(', ')}`);
setOutput('review_flags', reviewFlags.join(','));

const changed = removed.length > 0 || additions.length > 0;
const newUrl = new URL(serverJson.remotes[0].url);
newUrl.searchParams.set('actors', desired.map((s) => `${cfg.username}/${s}`).join(','));

// ---- 4. verify the (possibly unchanged) URL end-to-end ----
async function mcpCall(target, body, sessionId) {
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    Authorization: `Bearer ${APIFY_TOKEN}`,
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const r = await fetch(target, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await r.text();
  return { status: r.status, session: r.headers.get('mcp-session-id'), text };
}
function sseJson(text) {
  const lines = text.split('\n').filter((l) => l.startsWith('data:'));
  if (!lines.length) { try { return JSON.parse(text); } catch { return null; } }
  try { return JSON.parse(lines[lines.length - 1].slice(5)); } catch { return null; }
}

const target = newUrl.toString();
const init = await mcpCall(target, {
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'sync-actors', version: '1.0' } },
});
if (init.status !== 200) fail(`MCP initialize -> HTTP ${init.status}: ${init.text.slice(0, 300)}`);
await mcpCall(target, { jsonrpc: '2.0', method: 'notifications/initialized' }, init.session);
const tl = await mcpCall(target, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, init.session);
if (tl.status !== 200) fail(`MCP tools/list -> HTTP ${tl.status}: ${tl.text.slice(0, 300)}`);
const tools = sseJson(tl.text)?.result?.tools?.map((t) => t.name) ?? [];
const missing = desired.filter((s) => !tools.some((n) => n.includes(s)));
if (missing.length) fail(`tools/list missing expected actors: ${missing.join(', ')} (got: ${tools.join(', ')})`);
log(`Verified: tools/list returned ${tools.length} tools, all ${desired.length} actors present.`);

if (!changed) {
  log('No change — toolkit already in sync. (Endpoint health check passed.)');
  setOutput('changed', 'false');
  setOutput('smithery', 'skipped');
  finish();
  process.exit(0);
}
if (DRY) {
  log('[dry-run] Would update server.json/README/LISTINGS and publish Smithery release.');
  setOutput('changed', 'false');
  finish();
  process.exit(0);
}

// ---- 5. write server.json (URL + patch version bump) ----
serverJson.remotes[0].url = target;
serverJson.version = serverJson.version.replace(/(\d+)$/, (n) => String(Number(n) + 1));
writeFileSync(serverJsonPath, JSON.stringify(serverJson, null, 2) + '\n');

// ---- 6. README: swap URL everywhere + add rows for new actors ----
let readme = readFileSync(readmePath, 'utf8');
readme = readme.split(url.toString()).join(target);
const rows = additions.map((slug) => {
  const d = details.find((x) => x.name === slug);
  const firstSentence = (d.description || '').split('. ')[0];
  const ev = Object.values(
    (d.pricingInfos || []).at(-1)?.pricingPerEvent?.actorChargeEvents || {},
  ).find((e) => e.isPrimaryEvent);
  const price = ev?.eventPriceUsd != null ? `$${+(ev.eventPriceUsd * 1000).toFixed(2)} / 1,000` : 'see Apify page';
  return `| [${d.title}](https://apify.com/${cfg.username}/${slug}) | ${firstSentence} | ${price} |`;
});
if (rows.length) {
  const tableRows = readme.match(/^\| \[.+$/gm);
  if (!tableRows) fail('Could not locate the tool table in README.md — add rows manually.');
  const lastRow = tableRows[tableRows.length - 1];
  readme = readme.replace(lastRow, `${lastRow}\n${rows.join('\n')}`);
}
writeFileSync(readmePath, readme);

// ---- 7. LISTINGS.md sync log ----
const stamp = new Date().toISOString().slice(0, 10);
let listings = readFileSync(listingsPath, 'utf8');
const entry = `- ${stamp}: +[${additions.join(', ')}] -[${removed.join(', ')}]` +
  (reviewFlags.length ? ` | REVIEW: ${reviewFlags.join(', ')}` : '') +
  ` | tools/list verified (${tools.length} tools) | v${serverJson.version}`;
listings = listings.includes('## Sync log')
  ? listings.replace('## Sync log\n', `## Sync log\n${entry}\n`)
  : listings + `\n## Sync log\n${entry}\n`;
writeFileSync(listingsPath, listings);
log(`Files updated: server.json (v${serverJson.version}), README.md (+${rows.length} rows), LISTINGS.md.`);
setOutput('changed', 'true');
setOutput('summary_line', `+${additions.join(',') || '-'} -${removed.join(',') || '-'}`);

// ---- 8. Smithery release (preserve existing configSchema) ----
if (!SMITHERY_API_KEY) {
  log('SMITHERY_API_KEY not set — Smithery NOT updated, flag for manual release.');
  setOutput('smithery', 'manual-needed');
} else {
  try {
    const q = encodeURIComponent(cfg.smitheryServer);
    const cur = await fetch(`https://api.smithery.ai/servers/${q}`).then((r) => r.json());
    const configSchema = cur.connections?.[0]?.configSchema;
    const form = new FormData();
    form.set('payload', JSON.stringify({ type: 'external', upstreamUrl: target, ...(configSchema ? { configSchema } : {}) }));
    const rel = await fetch(`https://api.smithery.ai/servers/${q}/releases`, {
      method: 'PUT', headers: { Authorization: `Bearer ${SMITHERY_API_KEY}` }, body: form,
    });
    const relBody = await rel.text();
    if (!rel.ok) throw new Error(`HTTP ${rel.status}: ${relBody.slice(0, 300)}`);
    log(`Smithery release submitted: ${relBody.slice(0, 200)}`);
    // verify: listing must show the new actors
    await new Promise((r) => setTimeout(r, 60_000));
    const after = await fetch(`https://api.smithery.ai/servers/${q}`).then((r) => r.json());
    const names = (after.tools || []).map((t) => t.name).join(',');
    const notLive = additions.filter((s) => !names.includes(s));
    if (notLive.length) throw new Error(`release submitted but listing does not yet show: ${notLive.join(', ')}`);
    log('Smithery listing verified — new tools visible.');
    setOutput('smithery', 'ok');
  } catch (e) {
    log(`Smithery update FAILED: ${e.message}`);
    setOutput('smithery', 'failed');
  }
}
finish();
