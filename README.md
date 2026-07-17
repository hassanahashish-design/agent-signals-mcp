# Agent Signals MCP — Hiring, SEC Filings, Research Papers, GitHub & News Data for AI Agents

One MCP server that gives your AI agent nine live data tools — company hiring signals (Greenhouse/Lever/Ashby), SEC EDGAR full-text filings, academic papers (OpenAlex), GitHub repositories, Hacker News mentions, Stack Overflow questions, ClinicalTrials.gov trials, US Federal Register documents, and global GDELT news — all returned as flat, citation-ready JSON.

Built on [Apify](https://apify.com/oblanceolate_mandola)'s hosted MCP server: no installation, no hosting, pay-per-result billing through your own Apify account. **You only pay for successful results** — empty lookups cost $0.

## Quick start (Claude Desktop / Claude Code)

```json
{
  "mcpServers": {
    "agent-signals": {
      "url": "https://mcp.apify.com/?actors=oblanceolate_mandola%2Fcompany-hiring-signals%2Coblanceolate_mandola%2Fsec-edgar-filings%2Coblanceolate_mandola%2Fresearch-paper-search%2Coblanceolate_mandola%2Fgithub-repo-search%2Coblanceolate_mandola%2Fhacker-news-monitor%2Coblanceolate_mandola%2Ffederal-register-monitor%2Coblanceolate_mandola%2Fclinical-trials-search%2Coblanceolate_mandola%2Fstackoverflow-search%2Coblanceolate_mandola%2Fgdelt-news-monitor",
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
| [Federal Register Monitor — US Regulations to JSON](https://apify.com/oblanceolate_mandola/federal-register-monitor) | Search US Federal Register documents by keyword | $4 / 1,000 |
| [Clinical Trials Search — ClinicalTrials.gov to JSON](https://apify.com/oblanceolate_mandola/clinical-trials-search) | Search ClinicalTrials.gov by condition, drug or sponsor | $4 / 1,000 |
| [Stack Overflow Search — Questions to JSON](https://apify.com/oblanceolate_mandola/stackoverflow-search) | Search Stack Overflow questions by keyword | $2 / 1,000 |
| [GDELT News Monitor — Global News Mentions to JSON](https://apify.com/oblanceolate_mandola/gdelt-news-monitor) | Search worldwide news by keyword via GDELT | $2 / 1,000 |

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
