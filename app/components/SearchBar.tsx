'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  resultsCount?: number;
  totalCount?: number;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Поиск...',
  autoFocus = false,
  resultsCount,
  totalCount
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto 32px'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Search Icon */}
        <div style={{
          position: 'absolute',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          color: isFocused ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'color var(--transition-fast)',
          zIndex: 1
        }}>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            padding: '14px 48px 14px 48px',
            fontSize: '17px',
            fontWeight: '400',
            letterSpacing: '-0.011em',
            border: `2px solid ${isFocused ? 'var(--text-primary)' : 'var(--border-color, #d2d2d7)'}`,
            borderRadius: 'var(--radius-lg, 20px)',
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'all var(--transition-fast, 0.15s ease)',
            boxShadow: isFocused 
              ? '0 0 0 4px rgba(29, 29, 31, 0.08)' 
              : '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
          }}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'var(--text-secondary)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0,
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-primary)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Очистить поиск"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Results Counter */}
      {value && resultsCount !== undefined && totalCount !== undefined && (
        <div style={{
          marginTop: '12px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          Найдено: {resultsCount} из {totalCount}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}





































