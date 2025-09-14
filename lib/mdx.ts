import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import readingTime from 'reading-time';
import { compileMDX } from 'next-mdx-remote/rsc';

export const BLOG_DIR = path.resolve(process.cwd(), 'content', 'blog');

const Frontmatter = z.object({
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
  console.log(`Starting getPost for slug: ${slug}`);
  try {
    console.log(`Getting post for slug: ${slug}`);
    const p = path.join(BLOG_DIR, slug, 'index.mdx');
    console.log(`Reading file: ${p}`);
    const raw = await fs.readFile(p, 'utf8');
    console.log(`File read successfully for slug: ${slug}`);
    
    // Try normal parsing first
    let { data, content } = matter(raw);
    console.log(`Initial frontmatter parsed for slug: ${slug}`, data);
    
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
        console.log(`Processed frontmatter for slug: ${slug}`, data);
      }
    }
    
    // Skip posts with empty frontmatter
    if (Object.keys(data).length === 0) {
      console.log(`Skipping ${slug} due to empty frontmatter`);
      return null;
    }
    
    const fm = Frontmatter.parse(data);
    console.log(`Frontmatter validated for slug: ${slug}`, fm);
    if (fm.draft) {
      console.log(`Post ${slug} is a draft, skipping`);
      return null;
    }
    
    // Import components needed for MDX based on the slug
    const components: Record<string, React.ComponentType<any>> = {};
    if (slug === 'bi-storytelling') {
      const { default: BiChart } = await import('../components/blog/BiChart');
      components.BiChart = BiChart;
    }
    
    // For prompt-engineering post, we need to handle the LaTeX expressions differently
    // The MDX compiler has issues with the curly braces in the LaTeX expressions
    let processedContent = content;
    if (slug === 'prompt-engineering') {
      // Wrap the LaTeX expressions in code tags to prevent MDX parsing
      processedContent = content.replace(/\\$/g, '<code class="math">').replace(/\\$/g, '</code>');
      console.log(`Wrapped LaTeX expressions in code tags for prompt-engineering post`);
    } else {
      // For other posts, preprocess content to handle LaTeX expressions
      // Replace \$ with $ for better compatibility
      processedContent = content
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$');
      console.log(`Replaced \\[ and \\] with $$ for other posts`);
    }
    
    console.log(`Content preprocessed for slug: ${slug}`);
    
    // Dynamically import remark-math and rehype-katex
    const [remarkMath, rehypeKatex] = await Promise.all([
      import('remark-math').then(mod => mod.default),
      import('rehype-katex').then(mod => mod.default)
    ]);
    
    console.log(`remark-math and rehype-katex imported for slug: ${slug}`);
    
    const { content: mdx } = await compileMDX({
      source: processedContent,
      components,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      },
    });
    console.log(`MDX compiled successfully for slug: ${slug}`);
    return { mdx, fm };
  } catch (e) {
    console.error(`Error getting post ${slug}:`, e);
    return null;
  }
}

export async function getSlugs(): Promise<string[]> {
  return listDirs(BLOG_DIR);
}