import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function debugFrontmatter() {
  const blogDir = path.resolve(process.cwd(), 'content', 'blog');
  const slug = 'bi-storytelling';
  const p = path.join(blogDir, slug, 'index.mdx');
  const raw = await fs.readFile(p, 'utf8');
  
  console.log('Raw content (first 200 chars):');
  console.log(raw.substring(0, 200));
  
  // Try normal parsing
  const result = matter(raw);
  const { data, content } = result;
  console.log('\nNormal parsing result:');
  console.log('Data keys:', Object.keys(data));
  console.log('Data:', data);
  
  // Try our custom approach
  let processedRaw = raw;
  let importSection = '';
  
  if (raw.trim().startsWith('import ') && raw.includes('---')) {
    const firstFrontmatterIndex = raw.indexOf('---');
    if (firstFrontmatterIndex > 0) {
      importSection = raw.substring(0, firstFrontmatterIndex).trim();
      processedRaw = raw.substring(firstFrontmatterIndex);
    }
  }
  
  console.log('\nCustom approach:');
  console.log('Import section:', importSection);
  console.log('Processed raw (first 100 chars):', processedRaw.substring(0, 100));
  
  const processedResult = matter(processedRaw);
  const { data: processedData, content: processedContent } = processedResult;
  console.log('Processed data keys:', Object.keys(processedData));
  console.log('Processed data:', processedData);
}

debugFrontmatter().catch(console.error);