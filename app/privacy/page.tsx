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
        <p className="text-gray-600">Оператор персональных данных — Кособоков Андрей Алексеевич, ИНН 540409814223.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">2. Какие данные собираем</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Email, пароль (в хешированном виде)</li>
          <li>ИНН или ссылка на сайт анализируемой организации</li>
          <li>IP-адрес, время входа, тип устройства</li>
          <li>История анализов и сформированные отчёты</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">3. Цели обработки</h2>
        <p className="text-gray-600">Предоставление услуг платформы, хранение отчётов, улучшение сервиса, исполнение договора-оферты.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">4. Правовые основания</h2>
        <p className="text-gray-600">Согласие пользователя (ст. 6 152-ФЗ), исполнение договора.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">5. Передача данных третьим лицам</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>ЮKassa — для обработки платежей</li>
          <li>Timeweb (timeweb.cloud) — хостинг и хранение данных на территории РФ</li>
          <li>Google LLC (Vertex AI / Gemini) — обработка запросов для генерации аналитических отчётов</li>
          <li>DaData (ООО «Чистые данные») — получение сведений о юридических лицах по ИНН из открытых реестров</li>
          <li>Госорганы — при наличии законных оснований</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">6. Хранение данных</h2>
        <p className="text-gray-600">Данные хранятся на серверах на территории РФ (Timeweb). Срок хранения — 3 года с момента последней активности пользователя, либо до получения запроса на удаление.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">7. Меры безопасности</h2>
        <p className="text-gray-600">Передача данных защищена протоколом SSL/TLS. Пароли хранятся в хешированном виде. Доступ к данным ограничен.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">8. Права пользователя</h2>
        <p className="text-gray-600">Пользователь вправе: получить доступ к своим данным, потребовать их исправления или удаления, отозвать согласие на обработку, подать жалобу в Роскомнадзор.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">9. Cookies</h2>
        <p className="text-gray-600">Файлы cookies используются для авторизации, поддержания сессии и улучшения работы сервиса. Пользователь может отключить cookies в настройках браузера.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">10. Автоматизированная обработка</h2>
        <p className="text-gray-600">Сервис использует технологии искусственного интеллекта (Google Vertex AI / Gemini) для автоматического анализа данных о компаниях и формирования отчётов. Данные о физических лицах в автоматизированной обработке не участвуют.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">11. Изменения в Политике</h2>
        <p className="text-gray-600">Актуальная версия Политики публикуется на сайте metalvector.ru/privacy. Продолжение использования сервиса после изменений означает согласие с новой редакцией.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-medium text-black">12. Контакты</h2>
        <p className="text-gray-600">Email: support@metalvector.ru</p>
        <p className="text-gray-600">Оператор: Кособоков Андрей Алексеевич, ИНН 540409814223</p>
      </section>
    </main>
  );
}


