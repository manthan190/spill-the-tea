import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AmbientBackground } from '@/components/shared/ambient-background';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Spill The Tea — Anonymous Messages',
  description: 'Say Less. Spill More. Get anonymous tea from your followers.',
  openGraph: {
    title: 'Spill The Tea',
    description: 'Say Less. Spill More. Get anonymous tea from your followers.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}
        suppressHydrationWarning
      >
        <AmbientBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
        <SonnerToaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(9, 9, 11, 0.95)',
              border: '1px solid rgba(255, 0, 122, 0.3)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
        <Toaster />
      </body>
    </html>
  );
}
