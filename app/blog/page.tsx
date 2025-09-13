import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';

export const metadata = { title: 'Blog' };

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="text-blue-600 hover:underline">
              {p.fm.title}
            </Link>
            <div className="text-sm text-neutral-500">
              {new Date(p.fm.date).toLocaleDateString()} · {p.readingMinutes} min
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{p.fm.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
