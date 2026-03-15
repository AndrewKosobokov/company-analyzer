'use client';

import React from 'react';

interface ExportButtonsProps {
  reportId: string;
  reportTitle?: string;
  onClose?: () => void;
}

export default function ExportButtons({ reportId, reportTitle, onClose }: ExportButtonsProps) {
  const handlePrint = () => {
    const printWindow = window.open(`/report/${reportId}`, '_blank');

    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
    }
    onClose?.();
  };

  const handlePDFExport = () => {
    window.open(`/api/export/pdf?id=${reportId}`, '_blank');
    onClose?.();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/report/${reportId}`;

    navigator.clipboard.writeText(link).then(() => {
      alert('Ссылка скопирована в буфер обмена!');
    }).catch(err => {
      console.error('Ошибка при копировании:', err);
    });
    onClose?.();
  };

  const btnStyle = {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    transition: 'all 0.2s'
  } as const;

  return (
    <>
      <button
        onClick={handlePrint}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
          <path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
        Печать
      </button>

      <button
        onClick={handlePDFExport}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor">
          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
        </svg>
        PDF
      </button>

      <button
        onClick={handleCopyLink}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        Копировать ссылку
      </button>
    </>
  );
}
