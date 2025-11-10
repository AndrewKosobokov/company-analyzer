'use client';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #E5E5E7',
      padding: '32px 24px',
      marginTop: '64px',
      backgroundColor: '#FFFFFF',
      textAlign: 'center'
    }}>
      <a
        href="mailto:support@metalvector.ru"
        style={{
          color: '#1D1D1F',
          textDecoration: 'none',
          fontSize: '15px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#86868B'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#1D1D1F'}
      >
        support@metalvector.ru
      </a>
    </footer>
  );
}
