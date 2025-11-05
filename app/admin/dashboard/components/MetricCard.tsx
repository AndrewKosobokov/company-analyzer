interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: string;
}

export function MetricCard({ title, value, subtitle, change, icon }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  
  return (
    <div 
      className="card"
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #D2D2D7',
        backgroundColor: '#FFFFFF',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        {icon && (
          <span style={{ fontSize: '24px', lineHeight: 1 }}>{icon}</span>
        )}
        <h3 style={{ 
          fontSize: '13px', 
          fontWeight: 500, 
          color: '#86868B',
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <p style={{ 
          fontSize: '34px', 
          fontWeight: 600, 
          color: '#1D1D1F',
          margin: 0,
          lineHeight: 1.1
        }}>
          {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
        </p>
        {subtitle && (
          <p style={{ 
            fontSize: '13px', 
            color: '#86868B', 
            marginTop: '4px',
            margin: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>
      
      {change !== undefined && change !== 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          marginTop: '12px'
        }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 500,
            color: isPositive ? '#34C759' : isNegative ? '#FF3B30' : '#86868B'
          }}>
            {isPositive && '↑'}
            {isNegative && '↓'}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span style={{ 
            fontSize: '11px', 
            color: '#86868B'
          }}>
            vs предыдущий период
          </span>
        </div>
      )}
    </div>
  );
}

