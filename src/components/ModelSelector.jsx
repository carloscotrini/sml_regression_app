import React from 'react';
import { COLORS, FONTS, MODELS } from '../constants';
import FormulaCard from './shared/FormulaCard';

export default function ModelSelector({ selectedModel, onSelectModel, disabled = false }) {
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
        Choose a Model
      </h3>
      {MODELS.map(model => (
        <FormulaCard
          key={model.id}
          name={model.name}
          formula={model.formula}
          latex={model.latex}
          selected={selectedModel === model.id}
          onClick={() => onSelectModel(model.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
