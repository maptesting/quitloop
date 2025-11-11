import './globals.css';

export const metadata = {
  title: 'QuitLoop — Private, science-based micro-coach',
  description:
    'QuitLoop helps you interrupt compulsive porn use with 60-second micro-coaching, gentle friction, and privacy-first design.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'QuitLoop — Private, science-based micro-coach',
    description:
      'No surveillance. No shame. 60-second saves, daily micro-wins.',
    type: 'website'
  },
  twitter: { card: 'summary_large_image' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
