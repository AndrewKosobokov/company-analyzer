import { Metadata } from 'next';
import PricingContent from '@/components/PricingContent';

export const metadata: Metadata = {
  title: 'Тарифы — Металл Вектор',
  description: 'Выберите подходящий тариф для анализа клиентов металлоторговли. Start, Optimal, Profi — от 40 до 200 анализов компаний.',
  keywords: ['тарифы металл вектор', 'цены анализ клиентов', 'B2B тарифы металлоторговля', 'стоимость анализа компаний'],
  openGraph: {
    title: 'Тарифы — Металл Вектор',
    description: 'Выберите подходящий тариф для анализа клиентов металлоторговли',
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
