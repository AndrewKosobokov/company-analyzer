export const dynamic = "force-static";

import Link from 'next/link';

export default function OfferPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <span className="mr-2">←</span>
        Вернуться на главную
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">Публичная оферта</h1>

      <p className="text-gray-600 mb-6">Основа: договор об оказании информационно-аналитических услуг.</p>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">1. Общие положения</h2>
        <p className="text-gray-600">Настоящий документ является публичной офертой. Акцептом оферты является оплата услуг через Сервис.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">2. Предмет договора</h2>
        <p className="text-gray-600">Исполнитель оказывает информационно-аналитические услуги посредством онлайн‑сервиса Металл Вектор (далее — Сервис).</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">3. Стоимость и оплата</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Start: 4 500 ₽ за 40 анализов</li>
          <li>Optimal: 8 500 ₽ за 80 анализов</li>
          <li>Profi: 12 000 ₽ за 200 анализов</li>
          <li>Оплата через ЮKassa</li>
          <li>Анализы действуют до полного использования</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">4. Порядок оказания услуг</h2>
        <p className="text-gray-600">Услуга считается оказанной в момент предоставления пользователю аналитического отчёта.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">5. Возврат средств</h2>
        <p className="text-gray-600">Денежные средства не подлежат возврату, за исключением случаев, предусмотренных законодательством РФ.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">6. Ответственность</h2>
        <p className="text-gray-600">Исполнитель не несёт ответственности за любые решения, принятые на основе отчётов.</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">7. Конфиденциальность</h2>
        <p className="text-gray-600">Стороны обязуются соблюдать режим конфиденциальности в отношении информации, полученной при оказании услуг.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-medium text-black">8. Реквизиты исполнителя</h2>
        <p className="text-gray-600">Исполнитель: Кособоков Андрей Алексеевич, ИНН 540409814223.</p>
        <p className="text-gray-600">Адрес: 630105, Российская Федерация, Новосибирская область, г. Новосибирск, ул. Кропоткина, д. 109, кв. 70</p>
      </section>
    </main>
  );
}


