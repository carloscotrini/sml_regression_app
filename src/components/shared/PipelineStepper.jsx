import React from 'react';
import { COLORS, FONTS } from '../../constants';

const STEPS = [
  { id: 'observe', label: 'Observe Data', num: 1 },
  { id: 'model', label: 'Choose Model', num: 2 },
  { id: 'loss', label: 'Define Loss', num: 3 },
  { id: 'params', label: 'Set Parameters', num: 4 },
  { id: 'validate', label: 'Validate', num: 5 },
];

export default function PipelineStepper({ currentStep, completedSteps, onStepClick }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '8px 0' }}>
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isAccessible = i <= currentIndex || isCompleted;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.id}>
            <button
              onClick={() => isAccessible && onStepClick(step.id)}
              disabled={!isAccessible}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                width: '100%',
                background: isCurrent ? `${COLORS.primary}15` : 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: isAccessible ? 'pointer' : 'default',
                opacity: isAccessible ? 1 : 0.35,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontFamily: FONTS.mono,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isCompleted
                    ? COLORS.green
                    : isCurrent
                      ? COLORS.primary
                      : COLORS.grid,
                  color: isCompleted || isCurrent ? COLORS.background : COLORS.muted,
                  boxShadow: isCurrent ? `0 0 12px ${COLORS.primary}60` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted ? '\u2713' : step.num}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 13,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? COLORS.text : COLORS.muted,
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                }}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  width: 2,
                  height: 12,
                  marginLeft: 27,
                  background: i < currentIndex ? COLORS.green : COLORS.grid,
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
