#!/usr/bin/env tsx
import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

async function ingestResume() {
  const resumePaths = [
    join(process.cwd(), 'content/resume/index.mdx'),
    join(process.cwd(), 'public/resume.txt'),
  ];
  
  for (const path of resumePaths) {
    try {
      const raw = await readFile(path, 'utf-8');
      const isMarkdown = path.endsWith('.mdx') || path.endsWith('.md');
      
      let title = 'Resume';
      let content = raw;
      
      if (isMarkdown) {
        const { data, content: mdxContent } = matter(raw);
        title = data.title || 'Resume';
        content = mdxContent;
      }
      
      const doc = {
        documentId: 'resume',
        title,
        text: content,
        metadata: {
          url: '/resume',
          type: 'resume',
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
        console.log(`✓ Indexed resume from: ${path}`);
        return; // Success, exit
      } else {
        console.error(`✗ Failed to index resume from ${path}: ${res.status}`);
      }
    } catch (e) {
      console.log(`Resume not found at ${path}, trying next...`);
    }
  }
  
  console.error('No resume file found in expected locations');
}

if (require.main === module) {
  ingestResume().catch(console.error);
}
