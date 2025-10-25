import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Вход — Металл Вектор',
  description: 'Войдите в систему для анализа клиентов металлоторговли. Регистрация и вход в B2B платформу Металл Вектор.',
  keywords: ['вход металл вектор', 'регистрация анализ клиентов', 'B2B вход металлоторговля', 'авторизация'],
  openGraph: {
    title: 'Вход — Металл Вектор',
    description: 'Войдите в систему для анализа клиентов металлоторговли',
    url: 'https://metalvector.ru/login',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru/login',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
