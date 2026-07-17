# Channel listings runbook — agent-signals-mcp

The same factory discipline, applied to channels: every listing below uses the SAME product
(the hosted MCP URL in README.md / server.json), verified before submission, honest copy only.
Status moves: draft → submitted → live → verified-in-search. Update the command centre
(`channels` block in scripts/build-command-center.mjs) as statuses change.

**Prerequisite (one-time, Hassan):** a public GitHub repo `agent-signals-mcp` under
hassanahashish-design containing README.md + server.json from this folder. Several registries
index from GitHub; all of them link to it as the canonical home.

---

## 1. Official MCP Registry (registry.modelcontextprotocol.io)
- **Why high-leverage:** PulseMCP, Glama and others ingest from it — one publish seeds
  several directories.
- **TOOLING (verified live 2026-06-12 — the old runbook command was WRONG):**
  - `npx @modelcontextprotocol/publisher` = 404 (does not exist).
  - npm `mcp-publisher` = a DIFFERENT tool — launches as an stdio MCP server, NOT the
    registry CLI. Do not use.
  - The real CLI is the Go binary `mcp-publisher` from the registry's GitHub releases:
    `github.com/modelcontextprotocol/registry/releases/latest` →
    `mcp-publisher_<os>_<arch>.tar.gz` (darwin_arm64 for this Mac). Subcommands:
    init / login / logout / publish / status / validate.
- **FLOW (walked 2026-06-12):**
  1. `./mcp-publisher validate` (no auth) — catches schema errors first. It flagged
     two: description must be <=100 chars (ours was 159 → shortened), and the
     2025-07-09 schema is deprecated → migrated to 2025-12-11 (snake_case→camelCase:
     `is_required`→`isRequired`, `is_secret`→`isSecret`; `$schema` bumped; `headers`
     field name unchanged). Re-validate until "✅ server.json is valid".
  2. `./mcp-publisher login github` — interactive device-code flow; Hassan opens
     github.com/login/device, enters the code, authorizes (OAuth grant = his click).
     Must be logged into GitHub as `hassanahashish-design` (owns the namespace).
  3. `./mcp-publisher publish` — reads local server.json.
- **VERIFIED LIVE 2026-06-12:** published `io.github.hassanahashish-design/agent-signals-mcp`
  v1.0.0; `curl "https://registry.modelcontextprotocol.io/v0/servers?search=agent-signals"`
  returns 1 result, status **active**, correct remote URL.
- **AUTOMATED:** the sync Action now republishes on every toolkit change via
  `mcp-publisher login github-oidc` (no secret — repo owner authorizes the namespace).
  The script's version-bump-on-change avoids duplicate-version rejection. (OIDC path
  unverified until the first toolkit-change run exercises it; step is non-fatal.)
- Status: **LIVE 2026-06-12, but STALE as of 2026-07-17 — DRIFT.** Registry still shows
  v1.0.0 with only the original 5 actors; the OIDC auto-republish never landed the
  2026-07-03 v1.0.1 (+4 actors) change. Confirmed live:
  `curl ".../v0/servers?search=agent-signals"` → version 1.0.0, 5 actors, publishedAt
  2026-06-12 (unchanged). **The "unverified OIDC path" warning above came true — it is
  NOT working.** ⚠️ HASSAN/CLOUD: republish is a repo-owner action — either run
  `./mcp-publisher login github` (device code) + `./mcp-publisher publish` locally, or fix
  the Action's `mcp-publisher login github-oidc` step (check the workflow's OIDC
  permissions + that it runs on toolkit change). Cannot be done from this non-interactive
  sync session.

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
- **STALE as of 2026-07-17 — DRIFT.** `registry.smithery.ai/servers/hassan-a-hashish/agent-signals`
  still references only the original 5 actors in its config URL; its cached tools list shows
  5 actors + 4 Apify helpers = 9 tools, MISSING the 4 added 2026-07-03 (stackoverflow,
  clinical-trials, federal-register, gdelt). The cloud Action's Smithery-release step did not
  propagate. ⚠️ MANUAL UPDATE NEEDED — **no Smithery API key on disk** (`~/.config/smithery/api_key`
  absent) so this sync session could not PUT a new release. HASSAN: drop the Smithery API key at
  that path (chmod 600) so the automated release can run, or update the listing URL by hand in
  the Smithery dashboard to the 9-actor mcp.apify.com URL from server.json.

## 3. Glama (glama.ai/mcp/servers)
- **How (actual flow, walked 2026-06-12):** requires a Glama account (Hassan signed in
  via GitHub OAuth). "Add Server" modal → **Connector tab** (we are a deployed remote
  endpoint; the "Server" tab is for source-code repos). Fields: name, 1-2 sentence
  description, Server URL (the raw mcp.apify.com URL), and PRIVATE NOTES with a working
  test token — Glama human-reviews and only indexes connectors whose endpoint responds
  healthy, and ours 401s without a token. Used the dedicated "Agents" Apify token
  (rotatable independently of the default token that powers the sync Action).
- **Sync model:** the connector URL is a SNAPSHOT — old URL keeps serving its 5 actors
  but won't show new ones. The sync Action flags "manual Glama URL update" in its run
  summary whenever the toolkit changes. Long-term: Glama auto-ingests the official MCP
  registry (io.github.* connector entries), so channel 1 (registry, reads server.json)
  will give Glama a self-updating entry — the manual connector is for immediate
  visibility.
- **LESSON (verified 2026-06-12):** the Smithery gateway URL (run.tools) CANNOT be
  cross-listed as a universal stable URL — it returns 401 "Missing Authorization header"
  (requires Smithery's own OAuth in front of the config params). Snapshot URLs + registry
  ingestion is the real sync strategy.
- **Verify:** after review approval, glama.ai/mcp/servers search for "agent signals".
- **SECURITY FOLLOW-UP:** the "Agents" Apify token was exposed in a session transcript
  during submission (screenshot captured the pasted value 2026-06-12). ROTATE it at
  console.apify.com/settings/integrations as soon as the Glama review concludes (rotating
  earlier would break the reviewer's test credential). If review takes >7 days, rotate
  anyway and resubmit.
- Status: SUBMITTED 2026-06-12 (Hassan pasted test token + submitted) — pending Glama
  human review; duplicate-name guard confirmed it is in the queue. Verify-in-search after
  approval.

## 4. mcp.so
- **How (actual flow, walked 2026-06-12):** mcp.so/submit form (Type=MCP Server, Name,
  URL=GitHub repo, Server Config JSON). Submitting routes through sign-in (Hassan's
  Google account). LESSONS:
  - The submitted NAME becomes a LOCKED slug (disabled field) — submit a SHORT name
    ("agent-signals"), not the full marketing title. Ours locked to the long slug;
    kept because it is keyword-dense, but not pretty.
  - The submit form's Server Config does NOT persist — re-add it afterwards via
    My Servers → Edit (our record: mcp.so/my-servers/a6a952e4-c86a-4e16-97de-509c8cd747be/edit).
    Same for Description/Tags/Content (rich body) — all filled in the edit view.
  - "My Servers" list renders "No servers" even though the record exists — use the
    direct edit URL above.
  - Owner can only set status created/deleted; PUBLICATION is mcp.so's review.
  - Their CDN 403s anonymous fetches — verify via a real browser, not curl/WebFetch.
- **Sync model:** snapshot config JSON — covered by the sync Action's MANUAL FOLLOW-UP
  flag ("mcp.so if live").
- **Verify:** search "agent signals" on mcp.so after ~a day; record the public URL here.
- Status: SUBMITTED 2026-06-12 (status "created", full copy + config + content saved,
  "update project success" confirmed) — pending mcp.so review.

## 5. PulseMCP (pulsemcp.com)
- **How (confirmed 2026-06-12):** NO manual server form — pulsemcp.com/submit → "MCP Server"
  literally says "We ingest entries from the Official MCP Registry daily and process them
  weekly." So channel 1 (registry, now LIVE) fully covers PulseMCP. Email hello@pulsemcp.com
  only for listing tweaks.
- **Verify:** search pulsemcp.com for "agent signals" ~a week after the registry publish
  (2026-06-12) — i.e. on/after ~2026-06-19.
- Status: COVERED via official registry (auto) — awaiting their weekly ingest.

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

## Sync log
- 2026-07-03: +[federal-register-monitor, clinical-trials-search, stackoverflow-search, gdelt-news-monitor] -[] | REVIEW: wikipedia-search | tools/list verified (13 tools) | v1.0.1
- 2026-07-17: no actor change (live store 10 = 9 in-kit + wikipedia-search off-theme, still excluded). Re-verified tools/list against the live mcp.apify.com URL = 13 (all 9 actors present). Fixed stale README intro ("five"→"nine data tools") the cloud sync script leaves untouched. wikipedia-search remains the ONLY off-theme published actor — a single tool, not a cluster; not enough to justify a second themed MCP listing yet. Keep flagging until 3+ off-theme actors accumulate (e.g. a general knowledge/reference cluster).
  **DRIFT FOUND — downstream channels never got the 2026-07-03 +4:** official MCP registry still v1.0.0/5-actors (OIDC republish failed), Smithery listing still 5-actors (release didn't propagate + no local API key). Both need repo-owner/Hassan action — see §1 and §2 status blocks. GitHub repo + live endpoint are correct at 9; the STORE and the source of truth are in sync, only the two external directories lag.
