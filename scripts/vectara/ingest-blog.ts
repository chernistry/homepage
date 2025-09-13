#!/usr/bin/env tsx
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

async function ingestBlog() {
  const contentDir = join(process.cwd(), 'content/blog');
  
  try {
    const entries = await readdir(contentDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    for (const slug of dirs) {
      const mdxPath = join(contentDir, slug, 'index.mdx');
      try {
        const raw = await readFile(mdxPath, 'utf-8');
        const { data, content } = matter(raw);
        
        if (data.draft) continue;
        
        const doc = {
          documentId: `blog-${slug}`,
          title: data.title || slug,
          text: content.replace(/^---[\s\S]*?---\n/, ''), // Strip frontmatter
          metadata: {
            url: `/blog/${slug}`,
            type: 'blog',
            date: data.date,
            tags: data.tags?.join(',') || '',
          },
        };
        
        const res = await fetch(`${process.env.VECTARA_BASE_URL || 'https://api.vectara.io'}/v1/index`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': process.env.VECTARA_API_KEY!,
            'customer-id': process.env.VECTARA_CUSTOMER_ID!,
          },
          body: JSON.stringify({
            document: doc,
            corpusId: process.env.VECTARA_CORPUS_ID,
          }),
        });
        
        if (res.ok) {
          console.log(`✓ Indexed blog post: ${slug}`);
        } else {
          console.error(`✗ Failed to index ${slug}: ${res.status}`);
        }
      } catch (e) {
        console.error(`✗ Error processing ${slug}:`, e);
      }
    }
  } catch (e) {
    console.error('Error reading blog directory:', e);
  }
}

if (require.main === module) {
  ingestBlog().catch(console.error);
}
