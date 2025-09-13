import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import MacHeader from '@/components/MacHeader';

export const metadata = { title: 'Blog' };

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <div className="flex flex-col h-screen">
      <MacHeader />
      <div className="h-[calc(100vh-29px)] overflow-y-auto">
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
      </div>
    </div>
  );
}
