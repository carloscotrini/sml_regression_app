import React from 'react';
import { COLORS, FONTS, SCENARIOS } from '../constants';

export default function ScenarioHeader({ activeScenario, onScenarioChange }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.grid}`,
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 18,
            color: COLORS.text,
            letterSpacing: '-0.02em',
          }}
        >
          ML Regression Explorer
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.muted,
            background: COLORS.background,
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          SML
        </span>
      </div>

      {/* Scenario tabs */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {SCENARIOS.map((scenario, i) => {
          const isActive = scenario.id === activeScenario;
          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: isActive ? `${COLORS.primary}20` : 'transparent',
                border: `1px solid ${isActive ? COLORS.primary : 'transparent'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>{scenario.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? COLORS.text : COLORS.muted,
                  }}
                >
                  {scenario.name}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: COLORS.muted,
                    opacity: 0.7,
                  }}
                >
                  {i + 1}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
