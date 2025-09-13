import { getPost, getSlugs } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the initializers to avoid SSR issues
const ExternalLibraryLoader = dynamic(
  () => import('@/components/blog/ExternalLibraryLoader'),
  { ssr: false }
);

const ArticleStyles = dynamic(
  () => import('@/components/blog/ArticleStyles'),
  { ssr: false }
);

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const res = await getPost(params.slug);
  if (!res) return notFound();
  const { mdx, fm } = res;
  
  // Determine which external libraries to load
  const getExternalLibraries = () => {
    switch (params.slug) {
      case 'bi-storytelling':
        return (
          <ExternalLibraryLoader
            libraries={[
              {
                src: 'https://cdn.plot.ly/plotly-2.32.0.min.js',
                name: 'plotly'
              }
            ]}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <ArticleStyles slug={params.slug} />
      {getExternalLibraries()}
      <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-10">
        <h1>{fm.title}</h1>
        <p className="lead">{fm.description}</p>
        {mdx}
      </article>
    </>
  );
}
