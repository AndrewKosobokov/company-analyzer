'use client';

import { useState, useEffect } from 'react';

interface ReportTOCProps {
  items: { id: string; title: string }[];
}

export default function ReportTOC({ items }: ReportTOCProps) {
  const [activeId, setActiveId] = useState<string>('');

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
    <nav className="report-toc-container">
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
  );
}

