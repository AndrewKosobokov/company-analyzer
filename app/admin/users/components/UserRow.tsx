'use client';
import { useState } from 'react';
import { getToken } from '@/app/lib/auth';

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
  const [impersonating, setImpersonating] = useState(false);

  // Прогресс-бар (предполагаем максимум по тарифу)
  const maxAnalyses = {
    'trial': 3,
    'start': 10,
    'optimal': 50,
    'profi': 9999
  }[user.plan] || 10;

  const percentage = Math.min(100, (user.analysesRemaining / maxAnalyses) * 100);
  
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

  // Имперсонализация
  const handleImpersonate = async () => {
    if (!confirm(`Войти в аккаунт ${user.email}?`)) return;
    
    setImpersonating(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/users/${user.id}/impersonate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Ошибка входа' }));
        throw new Error(errorData.error || 'Impersonation failed');
      }
      
      const data = await res.json();
      
      // Сохраняем новый токен
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('impersonating', 'true');
        localStorage.setItem('admin_return_token', token || '');
      }
      
      // Перезагружаем страницу
      window.location.href = '/';
    } catch (error: any) {
      console.error('Impersonation error:', error);
      alert(error.message || 'Ошибка входа в аккаунт пользователя');
    } finally {
      setImpersonating(false);
    }
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
        <div style={{ display: 'flex', gap: '8px' }}>
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
          <button
            onClick={handleImpersonate}
            disabled={impersonating}
            style={{
              padding: '6px 12px',
              border: '1px solid #FF9500',
              borderRadius: '6px',
              background: '#FFF8E1',
              color: '#FF9500',
              cursor: impersonating ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              opacity: impersonating ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!impersonating) {
                e.currentTarget.style.backgroundColor = '#FFE082';
              }
            }}
            onMouseLeave={(e) => {
              if (!impersonating) {
                e.currentTarget.style.backgroundColor = '#FFF8E1';
              }
            }}
          >
            {impersonating ? '...' : '🎭 Войти'}
          </button>
        </div>
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

