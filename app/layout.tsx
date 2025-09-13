import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { inter } from '@/lib/fonts';
import MacHeader from '@/components/MacHeader';

export const metadata: Metadata = {
  title: 'Sasha C. | Homepage',
  description: 'Personal portfolio and blog',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
