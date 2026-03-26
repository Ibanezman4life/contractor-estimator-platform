import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contractor Estimator Platform',
  description: 'White-label AI contractor estimating platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}