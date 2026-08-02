import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'All-In-One AI — Universal AI Operating System',
  description: 'Access ChatGPT, Claude, Gemini, Grok and 15+ AI models from one dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-[#0A0F2E]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
