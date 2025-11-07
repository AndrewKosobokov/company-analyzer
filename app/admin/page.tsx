'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';
import { getToken } from '@/app/lib/auth';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  planDistribution: Array<{ plan: string; _count: number }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  analysesRemaining: number;
  createdAt: string;
  _count: { analyses: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetEmail, setDeleteTargetEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.status === 403) {
        setError('Доступ запрещён');
        return;
      }

      if (statsRes.status === 401) {
        router.push('/login');
        return;
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData.users);

      // Fetch current admin email for self-delete prevention
      try {
        const meRes = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentEmail(me.email || '');
        }
      } catch {}

    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async (userId: string) => {
    const token = getToken();
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, analysesRemaining: newLimit })
      });

      setEditingUser(null);
      setNewLimit('');
      fetchStats(); // Refresh data
    } catch (error) {
      showToast('Ошибка обновления', { variant: 'error' });
    }
  };

  const openDeleteModal = (email: string) => {
    setDeleteTargetEmail(email);
    setConfirmEmail('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetEmail('');
    setConfirmEmail('');
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (confirmEmail !== deleteTargetEmail) {
      setDeleteError('Email не совпадает');
      return;
    }
    const token = getToken();
    try {
      setDeleting(true);
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: deleteTargetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Не удалось удалить пользователя');
        setDeleting(false);
        return;
      }
      setSuccessMessage('Пользователь успешно удалён');
      closeDeleteModal();
      await fetchStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      setDeleteError('Ошибка сети');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard - Test Version</h1>
      <p>If you see this, the file compiles successfully.</p>
    </div>
  );
}
