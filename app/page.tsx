import { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'Анализ клиентов для металлоторговли — Металл Вектор',
  description: 'B2B SaaS для поиска и анализа покупателей металлопроката. ИИ-анализ финансов, снабжения и генерация персонализированных коммерческих предложений.',
  keywords: ['анализ клиентов металлоторговля', 'поиск покупателей металлопроката', 'B2B анализ компаний металл', 'металл клиенты', 'анализ металлоторговли'],
  openGraph: {
    title: 'Анализ клиентов для металлоторговли — Металл Вектор',
    description: 'B2B SaaS для поиска и анализа покупателей металлопроката',
    url: 'https://metalvector.ru',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru',
  },
};

export default function Page() {
  return <HomePage />;
}