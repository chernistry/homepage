# AI/RAG Setup (Homepage)

This project uses Vectara for Retrieval-Augmented Generation (RAG) powering `/api/rag` and the desktop chat.

## Environment

Copy and fill the examples:

- `.env.local` → see `personal_core_services/homepage/.env.local.example:1`
- `.env_list` (for CI/CD/env sync) → see `personal_core_services/homepage/.env_list.example:1`

Required keys (Vectara):

- `VECTARA_API_KEY` – API key from Vectara Console
- `VECTARA_CUSTOMER_ID` – your customer ID
- `VECTARA_CORPUS_ID` – numeric corpus ID (used for indexing)
- `VECTARA_CORPUS_KEY` – corpus alias key (used for querying)

Useful optional keys:

- `SITE_URL` – canonical site URL (RSS/sitemap)
- `VECTARA_PROMPT_PATH` – custom prompt, e.g. `prompts/vectara-rag.md`
- `VECTARA_GENERATION_PRESET` – e.g. `vectara-summary-ext-24-05-med-omni`
- `VECTARA_BASE_URL` – override API base (defaults to Vectara SaaS)

## RAG Query Path

- API handler: `personal_core_services/homepage/app/api/rag/route.ts:1`
- Client calls go through `lib/vectara.ts:1` (uses `VECTARA_CORPUS_KEY` for search)

Test locally:

- `npm run dev`
- `curl -s localhost:3000/api/rag -X POST -H 'content-type: application/json' -d '{"query":"What is your experience?"}' | jq`

## Ingesting Content (Resume + Blog)

Two ready-to-run scripts index your content into Vectara using `VECTARA_CORPUS_ID`:

- Resume: `personal_core_services/homepage/scripts/vectara/ingest-resume.ts:1`
- Blog: `personal_core_services/homepage/scripts/vectara/ingest-blog.ts:1`

1) Prepare resume in one of the supported locations:

- Markdown/MDX with frontmatter: `personal_core_services/homepage/content/resume/index.mdx:1`
- Plain text fallback: `personal_core_services/homepage/public/resume.txt:1`

Example MDX frontmatter:

```
---
title: "Resume — Your Name"
---

Short summary paragraph...

- Role: Staff Solutions Architect
- Skills: Python, LLMs, RAG, AWS, Docker
- Experience: ...
```

2) Run ingestion (requires Node 20+):

- `npx tsx scripts/vectara/ingest-resume.ts`
- `npx tsx scripts/vectara/ingest-blog.ts`

On success, your corpus contains:

- `documentId=resume` with metadata `{ url: '/resume', type: 'resume' }`
- `documentId=blog-<slug>` for non-draft blog posts

## Prompts

- Active prompt path is resolved from `VECTARA_PROMPT_PATH`, fallback is baked-in template.
- Debug different prompts locally via `personal_core_services/homepage/debug-prompts.js:1`.

## Notes

- Query uses `VECTARA_CORPUS_KEY` (alias). Make sure a matching key exists in Vectara or set it to your alias.
- Indexing uses `VECTARA_CORPUS_ID` (numeric). Both must point to the same corpus.
- Keep real `.env.local` and `.env_list` out of Git (already ignored in `.gitignore`).

