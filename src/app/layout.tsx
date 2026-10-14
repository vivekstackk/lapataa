import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Sans_Devanagari, Pacifico } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

const pacifico = Pacifico({
  variable: '--font-script',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lapata — लापता',
  description: 'Your music. Your people. Your memories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${devanagari.variable} ${pacifico.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
