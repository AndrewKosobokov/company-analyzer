"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center space-y-3">
          <nav className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 text-xs md:text-sm text-gray-500">
            <Link href="/about" className="hover:text-gray-600 transition-colors">О проекте</Link>
            <span className="text-gray-300">|</span>
            <Link href="/contacts" className="hover:text-gray-600 transition-colors">Контакты</Link>
            <span className="text-gray-300">|</span>
            <Link href="/offer" className="hover:text-gray-600 transition-colors">Публичная оферта</Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Пользовательское соглашение</Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Политика конфиденциальности</Link>
          </nav>
          <p className="text-[11px] md:text-xs text-gray-400">© 2025 Металл Вектор</p>
        </div>
      </div>
    </footer>
  );
}


