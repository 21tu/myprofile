import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { content } from '@/config/content';

export const metadata: Metadata = {
  title: content.site.name,
  description: content.profile.intro,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B1626' },
    { media: '(prefers-color-scheme: light)', color: '#F6F4EF' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main">
          本文へスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
