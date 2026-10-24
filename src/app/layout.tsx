import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { content } from '@/config/content';

export const metadata: Metadata = {
  title: content.site.name,
  description: content.profile.intro,
};

export const viewport: Viewport = { themeColor: '#0B1626' };

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
