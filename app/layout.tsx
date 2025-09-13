import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { inter } from '@/lib/fonts';
import MacHeader from '@/components/MacHeader';

export const metadata: Metadata = {
  title: 'Alex Chernysh - Staff Solutions Architect • Glue Engineer',
  description: 'Black‑box chaos in your stack? I build the calm layer.',
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@600&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MacHeader />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
