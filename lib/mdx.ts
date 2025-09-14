import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';

export const BLOG_DIR = path.resolve(process.cwd(), 'content', 'blog');

export const Frontmatter = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  date: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString().split('T')[0] : val
  ),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
  hero: z.string().optional(),
});
export type FrontmatterT = z.infer<typeof Frontmatter>;

export type PostIndex = {
  slug: string;
  fm: FrontmatterT;
  readingMinutes: number;
};

async function listDirs(dir: string): Promise<string[]> {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  return ents.filter((e) => e.isDirectory() && e.name !== '.gitkeep').map((e) => e.name);
}

export async function getAllPosts(): Promise<PostIndex[]> {
  const slugs = (await listDirs(BLOG_DIR)).sort();
  const out: PostIndex[] = [];
  for (const slug of slugs) {
    try {
      const p = path.join(BLOG_DIR, slug, 'index.mdx');
      const raw = await fs.readFile(p, 'utf8');
      
      // Try normal parsing first
      let { data, content } = matter(raw);
      
      // Handle MDX files that have imports before frontmatter
      // gray-matter expects frontmatter at the start, but MDX allows imports before it
      if (Object.keys(data).length === 0 && raw.trim().startsWith('import ') && raw.includes('---')) {
        // Extract the frontmatter section
        const firstFrontmatterIndex = raw.indexOf('---');
        if (firstFrontmatterIndex > 0) {
          const processedRaw = raw.substring(firstFrontmatterIndex);
          const processedResult = matter(processedRaw);
          data = processedResult.data;
          content = processedResult.content;
        }
      }
      
      // Skip posts with empty frontmatter
      if (Object.keys(data).length === 0) {
        console.log(`Skipping ${slug} due to empty frontmatter`);
        continue;
      }
      
      const fm = Frontmatter.parse(data);
      if (fm.draft) continue;
      const rt = readingTime(content);
      out.push({ slug, fm, readingMinutes: Math.max(1, Math.ceil(rt.minutes)) });
    } catch (error) {
      console.log(`Error processing post ${slug}:`, error);
      continue;
    }
  }
  return out.sort((a, b) => (a.fm.date < b.fm.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<{ mdx: React.ReactNode; fm: FrontmatterT } | null> {
  try {
    const p = path.join(BLOG_DIR, slug, 'index.mdx');
    const raw = await fs.readFile(p, 'utf8');
    const { data, content } = matter(raw);
    const fm = Frontmatter.parse(data);
    if (fm.draft) return null;
    const { content: mdx } = await compileMDX({
      source: content,
      options: {
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      },
    });
    return { mdx, fm };
  } catch (e) {
    console.error(`Error getting post ${slug}:`, e);
    return null;
  }
}

export async function getSlugs(): Promise<string[]> {
  return listDirs(BLOG_DIR);
}
