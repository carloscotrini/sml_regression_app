import React from 'react';
import { COLORS, FONTS } from '../../constants';

export default function NarrativeBar({ text }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.grid}`,
        padding: '16px 32px',
        minHeight: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        key={text}
        style={{
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.6,
          color: COLORS.muted,
          maxWidth: 800,
          textAlign: 'center',
          animation: 'fadeInUp 0.4s ease-out',
        }}
        aria-live="polite"
      >
        {text}
      </p>
    </div>
  );
}
