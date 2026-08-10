import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig } from '../config/site';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name}｜${siteConfig.tagline}`,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [{ url: '/logo-mark.png', type: 'image/png' }],
    apple: [{ url: '/logo-mark.png' }],
  },
  keywords: [
    'iPhone 維修',
    'iPad 維修',
    'Apple Watch 維修',
    'MacBook 維修',
    '換電池',
    '換螢幕',
    '香港手機維修',
    '荔枝角手機維修',
  ],
  openGraph: {
    title: `${siteConfig.name}`,
    description: siteConfig.slogan,
    locale: 'zh_HK',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A6CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
