# Agent Signals MCP — Hiring, SEC Filings, Research Papers, GitHub & News Data for AI Agents

One MCP server that gives your AI agent five live data tools — company hiring signals (Greenhouse/Lever/Ashby), SEC EDGAR full-text filings, academic papers (OpenAlex), GitHub repositories, and Hacker News mentions — all returned as flat, citation-ready JSON.

Built on [Apify](https://apify.com/oblanceolate_mandola)'s hosted MCP server: no installation, no hosting, pay-per-result billing through your own Apify account. **You only pay for successful results** — empty lookups cost $0.

## Quick start (Claude Desktop / Claude Code)

```json
{
  "mcpServers": {
    "agent-signals": {
      "url": "https://mcp.apify.com/?actors=oblanceolate_mandola/company-hiring-signals,oblanceolate_mandola/sec-edgar-filings,oblanceolate_mandola/research-paper-search,oblanceolate_mandola/github-repo-search,oblanceolate_mandola/hacker-news-monitor",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

Get a free Apify token at [console.apify.com/account/integrations](https://console.apify.com/account/integrations).

## What your agent can do with it

| Tool | Ask it | Price |
|---|---|---|
| [Company Hiring Signals](https://apify.com/oblanceolate_mandola/company-hiring-signals) | "Is Stripe hiring ML engineers?" — postings from Greenhouse, Lever & Ashby, one normalized schema | $2 / 1,000 results |
| [SEC EDGAR Filings](https://apify.com/oblanceolate_mandola/sec-edgar-filings) | "Find 8-K filings mentioning data breaches this month" — full-text search, filer + CIK + date | $5 / 1,000 |
| [Research Paper Search](https://apify.com/oblanceolate_mandola/research-paper-search) | "Recent papers on LLM evaluation with DOIs" — OpenAlex, citations + venue + year | $3 / 1,000 |
| [GitHub Repo Search](https://apify.com/oblanceolate_mandola/github-repo-search) | "Most-starred agent frameworks updated this week" — stars, forks, issues, last push | $3 / 1,000 |
| [Hacker News Monitor](https://apify.com/oblanceolate_mandola/hacker-news-monitor) | "What is HN saying about our brand?" — points, comments, dates for signal-weighting | $2 / 1,000 |

Every result carries `sourceUrl` + `scrapedAt`, so downstream agents can cite and re-verify. Batched queries are deduplicated and never double-charged. Spend is capped per call with `maxResults`.

## Why this server

- **Zero infrastructure** — hosted by Apify; this listing just pre-selects a coherent toolkit for signals & intelligence work (sales intel, due diligence, research grounding, brand monitoring).
- **Honest billing** — pay-per-event through your own Apify account; each tool's price is on its Apify page; no subscription, no markup.
- **Agent-first output** — flat JSON, stable schemas, OpenAPI also available per tool on its Apify API tab.

## FAQ

### Do I need to install anything?

No. It's a remote (streamable HTTP) MCP server — paste the config above into Claude Desktop, Claude Code, Cursor, or any MCP-compatible client.

### How is usage billed?

Through your own Apify account at each Actor's listed pay-per-result price. Failed or empty lookups cost nothing.

### Can I use only some of the tools?

Yes — edit the `actors=` list in the URL to include only the tools you want.
