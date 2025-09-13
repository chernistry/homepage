import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';

const LEGACY_ROOT = '/Users/sasha/IdeaProjects/personal_core_services/website/root/public';
const TARGET_DIR = path.resolve(process.cwd(), 'content', 'blog');
const td = new TurndownService({ codeBlockStyle: 'fenced' });

async function convertHtml(slug: string, sourceFile: string, title: string, desc: string, date: string) {
  const html = await readFile(path.join(LEGACY_ROOT, sourceFile), 'utf8');
  const md = td.turndown(html);
  const outDir = path.join(TARGET_DIR, slug);
  await mkdir(outDir, { recursive: true });
  const body = `---\ntitle: ${title}\ndescription: ${desc}\ndate: ${date}\n---\n\n${md}`;
  await writeFile(path.join(outDir, 'index.mdx'), body, 'utf8');
  console.log(`✓ Converted ${slug}`)
}

async function convertMd(slug: string, sourceFile: string, title: string, desc: string, date: string) {
  const md = await readFile(path.join(LEGACY_ROOT, sourceFile), 'utf8');
  const outDir = path.join(TARGET_DIR, slug);
  await mkdir(outDir, { recursive: true });
  const body = `---\ntitle: ${title}\ndescription: ${desc}\ndate: ${date}\n---\n\n${md}`;
  await writeFile(path.join(outDir, 'index.mdx'), body, 'utf8');
  console.log(`✓ Converted ${slug}`)
}

async function main() {
  console.log('🚀 Starting blog migration...');
  await convertHtml('bi-storytelling', 'bi-storytelling/index.html', 'BI Storytelling', 'Apple-level interactive BI storytelling with Plotly', '2025-08-10');
  await convertMd('prompt-engineering', 'prompt-engineering/prompt-engineering.md', 'Advanced Prompt Engineering — PE2', 'PE2 framework and playbook', '2025-08-09');
  await convertHtml('synapse_paper', 'synapse_paper/index.html', 'SYNAPSE Framework', 'AI-driven adaptive software engineering', '2025-06-13');
  await convertHtml('llm-hallucination-prevention', 'llm-hallucination-prevention/index.html', 'Preventing Hallucinations in LLMs', 'Modern techniques to reduce hallucinations', '2025-09-09');
  console.log('✅ Blog migration complete!');
}

main().catch(e => { console.error('❌ Migration failed:', e); process.exit(1); });
