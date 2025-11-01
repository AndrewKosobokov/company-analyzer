'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportTargetProposalToPDF, exportTargetProposalToWord, shareToTelegram, shareToWhatsApp, copyToClipboard } from '@/utils/exportReport';
import ProgressBar from '@/components/ProgressBar';
import { useToast } from '@/components/ui/ToastProvider';
import { getToken } from '@/app/lib/auth';

interface TargetProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  reportText: string;
  companyName: string;
  companyInn: string;
  existingProposal?: string | null;
  onProposalGenerated: (proposal: string) => void;
}

export default function TargetProposalModal({
  isOpen,
  onClose,
  analysisId,
  reportText,
  companyName,
  companyInn,
  existingProposal,
  onProposalGenerated
}: TargetProposalModalProps) {
  const [proposalText, setProposalText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      console.log('🎯 [Modal] Modal opened');
      console.log('🎯 [Modal] Existing proposal:', existingProposal ? `EXISTS (${existingProposal.length} chars)` : 'NULL');
      console.log('🎯 [Modal] Current proposalText:', proposalText ? `EXISTS (${proposalText.length} chars)` : 'EMPTY');
      
      // If we have an existing proposal, use it immediately
      if (existingProposal) {
        console.log('✅ [Modal] Using cached proposal - NO API CALL');
        setProposalText(existingProposal);
        setLoading(false);
        setProgress(100);
      } else if (!proposalText) {
        // Only generate if we don't have existing or current proposal
        console.log('⚡ [Modal] No cache found, calling API to generate...');
        generateProposal();
      } else {
        console.log('📌 [Modal] Using existing proposalText state');
      }
    }
  }, [isOpen, existingProposal]);

  const generateProposal = async () => {
    console.log('🔄 [Modal] generateProposal() called');
    console.log('🔄 [Modal] Analysis ID:', analysisId);
    
    setLoading(true);
    setError('');
    setProgress(0);
    setProgressMessage('Генерация целевого предложения...');

    // Simulate progress with realistic stages
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Stop at 95%, complete at 100% when done
        }
        // Faster progress since proposal takes ~15 seconds vs 30-40 for analysis
        const increment = prev < 60 ? 5 : prev < 85 ? 3 : 2;
        return prev + increment;
      });
    }, 600); // Update every 600ms (faster than main analysis)
    
    // Update message halfway through
    setTimeout(() => setProgressMessage('Финализация...'), 8000);

    try {
      console.log('🔄 [Modal] Calling API...');
      const response = await fetch('/api/analysis/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          analysisId,
          reportText,
          companyName,
          companyInn
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось сгенерировать предложение');
      }

      const data = await response.json();
      console.log('✅ [Modal] API response received, proposal length:', data.proposalText?.length);
      
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Готово!');
      
      setProposalText(data.proposalText);
      
      // Notify parent component that proposal was generated
      console.log('✅ [Modal] Notifying parent component...');
      onProposalGenerated(data.proposalText);
      
    } catch (err: any) {
      console.error('❌ [Modal] Error generating proposal:', err);
      clearInterval(progressInterval);
      setError(err.message || 'Ошибка генерации предложения');
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleCopy = async () => {
    const fullText = `ЦЕЛЕВОЕ ПРЕДЛОЖЕНИЕ\n\n${companyName}\nИНН: ${companyInn}\n\n${proposalText}`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      showToast('Ошибка копирования', { variant: 'error' });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportTargetProposalToPDF(
        companyName,
        companyInn,
        proposalText
      );
    } catch (error) {
      showToast('Ошибка экспорта в PDF', { variant: 'error' });
    }
  };

  const handleExportWord = async () => {
    try {
      await exportTargetProposalToWord(
        companyName,
        companyInn,
        proposalText
      );
    } catch (error) {
      showToast('Ошибка экспорта в Word', { variant: 'error' });
    }
  };

  const handleShareTelegram = () => {
    const shareUrl = `${window.location.origin}/public/targeted-offer/${analysisId}`;
    shareToTelegram(
      `Целевое предложение - ${companyName}`,
      companyInn,
      proposalText,
      shareUrl
    );
  };

  const handleShareWhatsApp = () => {
    const shareUrl = `${window.location.origin}/public/targeted-offer/${analysisId}`;
    shareToWhatsApp(
      `Целевое предложение - ${companyName}`,
      companyInn,
      proposalText,
      shareUrl
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 overflow-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-[fadeZoomIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-black/10 relative">
          <div className={`flex items-start justify-between ${proposalText && !loading ? 'mb-6' : ''}`}>
            <div>
              <h1 className="text-2xl font-semibold text-black mb-2 tracking-tight">Целевое предложение</h1>
              <p className="text-[17px] text-[#1d1d1f] m-0">{companyName}</p>
              <p className="text-[15px] text-[#86868b] mt-1">ИНН: {companyInn}</p>
            </div>
            <button onClick={onClose} aria-label="Закрыть" className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Export Buttons - Same as main report */}
          {proposalText && !loading && (
            <div className="flex gap-3 flex-wrap items-center">
              <button 
                onClick={handleExportPDF}
                className="button-secondary flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-24.2 31.6-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z"/>
                </svg>
                PDF
              </button>
              
              <button 
                onClick={handleExportWord}
                className="button-secondary flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm220.1-208c-5.7 0-10.6 4-11.7 9.5-20.6 97.7-20.4 95.4-21 103.5-.2-1.2-.4-2.6-.7-4.3-.8-5.1.3.2-23.6-99.5-1.3-5.4-6.1-9.2-11.7-9.2h-13.3c-5.5 0-10.3 3.8-11.7 9.1-24.4 99-24 96.2-24.8 103.7-.1-1.1-.2-2.5-.5-4.2-.7-5.2-14.1-73.3-19.1-99-1.1-5.6-6-9.7-11.8-9.7h-16.8c-7.8 0-13.5 7.3-11.7 14.8 8 32.6 26.7 109.5 33.2 136 1.3 5.4 6.1 9.1 11.7 9.1h25.2c5.5 0 10.3-3.7 11.6-9.1l17.9-71.4c1.5-6.2 2.5-12 3-17.3l2.9 17.3c.1.4 12.6 50.5 17.9 71.4 1.3 5.3 6.1 9.1 11.6 9.1h24.7c5.5 0 10.3-3.7 11.6-9.1 20.8-81.9 30.2-119 34.5-136 1.9-7.6-3.8-14.9-11.6-14.9h-15.8z"/>
                </svg>
                Word
              </button>

              <button 
                onClick={handleCopy}
                className="button-secondary flex items-center gap-2"
                title="Копировать текст"
              >
                {copySuccess ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Скопировано!
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Копировать
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-black/10" />

              {/* Telegram Button */}
              <button
                onClick={handleShareTelegram}
                className="button-secondary px-4 py-2"
                title="Отправить в Telegram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.99 1.27-5.62 3.72-.53.37-.89.55-1.09.54-.36-.01-1.05-.2-1.56-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </button>

              {/* WhatsApp Button */}
              <button
                onClick={handleShareWhatsApp}
                className="button-secondary px-4 py-2"
                title="Отправить в WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-10 py-8 overflow-y-auto flex-1">
          {/* Loading State */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px'
            }}>
              <ProgressBar 
                progress={progress} 
                message={progressMessage}
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] text-[15px] px-5 py-4">
              {error}
            </div>
          )}

          {/* Proposal Text - Markdown formatted */}
          {proposalText && !loading && (
            <div 
              className="markdown-content"
              style={{
              fontSize: '17px',
                lineHeight: '1.8',
                  color: 'var(--text-primary)'
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Main headings (##)
                  h2: ({node, ...props}) => (
                <h2 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      marginTop: '32px',
                  marginBottom: '20px',
                      color: 'var(--text-primary)',
                  paddingBottom: '12px',
                      borderBottom: '2px solid var(--border-color)'
                    }} {...props} />
                  ),
                  
                  // Subsections (###)
                  h3: ({node, ...props}) => (
                  <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      marginTop: '24px',
                      marginBottom: '16px',
                    color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Bold (**text**)
                  strong: ({node, ...props}) => (
                    <strong style={{
                      fontWeight: '700',
                    color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Italic (*text*)
                  em: ({node, ...props}) => (
                    <em style={{
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)'
                    }} {...props} />
                  ),
                  
                  // Paragraphs
                  p: ({node, ...props}) => (
                  <p style={{
                      marginTop: '16px',
                      marginBottom: '16px',
                      lineHeight: '1.7',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Unordered lists
                  ul: ({node, ...props}) => (
                    <ul style={{
                      listStyleType: 'disc',
                      paddingLeft: '32px',
                      marginTop: '16px',
                      marginBottom: '16px'
                    }} {...props} />
                  ),
                  
                  // Ordered lists
                  ol: ({node, ...props}) => (
                    <ol style={{
                      listStyleType: 'decimal',
                      paddingLeft: '32px',
                      marginTop: '16px',
                      marginBottom: '16px'
                    }} {...props} />
                  ),
                  
                  // List items
                  li: ({node, ...props}) => (
                    <li style={{
                      marginBottom: '8px',
                    lineHeight: '1.6',
                      color: 'var(--text-primary)'
                    }} {...props} />
                  ),
                  
                  // Dividers
                  hr: ({node, ...props}) => (
                    <hr style={{
                      border: 'none',
                      borderTop: '2px solid var(--border-color)',
                      marginTop: '32px',
                      marginBottom: '32px'
                    }} {...props} />
                  ),
                }}
              >
                {proposalText}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeZoomIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}


