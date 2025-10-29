export const dynamic = "force-static";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <span className="mr-2">←</span>
        Вернуться на главную
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">Пользовательское соглашение</h1>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">1. Общие положения</h2>
        <p className="text-gray-600">Настоящее Соглашение регулирует отношения между Пользователем и Исполнителем при использовании сервиса «Металл Вектор».</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">2. Предмет Соглашения</h2>
        <p className="text-gray-600">Предоставление доступа к функциональности Сервиса для проведения анализов и получения отчётов.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">3. Регистрация и доступ</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Предоставляется 3 бесплатных анализа после регистрации;</li>
          <li>Дальнейшее использование — по платным тарифам.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">4. Тарифы и порядок расчетов</h2>
        <p className="text-gray-600">Доступны тарифы Start, Optimal и Profi. Оплата производится через ЮKassa.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">5. Порядок оказания и списания услуг</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Анализ считается проведённым при формировании отчёта;</li>
          <li>Если система не смогла завершить анализ — анализ не списывается;</li>
          <li>Если компания нецелевая (не закупает металлопрокат) — анализ списывается;</li>
          <li>«Целевое предложение» не списывает дополнительные анализы;</li>
          <li>Доступно скачивание PDF/DOCX, копирование и шаринг в мессенджерах.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">6. Права и обязанности сторон</h2>
        <p className="text-gray-600">Пользователь обязуется предоставлять достоверные данные и соблюдать условия Соглашения. Исполнитель обеспечивает работоспособность Сервиса в пределах разумного.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">7. Ограничение ответственности</h2>
        <p className="text-gray-600">Исполнитель не несёт ответственности за точность данных, коммерческий результат и перебои, зависящие от третьих лиц.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">8. Интеллектуальная собственность</h2>
        <p className="text-gray-600">Права на программное обеспечение и материалы Сервиса принадлежат Исполнителю.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">9. Конфиденциальность</h2>
        <p className="text-gray-600">Обработка персональных данных осуществляется в соответствии с Политикой конфиденциальности.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">10. Разрешение споров</h2>
        <p className="text-gray-600">Споры разрешаются в претензионном порядке, при недостижении соглашения — в суде по месту регистрации Исполнителя.</p>
      </section>

      <section className="space-y-3 mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">11. Изменение условий</h2>
        <p className="text-gray-600">Исполнитель вправе изменять условия Соглашения. Актуальная версия публикуется на сайте.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-medium text-black">12. Контакты</h2>
        <p className="text-gray-600">Email: support@metalvector.ru. Исполнитель: Кособоков Андрей Алексеевич, ИНН 540409814223.</p>
      </section>
    </main>
  );
}


