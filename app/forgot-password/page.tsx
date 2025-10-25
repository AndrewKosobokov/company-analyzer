import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Восстановление пароля — Металл Вектор',
  description: 'Восстановите доступ к аккаунту Металл Вектор. Введите email для получения ссылки восстановления пароля.',
  keywords: ['восстановление пароля', 'забыл пароль металл вектор', 'сброс пароля B2B'],
  openGraph: {
    title: 'Восстановление пароля — Металл Вектор',
    description: 'Восстановите доступ к аккаунту Металл Вектор',
    url: 'https://metalvector.ru/forgot-password',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru/forgot-password',
  },
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
