import { Metadata } from 'next';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Сброс пароля — Металл Вектор',
  description: 'Установите новый пароль для аккаунта Металл Вектор. Безопасный сброс пароля через токен.',
  keywords: ['сброс пароля', 'новый пароль металл вектор', 'установка пароля B2B'],
  openGraph: {
    title: 'Сброс пароля — Металл Вектор',
    description: 'Установите новый пароль для аккаунта Металл Вектор',
    url: 'https://metalvector.ru/reset-password',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru/reset-password',
  },
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}