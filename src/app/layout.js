import './globals.css';
import ServiceWorkerRegister from './sw-register';

export const metadata = {
  metadataBase: new URL('https://naijatriagehub.com'),
  title: 'NaijaTriageHub — Offline Health Triage for Nigeria',
  description:
    'Free offline symptom checker and emergency first-aid guide for malaria and dehydration, available in Hausa, Yoruba, Igbo and English. Works with no internet connection.',
  keywords: [
    'malaria symptoms checker',
    'Nigeria health app',
    'offline first aid',
    'dehydration symptoms',
    'CPR guide Nigeria',
    'Hausa Yoruba Igbo health app',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/apple-touch-icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/apple-touch-icon-167.png', sizes: '167x167', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TriageHub',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NaijaTriageHub — Offline Health Triage for Nigeria',
    description:
      'Check malaria and dehydration symptoms and get instant care guidance, fully offline, in your local language.',
    url: 'https://naijatriagehub.com',
    siteName: 'NaijaTriageHub',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NaijaTriageHub — Offline Health Triage for Nigeria',
    description: 'Free offline symptom checker and first-aid guide, in Hausa, Yoruba, Igbo and English.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f7a3d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-200 text-slate-900 antialiased min-h-screen">
        {/* Structured data helps Google understand this is a health/medical
            web app, which can improve how it's categorized in search results. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'NaijaTriageHub',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Any',
              description:
                'Offline symptom checker and first-aid guide for malaria and dehydration, available in Hausa, Yoruba, Igbo and English.',
              url: 'https://naijatriagehub.com',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
            }),
          }}
        />
        {/* Registers public/sw.js on the client so offline caching kicks in
            as soon as the app loads, on every route. */}
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}