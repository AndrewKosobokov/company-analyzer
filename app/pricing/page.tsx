import { Metadata } from 'next';
import PricingContent from '@/components/PricingContent';

export const metadata: Metadata = {
  title: 'Тариф — Металл Вектор',
  description: 'Безлимитный доступ к анализу компаний на 1 месяц за 3 500 рублей. Неограниченное количество анализов для менеджеров по продажам металлопроката.',
  keywords: ['тариф металл вектор', 'безлимитный анализ компаний', 'B2B анализ металлоторговля', 'стоимость анализа компаний'],
  openGraph: {
    title: 'Тариф — Металл Вектор',
    description: 'Безлимитный доступ к анализу компаний на 1 месяц за 3 500 рублей',
    url: 'https://metalvector.ru/pricing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru/pricing',
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
