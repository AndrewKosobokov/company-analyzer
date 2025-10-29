export const dynamic = "force-static";

import Link from 'next/link';

export default function ContactsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <span className="mr-2">←</span>
        Вернуться на главную
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">Контакты и реквизиты</h1>

      <section className="space-y-2 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">Контакты</h2>
        <p className="text-gray-600">Email: <a className="hover:underline" href="mailto:support@metalvector.ru">support@metalvector.ru</a></p>
        <p className="text-gray-600">Сайт: <a className="hover:underline" href="https://metalvector.ru" target="_blank" rel="noopener noreferrer">https://metalvector.ru</a></p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg md:text-xl font-medium text-black">Реквизиты</h2>
        <p className="text-gray-600">Исполнитель: Кособоков Андрей Алексеевич</p>
        <p className="text-gray-600">ИНН: 540409814223</p>
        <p className="text-gray-600">Адрес: 630105, Российская Федерация, Новосибирская область, г. Новосибирск, ул. Кропоткина, д. 109, кв. 70</p>
      </section>
    </main>
  );
}


