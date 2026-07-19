import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'All-In-One AI — Universal AI Operating System',
  description: 'Access ChatGPT, Claude, Gemini, Grok and 15+ AI models from one dashboard. Compare, automate, and build with AI.',
  keywords: ['AI', 'ChatGPT', 'Claude', 'Gemini', 'AI Platform', 'AI Operating System'],
  openGraph: {
    title: 'All-In-One AI',
    description: 'One Platform. Every AI. Zero Compromise.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
