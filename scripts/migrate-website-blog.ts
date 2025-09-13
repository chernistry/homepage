import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const LEGACY = '/Users/sasha/IdeaProjects/personal_core_services/website/root/public';
const TARGET = path.resolve(process.cwd(), 'content', 'blog');

async function exists(p: string) { try { await stat(p); return true; } catch { return false; } }

async function migrateOne(dir: string, file: string, title: string, desc: string, date: string) {
  const md = await readFile(path.join(dir, file), 'utf8');
  const slug = path.basename(dir);
  const outDir = path.join(TARGET, slug);
  await mkdir(outDir, { recursive: true });
  const body = `---\ntitle: ${title}\ndescription: ${desc}\ndate: ${date}\n---\n\n` + md;
  await writeFile(path.join(outDir, 'index.mdx'), body, 'utf8');
}

async function main() {
  // Example: prompt-engineering folder
  const pe = path.join(LEGACY, 'prompt-engineering');
  if (await exists(path.join(pe, 'prompt-engineering.md'))) {
    await migrateOne(pe, 'prompt-engineering.md', 'Prompt Engineering', 'Collected prompts/notes', '2024-09-01');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
