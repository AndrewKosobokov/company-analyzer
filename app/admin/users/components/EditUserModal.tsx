'use client';
import { useState } from 'react';
import { getToken } from '@/app/lib/auth';

interface EditUserModalProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    analysesRemaining: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [plan, setPlan] = useState(user.plan);
  const [analysesMode, setAnalysesMode] = useState<'set' | 'add' | 'subtract'>('set');
  const [analysesValue, setAnalysesValue] = useState(user.analysesRemaining.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }
      
      // 1. Изменяем тариф (если изменился)
      if (plan !== user.plan) {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'SET_PLAN',
            value: plan
          })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Ошибка изменения тарифа');
        }
      }
      
      // 2. Изменяем анализы
      const numValue = parseInt(analysesValue);
      if (isNaN(numValue) || numValue < 0) {
        throw new Error('Некорректное число анализов');
      }
      
      let action = '';
      if (analysesMode === 'set') action = 'SET_REPORTS';
      else if (analysesMode === 'add') action = 'ADD_REPORTS';
      else if (analysesMode === 'subtract') action = 'SUBTRACT_REPORTS';
      
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          value: numValue
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка изменения анализов');
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>
            Редактирование пользователя
          </h2>

          {/* Email (readonly) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#86868B' }}>
              Email
            </label>
            <input
              type="text"
              value={user.email}
              readOnly
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D2D2D7',
                borderRadius: '8px',
                fontSize: '15px',
                backgroundColor: '#F5F5F7',
                color: '#86868B'
              }}
            />
          </div>

          {/* Тариф */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#1D1D1F' }}>
              Тариф
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D2D2D7',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              <option value="trial">Trial</option>
              <option value="start">Start</option>
              <option value="optimal">Optimal</option>
              <option value="profi">Profi</option>
            </select>
          </div>

          {/* Анализы */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#1D1D1F' }}>
              Анализы
            </label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => setAnalysesMode('set')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: analysesMode === 'set' ? '2px solid #1D1D1F' : '1px solid #E5E5E7',
                  borderRadius: '8px',
                  background: analysesMode === 'set' ? '#1D1D1F' : '#FFFFFF',
                  color: analysesMode === 'set' ? '#FFFFFF' : '#1D1D1F',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Установить
              </button>
              <button
                onClick={() => setAnalysesMode('add')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: analysesMode === 'add' ? '2px solid #1D1D1F' : '1px solid #E5E5E7',
                  borderRadius: '8px',
                  background: analysesMode === 'add' ? '#1D1D1F' : '#FFFFFF',
                  color: analysesMode === 'add' ? '#FFFFFF' : '#1D1D1F',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Добавить
              </button>
              <button
                onClick={() => setAnalysesMode('subtract')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: analysesMode === 'subtract' ? '2px solid #1D1D1F' : '1px solid #E5E5E7',
                  borderRadius: '8px',
                  background: analysesMode === 'subtract' ? '#1D1D1F' : '#FFFFFF',
                  color: analysesMode === 'subtract' ? '#FFFFFF' : '#1D1D1F',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Вычесть
              </button>
            </div>

            <input
              type="number"
              value={analysesValue}
              onChange={(e) => setAnalysesValue(e.target.value)}
              placeholder="Введите число"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D2D2D7',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            />
            
            <div style={{ fontSize: '13px', color: '#86868B', marginTop: '4px' }}>
              Текущее значение: {user.analysesRemaining}
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: '1px solid #D2D2D7',
                borderRadius: '8px',
                background: '#FFFFFF',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 500,
                opacity: saving ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: saving ? '#86868B' : '#1D1D1F',
                color: '#FFFFFF',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#2D2D2F';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#1D1D1F';
                }
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

