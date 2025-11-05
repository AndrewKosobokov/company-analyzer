interface AIHealthProps {
  errors24h: number;
  averageGenerationTime: number;
  successRate: number;
}

export function AIHealthStatus({ errors24h, averageGenerationTime, successRate }: AIHealthProps) {
  const getStatus = () => {
    if (errors24h === 0) {
      return { 
        text: 'Отлично', 
        color: '#34C759', 
        bg: '#F0FDF4',
        borderColor: '#BBF7D0'
      };
    }
    if (errors24h < 5) {
      return { 
        text: 'Хорошо', 
        color: '#1D1D1F', 
        bg: '#F5F5F7',
        borderColor: '#E8E8ED'
      };
    }
    if (errors24h < 10) {
      return { 
        text: 'Внимание', 
        color: '#FF9500', 
        bg: '#FFF7ED',
        borderColor: '#FED7AA'
      };
    }
    return { 
      text: 'Проблемы', 
      color: '#FF3B30', 
      bg: '#FEF2F2',
      borderColor: '#FECACA'
    };
  };
  
  const status = getStatus();
  
  return (
    <div 
      className="card"
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #D2D2D7',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          fontSize: '17px', 
          fontWeight: 600, 
          color: '#1D1D1F',
          margin: 0
        }}>
          Здоровье AI
        </h3>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 500, 
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: status.bg,
          color: status.color,
          border: `1px solid ${status.borderColor}`
        }}>
          {status.text}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#86868B',
            fontWeight: 500
          }}>
            Ошибок за 24ч
          </span>
          <span style={{ 
            fontSize: '28px', 
            fontWeight: 600, 
            color: '#1D1D1F'
          }}>
            {errors24h}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#86868B',
            fontWeight: 500
          }}>
            Среднее время
          </span>
          <span style={{ 
            fontSize: '28px', 
            fontWeight: 600, 
            color: '#1D1D1F'
          }}>
            {averageGenerationTime}с
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#86868B',
            fontWeight: 500
          }}>
            Успешность
          </span>
          <span style={{ 
            fontSize: '28px', 
            fontWeight: 600, 
            color: successRate >= 95 ? '#34C759' : successRate >= 90 ? '#FF9500' : '#FF3B30'
          }}>
            {successRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

