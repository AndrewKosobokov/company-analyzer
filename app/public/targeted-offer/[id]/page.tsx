'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ReportData {
  id: string;
  companyName: string;
  companyInn: string;
  targetProposal?: string | null;
  createdAt: string;
}

export default function PublicTargetOfferPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/public/report/${params.id}`);
        if (!res.ok) throw new Error('Отчет не найден');
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Загрузка...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Ошибка</h1>
          <p style={{ color: '#6b7280' }}>{error || 'Отчет не найден'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <p className="text-sm text-gray-500 mb-6">Публичная ссылка на целевое предложение</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">Целевое предложение</h1>
        <p className="text-gray-600 mb-8">{report.companyName} • ИНН {report.companyInn}</p>

        {report.targetProposal ? (
          <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap">{report.targetProposal}</div>
        ) : (
          <p className="text-gray-600">Целевое предложение ещё не сгенерировано для этого отчёта.</p>
        )}
      </div>
    </div>
  );
}


