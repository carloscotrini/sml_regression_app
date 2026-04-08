import React, { useState, useRef, useCallback, useEffect } from 'react';
import { COLORS, FONTS, MODELS, LOSS_FUNCTIONS, ANIMATION } from '../constants';
import {
  computePredictions,
  computeGradient,
  gradientDescentStep,
  clampParams,
  getAdaptiveLearningRate,
} from '../mathUtils';
import LossDisplay from './shared/LossDisplay';

export default function ParameterSliders({
  modelId,
  lossId,
  params,
  onParamsChange,
  trainData,
  scenarioId,
}) {
  const [optimizing, setOptimizing] = useState(false);
  const animRef = useRef(null);
  const stepRef = useRef(0);

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

  // Optimization animation
  const optimize = useCallback(() => {
    if (optimizing) return;
    setOptimizing(true);
    stepRef.current = 0;

    const lr = getAdaptiveLearningRate(scenarioId, modelId);
    let currentParams = { ...params };

    const step = () => {
      if (stepRef.current >= ANIMATION.optimizationSteps) {
        setOptimizing(false);
        return;
      }

      const gradient = computeGradient(
        model.fn,
        lossDef.fn,
        currentParams,
        model.params,
        xValues,
        yValues
      );

      currentParams = gradientDescentStep(currentParams, gradient, lr);
      currentParams = clampParams(currentParams, model.params);
      onParamsChange(currentParams);

      stepRef.current++;
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
  }, [optimizing, params, model, lossDef, xValues, yValues, scenarioId, modelId, onParamsChange]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

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
            disabled={optimizing}
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

      {/* Optimize button */}
      <button
        onClick={optimize}
        disabled={optimizing}
        style={{
          padding: '12px 20px',
          background: optimizing
            ? COLORS.grid
            : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.cyan})`,
          border: 'none',
          borderRadius: 10,
          cursor: optimizing ? 'wait' : 'pointer',
          fontFamily: FONTS.display,
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.background,
          transition: 'all 0.3s ease',
          boxShadow: optimizing ? 'none' : `0 4px 16px ${COLORS.primary}40`,
          letterSpacing: '0.02em',
        }}
      >
        {optimizing ? 'Optimizing...' : 'Auto-Optimize (Gradient Descent)'}
      </button>

      {optimizing && (
        <div
          style={{
            height: 4,
            background: COLORS.grid,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.cyan})`,
              width: `${(stepRef.current / ANIMATION.optimizationSteps) * 100}%`,
              transition: 'width 50ms linear',
              borderRadius: 2,
            }}
          />
        </div>
      )}
    </div>
  );
}
