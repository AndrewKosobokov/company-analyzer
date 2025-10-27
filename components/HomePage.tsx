'use client';

import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/analysis');
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            <div style={{ fontSize: '24px', fontWeight: 600 }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
              Аналитика. Фокус. Результат.
            </div>
          </Link>
          <nav className="nav">
            <Link href="/pricing" className="nav-link">Тарифы</Link>
            <Link href="/login" className="button-primary header-button">Войти</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Металл Вектор</h1>
        <p className="subtitle">Аналитика. Фокус. Результат.</p>
        <p>
          Искусственный интеллект который находит вашу прибыль:
<br />
Анализирует потребности промышленных предприятий по металлу и не только.
<br />
Автоматически определяет те позиции, где вы сможете закрыть дефицит клиента с максимальной маржей.
        </p>
        <div className="hero-buttons">
          <Link href="/login" className="button-primary">Начать бесплатно</Link>
          <Link href="/pricing" className="button-secondary">Посмотреть тарифы</Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: 'var(--space-4xl) var(--space-lg)', background: 'var(--background-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            Почему Металл Вектор?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--space-xl)',
            marginTop: 'var(--space-2xl)'
          }}>
            <div className="card">
              <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-md)' }}>Аналитика</h3>
              <p style={{ color: 'var(--text-tertiary)' }}>
                Подробные отчеты для оценки финансового положения компании
			и выявления ее реальных потребностей в снабжении.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-md)' }}>Фокус</h3>
              <p style={{ color: 'var(--text-tertiary)' }}>
                Полное представление о структуре, приоритетах и "болях" клиента. 
			Вы точно понимаете задачи организации и предлагаете идеальные решения.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-md)' }}>Результат</h3>
              <p style={{ color: 'var(--text-tertiary)' }}>
                Выгодные контракты по сложным и высокомаржинальным позициям. 
			Вы зарабатываете там, где конкуренты теряются.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: 'var(--space-4xl) var(--space-lg)', background: 'var(--background-secondary)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', marginBottom: 'var(--space-xl)' }}>Как это работает?</h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-xl)',
            marginTop: 'var(--space-2xl)',
            textAlign: 'left'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)', 
              alignItems: 'flex-start',
              padding: 'var(--space-lg)',
              background: 'var(--background-primary)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '50px' }}>1</div>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>Введите данные</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  Укажите официальный сайт организации, либо ИНН если нет сайта
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)', 
              alignItems: 'flex-start',
              padding: 'var(--space-lg)',
              background: 'var(--background-primary)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '50px' }}>2</div>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>ИИ анализирует</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  Искуственный интеллект анализирует компанию, данные из открытых источников и формирует отчет.
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)', 
              alignItems: 'flex-start',
              padding: 'var(--space-lg)',
              background: 'var(--background-primary)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '50px' }}>3</div>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>Получите результат</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  Скачайте детальный отчет в удобном формате. 
			  Используйте его для выявления скрытых потребностей и заключения высокомаржинальных сделок.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: 'var(--space-4xl) var(--space-lg)', 
        background: 'var(--background-primary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>Готовы начать?</h2>
          <p style={{ 
            fontSize: '21px', 
            color: 'var(--text-tertiary)', 
            marginBottom: 'var(--space-xl)',
            lineHeight: '1.4'
          }}>
            Получите 3 бесплатных анализа при регистрации. 
            Кредитная карта не требуется.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="button-primary">Начать бесплатно</Link>
            <Link href="/pricing" className="button-secondary">Посмотреть тарифы</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: 'var(--space-2xl) var(--space-lg)',
        background: 'var(--background-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-lg)'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Металл Вектор</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Анализ компаний с ИИ</div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color var(--transition-fast)'
            }}>Тарифы</Link>
            <Link href="/login" style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color var(--transition-fast)'
            }}>Войти</Link>
            <Link href="/login" style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'color var(--transition-fast)'
            }}>Регистрация</Link>
          </div>
        </div>
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          marginTop: 'var(--space-lg)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          © 2025 Металл Вектор. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
