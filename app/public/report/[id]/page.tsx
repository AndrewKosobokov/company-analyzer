'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportData {
  id: string;
  companyName: string;
  companyInn: string;
  reportText: string;
  targetProposal?: string | null;
  createdAt: string;
}

// Extract company info from report text
function extractCompanyInfo(reportText: string): { companyName: string | null; inn: string | null } {
  // Extract company name from "**Компания:** Full Name"
  const companyMatch = reportText.match(/\*\*Компания:\*\*\s*(.+?)(?=\n|\*\*|$)/);
  let companyName = companyMatch ? companyMatch[1].replace(/\*\*/g, '').trim() : null;
  
  // Clean up markdown symbols
  if (companyName) {
    companyName = companyName.replace(/[\*_]/g, '').trim();
  }
  
  // Extract INN from "**ИНН:** 1234567890"
  const innMatch = reportText.match(/\*\*ИНН:\*\*\s*(\d+)/);
  const inn = innMatch ? innMatch[1] : null;
  
  return { companyName, inn };
}

export default function PublicReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/public/report/${params.id}`);
        
        if (!response.ok) throw new Error('Отчет не найден');
        
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить отчет');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [params.id]);
  
  // Loading State
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        <p style={{ fontSize: '17px', color: '#6c757d' }}>
          Загрузка отчета...
        </p>
      </div>
    );
  }
  
  // Error State
  if (error || !report) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8f9fa',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#dc3545' }}>
            Ошибка
          </h1>
          <p style={{ 
            color: '#6c757d', 
            marginBottom: '24px',
            fontSize: '17px'
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }
  
  // Success State - Show Report
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          {(() => {
            const { companyName, inn } = extractCompanyInfo(report.reportText);
            const displayName = companyName || report.companyName;
            const displayInn = inn || report.companyInn;
            
            return (
              <>
                <h1 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '8px', color: '#212529' }}>
                  {displayName}
                </h1>
                <p style={{ fontSize: '17px', color: '#6c757d' }}>
                  ИНН: {displayInn} • {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </>
            );
          })()}
        </div>

        {/* Divider */}
        <div style={{ 
          borderTop: '1px solid #dee2e6', 
          margin: '32px 0' 
        }} />

        {/* Report Text */}
        <div 
          className="markdown-content"
          style={{
            lineHeight: '1.8',
            fontSize: '17px',
            color: '#495057'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Main sections (## with emojis)
              h2: ({node, ...props}) => (
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginTop: '40px',
                  marginBottom: '20px',
                  color: '#212529',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #dee2e6'
                }} {...props} />
              ),
              
              // Subsections (###)
              h3: ({node, ...props}) => (
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  marginTop: '28px',
                  marginBottom: '16px',
                  color: '#212529'
                }} {...props} />
              ),
              
              // Bold (**text**)
              strong: ({node, ...props}) => (
                <strong style={{
                  fontWeight: '700',
                  color: '#212529'
                }} {...props} />
              ),
              
              // Italic (*text*)
              em: ({node, ...props}) => (
                <em style={{
                  fontStyle: 'italic',
                  color: '#6c757d'
                }} {...props} />
              ),
              
              // Paragraphs
              p: ({node, ...props}) => (
                <p style={{
                  marginTop: '16px',
                  marginBottom: '16px',
                  lineHeight: '1.7',
                  color: '#495057'
                }} {...props} />
              ),
              
              // Lists
              ul: ({node, ...props}) => (
                <ul style={{
                  listStyleType: 'disc',
                  paddingLeft: '32px',
                  marginTop: '16px',
                  marginBottom: '16px'
                }} {...props} />
              ),
              
              ol: ({node, ...props}) => (
                <ol style={{
                  listStyleType: 'decimal',
                  paddingLeft: '32px',
                  marginTop: '16px',
                  marginBottom: '16px'
                }} {...props} />
              ),
              
              li: ({node, ...props}) => (
                <li style={{
                  marginBottom: '8px',
                  lineHeight: '1.6',
                  color: '#495057'
                }} {...props} />
              ),
              
              // Tables
              table: ({node, ...props}) => (
                <div style={{ overflowX: 'auto', marginTop: '24px', marginBottom: '24px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #dee2e6'
                  }} {...props} />
                </div>
              ),
              
              th: ({node, ...props}) => (
                <th style={{
                  border: '1px solid #dee2e6',
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  fontWeight: '700',
                  textAlign: 'left',
                  color: '#212529'
                }} {...props} />
              ),
              
              td: ({node, ...props}) => (
                <td style={{
                  border: '1px solid #dee2e6',
                  padding: '12px 16px',
                  color: '#495057'
                }} {...props} />
              ),
              
              // Dividers
              hr: ({node, ...props}) => (
                <hr style={{
                  border: 'none',
                  borderTop: '2px solid #dee2e6',
                  marginTop: '32px',
                  marginBottom: '32px'
                }} {...props} />
              ),
            }}
          >
            {report.reportText}
          </ReactMarkdown>
        </div>

        {/* Target Proposal Section */}
        {report.targetProposal && (
          <>
            <div style={{ 
              borderTop: '1px solid #dee2e6', 
              margin: '48px 0 32px 0' 
            }} />
            
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              marginTop: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#212529'
              }}>
                Целевое предложение
              </h2>
              <div style={{
                lineHeight: '1.7',
                fontSize: '16px',
                color: '#495057',
                whiteSpace: 'pre-wrap'
              }}>
                {report.targetProposal}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

