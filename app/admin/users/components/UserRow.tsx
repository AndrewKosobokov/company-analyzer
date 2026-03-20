'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  analysesRemaining: number;
  analysesInitial: number;
  createdAt: string;
  updatedAt: string;
}

interface UserRowProps {
  user: User;
  onEdit: () => void;
  onRefresh: () => void;
}

export default function UserRow({ user, onEdit, onRefresh }: UserRowProps) {
  const [analysesCount, setAnalysesCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/admin/users/analyses-count?userId=${user.id}`, {
          credentials: 'include'
        });
        const data = await res.json();
        setAnalysesCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };
    fetchCount();
  }, [user.id]);

  // ПРАВИЛЬНЫЙ РАСЧЕТ ИСПОЛЬЗОВАННЫХ АНАЛИЗОВ И ПРОГРЕССА
  
  // 1. Получаем initial из пользователя
  const initial = user.analysesInitial || 0;
  const remaining = user.analysesRemaining || 0;

  // 2. Защита от "испорченных" данных (если remaining > initial)
  const validRemaining = Math.max(0, Math.min(remaining, initial));

  // 3. Правильный расчет использованных
  const used = initial - validRemaining;

  // 4. Правильный процент использования
  const percentage = initial > 0 ? (used / initial) * 100 : 0;
  
  const progressColor = 
    percentage > 50 ? '#34C759' : 
    percentage > 20 ? '#FF9500' : 
    '#FF3B30';

  // Статус активности
  const lastActivityDate = new Date(user.updatedAt);
  const daysSinceActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  const isActive = daysSinceActivity < 7;

  const confirmLabel = (user.name || '').trim() || user.email;
  const isConfirmValid = deleteConfirmName.trim() === confirmLabel;

  const handleDelete = async () => {
    if (!isConfirmValid) {
      alert('Введено неправильно!');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Пользователь успешно удален');
        setShowDeleteModal(false);
        setDeleteConfirmName('');
        window.location.reload();
      } else {
        alert('Ошибка при удалении пользователя');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

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

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const deleteModal = showDeleteModal && typeof document !== 'undefined' && createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#1c1c1e' : 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
      }}>
        <h3 style={{ marginBottom: '20px', color: isDarkMode ? '#f5f5f7' : '#1D1D1F' }}>Удалить пользователя?</h3>

        <p style={{ marginBottom: '20px', color: '#86868B' }}>
          Это действие необратимо. Для подтверждения введите имя пользователя:
        </p>

        <p style={{
          marginBottom: '10px',
          fontWeight: 'bold',
          padding: '10px',
          backgroundColor: isDarkMode ? '#2c2c2e' : '#F5F5F7',
          color: isDarkMode ? '#f5f5f7' : '#1d1d1f',
          borderRadius: '8px',
        }}>
          {confirmLabel}
        </p>

        <input
          type="text"
          value={deleteConfirmName}
          onChange={(e) => setDeleteConfirmName(e.target.value)}
          placeholder={user.name ? 'Введите имя пользователя' : 'Введите email'}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '15px',
            marginBottom: '20px',
            boxSizing: 'border-box',
            backgroundColor: isDarkMode ? '#161618' : 'white',
            color: isDarkMode ? '#f5f5f7' : '#1D1D1F',
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmName('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: isDarkMode ? '#f5f5f7' : '#1D1D1F',
            }}
          >
            Отмена
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting || !isConfirmValid}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isConfirmValid ? '#FF3B30' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isConfirmValid ? 'pointer' : 'not-allowed',
            }}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
    <tr style={{ 
      borderBottom: '1px solid #F5F5F7',
      transition: 'background-color 0.2s ease'
    }}
    onMouseEnter={(e) => {
      const isDark = document.documentElement.classList.contains('dark');
      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
    >
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">{user.email}</td>
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">{user.name || '—'}</td>
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">
        <span style={{
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          backgroundColor: getPlanColor(user.plan)
        }} className="text-[#1D1D1F] dark:text-[#111111]">
          {getPlanLabel(user.plan)}
        </span>
      </td>
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">
        <div style={{ minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{user.analysesRemaining}</div>
            <div style={{ width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                background: '#34C759', 
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span className="text-[#86868B] dark:text-[#f5f5f7] text-[13px]">{Math.round(percentage)}%</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">
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
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">
        <span className="text-[14px] text-[#86868B] dark:text-[#f5f5f7]">
          {getRelativeTime(lastActivityDate)}
        </span>
      </td>
      <td className="px-4 py-4 text-[#1D1D1F] dark:text-[#f5f5f7] text-[15px]">
        <button
          onClick={onEdit}
          style={{
            padding: '6px 12px',
            border: '1px solid',
            borderColor: isDarkMode ? '#3a3a3c' : '#e5e5e5',
            borderRadius: '6px',
            backgroundColor: isDarkMode ? '#2c2c2e' : '#FFFFFF',
            color: isDarkMode ? '#f5f5f7' : '#1D1D1F',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            const isDark = document.documentElement.classList.contains('dark');
            e.currentTarget.style.backgroundColor = isDark ? '#3a3a3c' : '#F5F5F7';
          }}
          onMouseLeave={(e) => {
            const isDark = document.documentElement.classList.contains('dark');
            e.currentTarget.style.backgroundColor = isDark ? '#2c2c2e' : '#FFFFFF';
          }}
        >
          Редактировать
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            marginLeft: '8px',
            padding: '6px 12px',
            backgroundColor: '#FF3B30',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Удалить
        </button>
      </td>
    </tr>
    {deleteModal}
    </>
  );
}

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

