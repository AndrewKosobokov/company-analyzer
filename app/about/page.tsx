export const dynamic = "force-static";

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
        <span className="mr-2">←</span>
        Вернуться на главную
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-black mb-6">О проекте</h1>
      <p className="text-gray-600 mb-6">
        Металл Вектор — интеллектуальная платформа для анализа металлургических компаний с использованием ИИ.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">Что делает сервис</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Автоматизированный анализ промышленных предприятий</li>
          <li>Формирование аналитических отчётов на основе ИНН или сайта компании</li>
          <li>Рекомендации по направлениям поставок</li>
          <li>ИИ‑технологии (Gemini 2.5 Pro) с Google Search</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg md:text-xl font-medium text-black">Для кого</h2>
        <p className="text-gray-600">Инвесторы, аналитики, предприниматели, менеджеры по продажам</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-medium text-black">Преимущества</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Скорость: 2–3 минуты на анализ</li>
          <li>Точность ИИ</li>
          <li>История анализов</li>
          <li>Экспорт в PDF/DOCX</li>
        </ul>
      </section>
    </main>
  );
}


