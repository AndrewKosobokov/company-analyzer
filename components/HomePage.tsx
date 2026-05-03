'use client';

import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/analysis');
    }
    // Trigger fade in animation after component mounts
    setTimeout(() => setIsMounted(true), 50);
  }, [user, loading, router]);


  return (
    <div className="page-container">
      {/* Header */}

      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'var(--background-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '16px'
          }}
        >
          Для металлоторговых компаний
        </div>
        <h1>Металл Вектор</h1>
        <p
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginTop: '8px',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}
        >
          Холодные звонки → сделки с высокой маржой
        </p>
        <p
          style={{
            marginTop: 0,
            color: 'var(--text-primary)'
          }}
        >
          ИИ сканирует предприятия, находит скрытые потребности в редких позициях по металлопрокату и выдаёт готовый скрипт для звонка.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-xl)'
          }}
        >
          {[
            { text: '60 секунд на анализ' },
            { text: 'Готовый скрипт звонка' },
            { text: 'Высокомаржинальные позиции' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'var(--background-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '100px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}
            >
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="hero-buttons">
          <Link 
            href="/login" 
            className="button-primary"
            style={{ transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Начать бесплатно
          </Link>
          <Link 
            href="/pricing" 
            className="button-secondary"
            style={{ transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Посмотреть тариф
          </Link>
        </div>
        <p
          style={{
            marginTop: '16px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}
        >
          3 бесплатных анализа при регистрации
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'var(--background-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '100px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginTop: '12px'
          }}
        >
          Создан практиками металлоторговли
        </div>
      </section>

      <section style={{
        padding: 'var(--space-2xl) var(--space-lg)',
        background: 'var(--background-secondary)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500
          }}>
            Пример отчёта
          </p>
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <img
              src="/report-preview.png"
              alt="Пример отчёта Металл Вектор"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
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
            {[
              { title: 'Аналитика', text: 'Подробные отчеты для оценки финансового положения компании\n\t\t\tи выявления ее реальных потребностей в снабжении.' },
              { title: 'Фокус', text: 'Полное представление о структуре, приоритетах и "болях" клиента. \n\t\t\tВы точно понимаете задачи организации и предлагаете идеальные решения.' },
              { title: 'Результат', text: 'Выгодные контракты по сложным и высокомаржинальным позициям. \n\t\t\tВы зарабатываете там, где конкуренты теряются.' }
            ].map((card, index) => (
              <div 
                key={index}
                className="card"
                style={{
                  opacity: isMounted ? 1 : 0,
                  transform: isMounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                  transitionDelay: `${(index * 0.15) + 0.3}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-md)' }}>{card.title}</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  {card.text}
                </p>
              </div>
            ))}
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
            <Link href="/pricing" className="button-secondary">Посмотреть тариф</Link>
          </div>
        </div>
      </section>

      
    </div>
  );
}
