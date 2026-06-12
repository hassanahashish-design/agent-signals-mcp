# Channel listings runbook — agent-signals-mcp

The same factory discipline, applied to channels: every listing below uses the SAME product
(the hosted MCP URL in README.md / server.json), verified before submission, honest copy only.
Status moves: draft → submitted → live → verified-in-search. Update the command centre
(`channels` block in scripts/build-command-center.mjs) as statuses change.

**Prerequisite (one-time, Hassan):** a public GitHub repo `agent-signals-mcp` under
hassanahashish-design containing README.md + server.json from this folder. Several registries
index from GitHub; all of them link to it as the canonical home.

---

## 1. Official MCP Registry (registry.modelcontextprotocol.io) — DO FIRST
- **Why first:** PulseMCP, Glama and others ingest from it — one submission seeds several
  directories.
- **How:** `npx @modelcontextprotocol/publisher publish` from the repo (GitHub-auth flow,
  needs Hassan logged into GitHub). Uses server.json as-is.
- **Verify:** `curl https://registry.modelcontextprotocol.io/v0/servers?search=agent-signals`
- Status: draft

## 2. Smithery (smithery.ai)
- **How (actual flow, walked 2026-06-12):** smithery.ai/new → namespace `hassan-a-hashish` +
  server-id `agent-signals` + base URL → Continue → connection parameters → scan credentials
  (Smithery connects with a REAL token to discover tools; owner pastes it — private to the
  dev account) → metadata/publish.
- **Auth mapping (LESSONS, verified live 2026-06-12):**
  - Smithery RESERVES the `Authorization` header for its own OAuth — you cannot ask users
    for it directly, and there is NO value templating (cannot prepend "Bearer ").
  - mcp.apify.com probes with real token: `?token=<APIFY_TOKEN>` query param → HTTP 200 ✓;
    raw token in `Authorization` (no Bearer) → 401; `X-Apify-Token` header → 401.
  - Chosen config: parameter `token` (string, location=query, required). Parameter
    descriptions are capped at 100 chars.
  - Open risk: the UI preview naively appends `?token=` to a URL that already has `?actors=`
    — confirm the scan succeeds (= gateway merges query params properly); fallback is a
    header param + "include the literal prefix 'Bearer '" in the description.
- **Copy:** title "Agent Signals — Hiring, SEC, Research, GitHub & HN data"; first paragraph
  of README verbatim.
- **Verify:** search "hiring signals" / "sec edgar" on Smithery after indexing.
- Status: CONFIGURED 2026-06-12 — listing saved at smithery.ai/servers/hassan-a-hashish/agent-signals
  (title + README-paragraph description + repo links; quality score 74/100; capability scan
  SUCCESS: gateway reached apify-mcp-server v0.11.0, found all 9 tools = 5 actors + 4 Apify
  helpers; `?token=` query config verified merging correctly with `?actors=`).
  DELIBERATELY UNLISTED (Hassan's call): flip public AFTER the 2026-06-13 ~2PM sync so the
  listing launches with the queued actors included — avoids re-snapshotting the toolkit at
  different times across channels. Same logic: hold mcp.so/Glama/official-registry
  submissions until after that sync, then do all of wave 1 against the same toolkit.
  NOTE: the actor tools carry a DESTRUCTIVE badge from Apify's tool annotations — Apify-side,
  cosmetic, not controllable from Smithery.

## 3. Glama (glama.ai/mcp/servers)
- **How:** indexes public GitHub MCP repos automatically once server.json + README exist;
  there is also a manual "submit" form — use it to accelerate.
- **Verify:** glama.ai/mcp/servers search for "agent signals".
- Status: draft

## 4. mcp.so
- **How:** "Submit" form (name, GitHub URL, description). No account barrier last checked.
- **Verify:** search after a day.
- Status: draft

## 5. PulseMCP (pulsemcp.com)
- **How:** ingests the official registry (step 1 covers it); manual submission form exists
  as a fallback.
- **Verify:** search after step 1 propagates.
- Status: draft

---

## Wave 2 (separate products — do NOT start until wave 1 is live)

- **x402 Bazaar:** needs a deployed pay-per-call HTTP endpoint (wrapper over the engine,
  Coinbase CDP wallet, USDC on Base) + Bazaar listing. Weekend-sized build. Switch-trigger
  from research: <10 real paid calls in month 1 while Apify shows traction → drop and refocus.
- **MCPize / MCP Hive:** marketplace-billed MCP hosting (85% / unknown share). Needs Hassan
  accounts; traffic unproven — list the same toolkit, measure, don't invest beyond listing.

## Standing maintenance — the portfolio grows daily (added 2026-06-12)

The factory's daily routine publishes up to 5 new actors/day in diverse verticals
(see actor-factory/PLAYBOOK.md "Portfolio strategy" + DISCOVERY-POOL.md), and doubles
down on any niche showing traction. Therefore:
- **After any publish day**, check what is actually live —
  `curl "https://api.apify.com/v2/store?username=oblanceolate_mandola"` (or the console) —
  then sync the `actors=` list: update server.json + README here, re-push the GitHub repo,
  and update any registry listing that snapshots the tool list. Re-verify initialize +
  tools/list against the updated URL before any listing copy mentions a new tool.
- **Keep the toolkit coherent.** This listing is "signals & intelligence" (hiring, SEC,
  research, GitHub, HN — and natural additions like federal-register, clinical-trials,
  court-opinions when they publish). If the portfolio diversifies into unrelated verticals
  (earthquakes, food safety, museums...), START A SECOND themed MCP listing — agents pick
  focused toolkits; a 30-tool grab-bag loses to a tight 6-tool kit on every registry.
- A traction signal on any actor (external paying user) = priority AEO refresh of the
  listing that contains it, with the keywords that won.
- **AUTOMATED IN THE CLOUD (2026-06-12):** GitHub Action `.github/workflows/sync-actors.yml`
  runs daily at 12:00 + 16:00 UTC on GitHub's servers (no local machine needed):
  reads live publish state per-actor (`isPublic` via authenticated API — the public store
  search index lags new actors by hours/days, measured 2026-06-12), applies the theme gate
  from `sync-config.json` (autoInclude/exclude; unknown published actors are FLAGGED for
  review, never auto-added), verifies initialize+tools/list against the new URL BEFORE any
  write (every run = daily endpoint health check; red run = endpoint broke), updates
  server.json/README/this-file, commits, and publishes a Smithery release via
  `PUT api.smithery.ai/servers/.../releases` preserving the existing configSchema.
  Secrets (GitHub repo → Settings → Secrets → Actions): **`APIFY_TOKEN2`** = Apify token,
  **`SMITHERY`** = Smithery API key (non-obvious names are deliberate-by-accident: a
  mis-paste put a Smithery key into the secret named `APIFY_TOKEN`, which is now stale/
  unused — the workflow maps env vars from APIFY_TOKEN2/SMITHERY instead. Lesson: when a
  human pastes secrets into pre-named forms, verify name↔value pairing by RUNNING the
  consumer, never by assuming). VERIFIED GREEN 2026-06-12: run #2 — 5/13 published
  detected, tools/list 9 tools all present, no-change exit. Test locally:
  `APIFY_TOKEN=... node scripts/sync-actors.mjs --dry-run`. Lessons: Apify API throws
  transient 502s — script retries 5xx up to 4×; GitHub cron can lag up to ~15-30 min.

## Honesty rules (carried from PLAYBOOK Stage 6)
- Never claim user counts/ratings we don't have.
- Every capability claim must be field-verified against the actor's spec.json.
- "You only pay for successful results" must remain literally true on every channel.
