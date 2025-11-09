'use client';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  analysesRemaining: number;
  createdAt: string;
  updatedAt: string;
}

interface UserRowProps {
  user: User;
  onEdit: () => void;
  onRefresh: () => void;
}

export default function UserRow({ user, onEdit, onRefresh }: UserRowProps) {
  // Прогресс-бар (предполагаем максимум по тарифу)
  const maxAnalyses = {
    'trial': 3,
    'start': 40,
    'optimal': 80,
    'profi': 200
  }[user.plan] || 3;

  const used = maxAnalyses - user.analysesRemaining;
  const percentage = Math.min(100, (used / maxAnalyses) * 100);
  
  const progressColor = 
    percentage > 50 ? '#34C759' : 
    percentage > 20 ? '#FF9500' : 
    '#FF3B30';

  // Статус активности
  const lastActivityDate = new Date(user.updatedAt);
  const daysSinceActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  const isActive = daysSinceActivity < 7;

  // Относительное время
  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    const days = Math.floor(seconds / 86400);
    if (days < 7) return `${days} дн назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед назад`;
    if (days < 365) return `${Math.floor(days / 30)} мес назад`;
    return `${Math.floor(days / 365)} г назад`;
  };

  return (
    <tr style={{ 
      borderBottom: '1px solid #F5F5F7',
      transition: 'background-color 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#F9F9F9';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
    >
      <td style={cellStyle}>{user.email}</td>
      <td style={cellStyle}>{user.name || '—'}</td>
      <td style={cellStyle}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          backgroundColor: getPlanColor(user.plan),
          color: '#1D1D1F'
        }}>
          {getPlanLabel(user.plan)}
        </span>
      </td>
      <td style={cellStyle}>
        <div style={{ minWidth: '150px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
            <span>{user.analysesRemaining}</span>
            <span style={{ color: '#86868B' }}>{Math.round(percentage)}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: '#F5F5F7', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${percentage}%`, 
              height: '100%', 
              backgroundColor: progressColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </td>
      <td style={cellStyle}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: isActive ? '#E8F5E9' : '#FFEBEE',
          color: isActive ? '#2E7D32' : '#C62828'
        }}>
          {isActive ? '● Активен' : '○ Неактивен'}
        </span>
      </td>
      <td style={cellStyle}>
        <span style={{ fontSize: '14px', color: '#86868B' }}>
          {getRelativeTime(lastActivityDate)}
        </span>
      </td>
      <td style={cellStyle}>
        <button
          onClick={onEdit}
          style={{
            padding: '6px 12px',
            border: '1px solid #D2D2D7',
            borderRadius: '6px',
            background: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F5F7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          Редактировать
        </button>
      </td>
    </tr>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '15px',
  color: '#1D1D1F'
};

function getPlanColor(plan: string): string {
  const colors: Record<string, string> = {
    'trial': '#E3F2FD',
    'start': '#F3E5F5',
    'optimal': '#E8F5E9',
    'profi': '#FFF3E0'
  };
  return colors[plan] || '#F5F5F7';
}

function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    'trial': 'Trial',
    'start': 'Start',
    'optimal': 'Optimal',
    'profi': 'Profi'
  };
  return labels[plan] || plan;
}

