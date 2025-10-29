export const dynamic = "force-static";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <span className="mr-2">←</span>
        Вернуться на главную
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">Политика конфиденциальности</h1>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">1. Общие положения</h2>
        <p className="text-gray-600">Оператор персональных данных — Кособоков А.А., ИНН 540409814223.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">2. Какие данные собираем</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Email, пароль</li>
          <li>ИНН или ссылка на сайт анализируемой организации</li>
          <li>IP, время входа, тип устройства</li>
          <li>История анализов и отчёты</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">3. Цели обработки</h2>
        <p className="text-gray-600">Предоставление услуг, хранение отчётов, улучшение сервиса.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">4. Правовые основания</h2>
        <p className="text-gray-600">Согласие пользователя, исполнение договора.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">5. Передача данных третьим лицам</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>ЮKassa (для платежей)</li>
          <li>Yandex Cloud (хостинг)</li>
          <li>Госорганы (при законных основаниях)</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">6. Хранение данных</h2>
        <p className="text-gray-600">Данные хранятся на территории РФ, в сроки, установленные законом или до завершения использования Сервиса.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">7. Меры безопасности</h2>
        <p className="text-gray-600">Используются SSL/TLS и хеширование паролей.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">8. Права пользователя</h2>
        <p className="text-gray-600">Доступ к данным, исправление, удаление, право на жалобу в Роскомнадзор.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">9. Cookies</h2>
        <p className="text-gray-600">Cookies применяются для авторизации и улучшения работы Сервиса.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">10. Изменения в Политике</h2>
        <p className="text-gray-600">Актуальная версия Политики публикуется на сайте.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-medium text-black">11. Контакты</h2>
        <p className="text-gray-600">Email: support@metalvector.ru. Исполнитель: Кособоков Андрей Алексеевич, ИНН 540409814223.</p>
      </section>
    </main>
  );
}


