export default async function HomePage() {
  return (
    <section className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Hello, I&apos;m Sasha
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Welcome to my personal homepage. This is the foundation setup — blog
          and interactive features coming next.
        </p>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>✅ Next.js 14 App Router</span>
          <span>✅ TypeScript strict mode</span>
          <span>✅ Tailwind CSS</span>
          <span>✅ macOS-style header</span>
        </div>
      </div>
    </section>
  );
}
