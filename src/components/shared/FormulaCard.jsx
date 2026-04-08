import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { COLORS, FONTS } from '../../constants';

export default function FormulaCard({ name, formula, latex, selected, onClick, disabled = false }) {
  const mathRef = useRef(null);

  useEffect(() => {
    if (mathRef.current && latex) {
      katex.render(latex, mathRef.current, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
      });
    }
  }, [latex]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '12px 16px',
        background: selected ? `${COLORS.primary}18` : COLORS.surface,
        border: `2px solid ${selected ? COLORS.amber : COLORS.grid}`,
        borderRadius: 12,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.25s ease',
        width: '100%',
        boxShadow: selected ? `0 0 16px ${COLORS.amber}30` : 'none',
      }}
    >
      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: 13,
          fontWeight: 700,
          color: selected ? COLORS.text : COLORS.muted,
        }}
      >
        {name}
      </span>
      {latex ? (
        <span
          ref={mathRef}
          style={{
            fontSize: 14,
            color: selected ? COLORS.amber : COLORS.muted,
            opacity: 0.9,
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: selected ? COLORS.amber : COLORS.muted,
            opacity: 0.9,
          }}
        >
          {formula}
        </span>
      )}
    </button>
  );
}
