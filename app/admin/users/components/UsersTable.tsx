'use client';
import { useState, useEffect } from 'react';
import { getToken } from '@/app/lib/auth';
import UserRow from './UserRow';
import EditUserModal from './EditUserModal';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  analysesRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch users');
      
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  // Пагинация
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [searchQuery, planFilter]);

  if (loading) {
    return <div>Загрузка пользователей...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: '12px', 
      border: '1px solid #D2D2D7',
      padding: '24px'
    }}>
      {/* Поиск и фильтры */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Поиск по email или имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '12px 16px',
            border: '1px solid #D2D2D7',
            borderRadius: '8px',
            fontSize: '15px'
          }}
        />
        
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #D2D2D7',
            borderRadius: '8px',
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Все тарифы</option>
          <option value="trial">Trial</option>
          <option value="start">Start</option>
          <option value="optimal">Optimal</option>
          <option value="profi">Profi</option>
        </select>
      </div>

      {/* Таблица */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #D2D2D7' }}>
              <th style={headerStyle}>Email</th>
              <th style={headerStyle}>Имя</th>
              <th style={headerStyle}>Тариф</th>
              <th style={headerStyle}>Анализов</th>
              <th style={headerStyle}>Статус</th>
              <th style={headerStyle}>Активность</th>
              <th style={headerStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#86868B', fontSize: '15px' }}>
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <UserRow 
                  key={user.id} 
                  user={user}
                  onEdit={() => setEditingUser(user)}
                  onRefresh={fetchUsers}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px', 
          marginTop: '24px' 
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              ...paginationButtonStyle,
              opacity: page === 1 ? 0.5 : 1,
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Назад
          </button>
          <span style={{ padding: '8px 16px', fontSize: '15px' }}>
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              ...paginationButtonStyle,
              opacity: page === totalPages ? 0.5 : 1,
              cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Вперёд →
          </button>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 600,
  color: '#86868B',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const paginationButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #D2D2D7',
  borderRadius: '8px',
  background: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '15px',
  transition: 'all 0.2s ease'
};

