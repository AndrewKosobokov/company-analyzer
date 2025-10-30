import { Metadata } from 'next';
import { headers } from 'next/headers';

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

type PageProps = {
  searchParams?: { token?: string };
};

export default async function VerifyEmail({ searchParams }: PageProps) {
  const token = searchParams?.token || '';

  if (!token) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-2xl font-semibold mb-3 text-gray-900">Ошибка</h1>
        <p className="mb-6 text-gray-700">Токен не предоставлен. Проверьте ссылку из письма.</p>
        <a href="/login" className="inline-block rounded border border-black px-4 py-2 text-black">Войти</a>
      </div>
    );
  }

  let success = false;
  let message = '';
  let error = '';

  try {
    const hdrs = headers();
    const host = hdrs.get('host') || '';
    const proto = hdrs.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      // ensure this is not cached and executed at request time
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.success) {
      success = true;
      message = data.message || 'Почта подтверждена!';
    } else {
      error = data?.error || 'Ошибка сервера';
    }
  } catch (e) {
    error = 'Ошибка сервера';
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-2xl font-semibold mb-3 text-gray-900">Почта подтверждена!</h1>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/" className="inline-block rounded border border-black px-4 py-2 text-black">Перейти на сайт</a>
          <a href="/login" className="inline-block rounded border border-black px-4 py-2 text-black">Войти</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <h1 className="text-2xl font-semibold mb-3 text-gray-900">Не удалось подтвердить почту</h1>
      <p className="mb-6 text-gray-700">{error || 'Недействительный или истёкший токен'}</p>
      <div className="flex items-center justify-center gap-3">
        <a href="/login" className="inline-block rounded border border-black px-4 py-2 text-black">Войти</a>
        <a href="/" className="inline-block rounded border border-black px-4 py-2 text-black">На главную</a>
      </div>
    </div>
  );
}




