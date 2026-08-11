import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fieldwise — Crop advisory from a photo',
  description:
    'Upload a leaf photo, share your location, and get a clear advisory: what may be wrong with your crop, how to treat it, and when it is safe to act.',
  openGraph: {
    title: 'Fieldwise — Crop advisory from a photo',
    description:
      'Upload a leaf photo, share your location, and get a clear advisory: what may be wrong with your crop, how to treat it, and when it is safe to act.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
