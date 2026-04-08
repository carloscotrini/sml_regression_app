import React, { useCallback } from 'react';
import { COLORS, FONTS, MODELS, LOSS_FUNCTIONS } from '../constants';
import { computePredictions } from '../mathUtils';
import LossDisplay from './shared/LossDisplay';

export default function ParameterSliders({
  modelId,
  lossId,
  params,
  onParamsChange,
  trainData,
}) {
  const model = MODELS.find(m => m.id === modelId);
  const lossDef = LOSS_FUNCTIONS.find(l => l.id === lossId);
  if (!model || !lossDef) return null;

  const xValues = trainData.map(d => d.x);
  const yValues = trainData.map(d => d.y);

  // Compute current loss
  const predictions = computePredictions(model.fn, params, xValues);
  const currentLoss = lossDef.fn(yValues, predictions);

  const handleSliderChange = useCallback((paramName, value) => {
    onParamsChange({ ...params, [paramName]: parseFloat(value) });
  }, [params, onParamsChange]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animation: 'slideInRight 0.4s ease-out',
      }}
    >
      <h3
        style={{
          fontFamily: FONTS.display,
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 2,
        }}
      >
        Set Parameters
      </h3>

      {/* Parameter sliders */}
      {model.params.map(pDef => (
        <div key={pDef.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                fontWeight: 500,
                color: COLORS.muted,
              }}
            >
              {pDef.label}
            </label>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.primary,
                minWidth: 60,
                textAlign: 'right',
              }}
            >
              {params[pDef.name]?.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={pDef.min}
            max={pDef.max}
            step={pDef.step}
            value={params[pDef.name] ?? pDef.default}
            onChange={(e) => handleSliderChange(pDef.name, e.target.value)}
            aria-label={pDef.label}
            aria-valuemin={pDef.min}
            aria-valuemax={pDef.max}
            aria-valuenow={params[pDef.name]}
          />
        </div>
      ))}

      {/* Loss display */}
      <LossDisplay
        label="Training Loss"
        value={currentLoss}
        color={currentLoss < 5 ? COLORS.green : COLORS.text}
      />
    </div>
  );
}
