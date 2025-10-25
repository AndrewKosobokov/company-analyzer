import { Metadata } from 'next';
import VerifyEmailForm from '@/components/VerifyEmailForm';

export const metadata: Metadata = {
  title: 'Подтверждение email — Металл Вектор',
  description: 'Подтвердите email адрес для активации аккаунта Металл Вектор. Проверка email для доступа к анализу клиентов.',
  keywords: ['подтверждение email', 'активация аккаунта металл вектор', 'верификация email B2B'],
  openGraph: {
    title: 'Подтверждение email — Металл Вектор',
    description: 'Подтвердите email адрес для активации аккаунта Металл Вектор',
    url: 'https://metalvector.ru/verify-email',
    type: 'website',
  },
  alternates: {
    canonical: 'https://metalvector.ru/verify-email',
  },
};

export default function VerifyEmail() {
  return <VerifyEmailForm />;
}




