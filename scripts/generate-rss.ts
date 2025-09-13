import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import RSS from 'rss';
import { getAllPosts } from '@/lib/mdx';

async function main() {
  const siteUrl = process.env.SITE_URL ?? 'https://example.com';
  const feed = new RSS({ title: 'Blog', site_url: siteUrl, feed_url: `${siteUrl}/rss.xml` });
  const posts = await getAllPosts();
  for (const p of posts) {
    feed.item({
      title: p.fm.title,
      guid: p.slug,
      url: `${siteUrl}/blog/${p.slug}`,
      description: p.fm.description,
      date: new Date(p.fm.date),
    });
  }
  const xml = feed.xml({ indent: true });
  const out = path.resolve(process.cwd(), 'public', 'rss.xml');
  await writeFile(out, xml, 'utf8');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
