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
- **How:** "Add server" with the GitHub repo (sign in with GitHub — Hassan clicks auth).
  Remote-server listing; paste the streamable-http URL + Authorization header requirement.
- **Copy:** title "Agent Signals — Hiring, SEC, Research, GitHub & HN data"; first paragraph
  of README verbatim.
- **Verify:** search "hiring signals" / "sec edgar" on Smithery after indexing.
- Status: draft

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

## Honesty rules (carried from PLAYBOOK Stage 6)
- Never claim user counts/ratings we don't have.
- Every capability claim must be field-verified against the actor's spec.json.
- "You only pay for successful results" must remain literally true on every channel.
