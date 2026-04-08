import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS } from '../../constants';

export default function LossDisplay({ label, value, color = COLORS.text, small = false }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(true);
      prevValue.current = value;
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  if (value == null) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: small ? '6px 0' : '8px 0',
      }}
    >
      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: small ? 11 : 12,
          fontWeight: 500,
          color: COLORS.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: small ? 20 : 28,
          fontWeight: 700,
          color: flash ? COLORS.amber : color,
          transition: 'color 0.3s ease',
          textShadow: flash ? `0 0 16px ${COLORS.amber}80` : 'none',
        }}
      >
        {typeof value === 'number' ? value.toFixed(4) : value}
      </span>
    </div>
  );
}
