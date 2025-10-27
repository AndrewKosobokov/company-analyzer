import { tildaSans } from './fonts';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from '@/components/NotificationProvider';
import { OrganizationSchema, SoftwareApplicationSchema, WebSiteSchema } from '@/components/StructuredData';
import './globals.css';

export const metadata = {
  title: {
    default: 'Металл Вектор — Анализ потенциальных клиентов для металлоторговли',
    template: '%s | Металл Вектор'
  },
  description: 'B2B SaaS для анализа компаний-покупателей металлопроката. AI-анализ финансов, снабжения и генерация персонализированных коммерческих предложений.',
  keywords: ['анализ клиентов металлоторговля', 'B2B металлопрокат', 'анализ компаний', 'металл клиенты', 'поиск клиентов металл'],
  authors: [{ name: 'Металл Вектор' }],
  creator: 'Металл Вектор',
  publisher: 'Металл Вектор',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://metalvector.ru',
    siteName: 'Металл Вектор',
    title: 'Металл Вектор — Анализ клиентов для металлоторговли',
    description: 'B2B SaaS для анализа компаний-покупателей металлопроката',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Металл Вектор',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Металл Вектор — Анализ клиентов для металлоторговли',
    description: 'B2B SaaS для анализа компаний-покупателей металлопроката',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={tildaSans.variable}>
      <head>
        <link rel="canonical" href="https://metalvector.ru" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={tildaSans.className}>
        <OrganizationSchema />
        <SoftwareApplicationSchema />
        <WebSiteSchema />
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}