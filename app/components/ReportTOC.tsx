'use client';

import { useState, useEffect } from 'react';

interface ReportTOCProps {
  items: { id: string; title: string }[];
}

export default function ReportTOC({ items }: ReportTOCProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // STEP 4: Verify IDs are assigned in DOM
    console.log('\n━━━ TOC INITIALIZATION ━━━');
    console.log('[TOC] Expected IDs:', items.map(i => i.id));
    
    // Check which IDs actually exist in DOM
    const foundIds: string[] = [];
    const missingIds: string[] = [];
    
    items.forEach(({ id, title }) => {
      const element = document.getElementById(id);
      if (element) {
        foundIds.push(id);
        console.log(`✅ FOUND: ${id} - "${element.textContent?.substring(0, 50)}"`);
      } else {
        missingIds.push(id);
        console.error(`❌ MISSING: ${id} (${title})`);
      }
    });
    
    console.log('\n[TOC] Summary:', {
      total: items.length,
      found: foundIds.length,
      missing: missingIds.length
    });
    
    if (missingIds.length > 0) {
      console.error('[TOC] Missing IDs:', missingIds);
      console.log('\n[TOC] All h2 elements in page:');
      document.querySelectorAll('h2').forEach((h2, index) => {
        console.log(`  ${index + 1}. ID: "${h2.id || 'NO ID'}" | Text: "${h2.textContent?.substring(0, 50)}"`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Set up Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -66%',
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          console.log(`[TOC] Active section changed to: ${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all section headers that were found
    foundIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const scrollToId = (id: string) => {
    // STEP 5: Test scroll functionality
    console.log(`\n[TOC] Scroll requested for ID: "${id}"`);
    
    const element = document.getElementById(id);
    
    if (element) {
      console.log(`[TOC] ✅ Element found:`, {
        id: element.id,
        tagName: element.tagName,
        text: element.textContent?.substring(0, 50),
        offsetTop: element.offsetTop
      });
      
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Закрываем drawer на мобильных после клика
      setIsOpen(false);
      
      console.log('[TOC] Scroll initiated\n');
    } else {
      console.error(`[TOC] ❌ Element NOT found for ID: "${id}"`);
      console.log('[TOC] Available IDs:', 
        Array.from(document.querySelectorAll('[id]')).map(el => el.id)
      );
      console.log('[TOC] All h2 elements:', 
        Array.from(document.querySelectorAll('h2')).map(h2 => ({
          id: h2.id || 'NO ID',
          text: h2.textContent?.substring(0, 50)
        }))
      );
      console.log('');
    }
  };

  return (
    <>
      {/* Кнопка "Показать содержание" внизу экрана (только на мобильных) */}
      <button
        onClick={() => setIsOpen(true)}
        className="toc-mobile-toggle"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 998,
          background: '#1D1D1F',
          color: '#FFF',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '44px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        Показать содержание
      </button>

      {/* Overlay для мобильных */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="toc-overlay"
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Desktop TOC (как было) */}
      <nav className="report-toc-container report-toc-desktop">
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Содержание
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(({ id, title }) => (
            <li key={id}>
              <button
                onClick={() => scrollToId(id)}
                className={`toc-link ${activeId === id ? 'active' : ''}`}
                type="button"
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Drawer TOC */}
      <nav
        className="report-toc-container report-toc-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: '#FFFFFF',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          padding: '80px 24px 24px',
          overflowY: 'auto',
          display: 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0
          }}>
            Содержание
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#1D1D1F',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px'
            }}
          >
            ×
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(({ id, title }) => (
            <li key={id}>
              <button
                onClick={() => scrollToId(id)}
                className={`toc-link ${activeId === id ? 'active' : ''}`}
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  minHeight: '44px'
                }}
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .toc-mobile-toggle {
            display: block !important;
          }
          
          .toc-overlay {
            display: block !important;
          }
          
          .report-toc-mobile {
            display: block !important;
          }
          
          .report-toc-desktop {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .toc-mobile-toggle {
            display: none !important;
          }
          
          .toc-overlay {
            display: none !important;
          }
          
          .report-toc-mobile {
            display: none !important;
          }
          
          .report-toc-desktop {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

