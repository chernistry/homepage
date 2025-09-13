import { Inter, Outfit, PT_Sans } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '600'],
});

export const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '700'],
});
