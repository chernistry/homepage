import { getPost, getSlugs } from '@/lib/mdx';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const res = await getPost(params.slug);
  if (!res) return notFound();
  const { mdx, fm } = res;
  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-10">
      <h1>{fm.title}</h1>
      <p className="lead">{fm.description}</p>
      {mdx}
    </article>
  );
}
