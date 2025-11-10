'use client';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #E5E5E7',
      padding: '32px 24px',
      marginTop: '64px',
      backgroundColor: '#FFFFFF'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '15px',
        color: '#86868B'
      }}>
        <div>
          © 2025 МеталлВектор. Все права защищены.
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a 
            href="mailto:support@metalvector.ru"
            style={{
              color: '#86868B',
              textDecoration: 'none',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1D1D1F'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#86868B'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            support@metalvector.ru
          </a>
        </div>
      </div>
    </footer>
  );
}

