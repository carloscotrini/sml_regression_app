import React from 'react';
import { COLORS, FONTS, LOSS_FUNCTIONS } from '../constants';
import FormulaCard from './shared/FormulaCard';

export default function LossSelector({ selectedLoss, onSelectLoss, disabled = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        animation: 'slideInRight 0.4s ease-out',
      }}
    >
      <h3
        style={{
          fontFamily: FONTS.display,
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 4,
        }}
      >
        Define the Loss Function
      </h3>
      {LOSS_FUNCTIONS.map(loss => (
        <FormulaCard
          key={loss.id}
          name={loss.name}
          formula={loss.formula}
          latex={loss.latex}
          selected={selectedLoss === loss.id}
          onClick={() => onSelectLoss(loss.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
