import React, { useMemo } from 'react';
import { COLORS, FONTS, MODELS, LOSS_FUNCTIONS, SCENARIOS } from '../constants';
import { computePredictions } from '../mathUtils';
import LossDisplay from './shared/LossDisplay';

export default function ValidationPanel({
  modelId,
  lossId,
  params,
  trainData,
  testData,
  scenarioId,
  onValidate,
  showTestData,
}) {
  const model = MODELS.find(m => m.id === modelId);
  const lossDef = LOSS_FUNCTIONS.find(l => l.id === lossId);
  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const { trainLoss, testLoss, isGoodFit } = useMemo(() => {
    if (!model || !lossDef || !params) {
      return { trainLoss: null, testLoss: null, isGoodFit: false };
    }

    const trainPred = computePredictions(model.fn, params, trainData.map(d => d.x));
    const trnLoss = lossDef.fn(trainData.map(d => d.y), trainPred);

    if (!showTestData) {
      return { trainLoss: trnLoss, testLoss: null, isGoodFit: false };
    }

    const testPred = computePredictions(model.fn, params, testData.map(d => d.x));
    const tstLoss = lossDef.fn(testData.map(d => d.y), testPred);

    // Good fit: test loss is within 3x of train loss and below a threshold
    const good = tstLoss < trnLoss * 3 && tstLoss < 20;

    return { trainLoss: trnLoss, testLoss: tstLoss, isGoodFit: good };
  }, [model, lossDef, params, trainData, testData, showTestData]);

  if (!model || !lossDef) return null;

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
        Validate
      </h3>

      {!showTestData ? (
        <>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              color: COLORS.muted,
              lineHeight: 1.5,
            }}
          >
            Your model is trained. Now let's see how it performs on <strong style={{ color: COLORS.cyan }}>new, unseen data</strong>.
          </p>

          <LossDisplay label="Training Loss" value={trainLoss} small />

          <button
            onClick={onValidate}
            style={{
              padding: '12px 20px',
              background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.green})`,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: FONTS.display,
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.background,
              boxShadow: `0 4px 16px ${COLORS.cyan}40`,
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease',
            }}
          >
            Deploy &amp; Validate
          </button>
        </>
      ) : (
        <>
          {/* Loss comparison */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                flex: 1,
                background: COLORS.dormant,
                borderRadius: 10,
                padding: '8px 4px',
                border: `1px solid ${COLORS.grid}`,
              }}
            >
              <LossDisplay label="Train Loss" value={trainLoss} color={COLORS.amber} small />
            </div>
            <div
              style={{
                flex: 1,
                background: COLORS.dormant,
                borderRadius: 10,
                padding: '8px 4px',
                border: `1px solid ${isGoodFit ? COLORS.green : COLORS.pink}`,
              }}
            >
              <LossDisplay
                label="Test Loss"
                value={testLoss}
                color={isGoodFit ? COLORS.green : COLORS.pink}
                small
              />
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              padding: '14px 16px',
              background: isGoodFit ? `${COLORS.green}15` : `${COLORS.pink}15`,
              border: `1px solid ${isGoodFit ? COLORS.green : COLORS.pink}`,
              borderRadius: 10,
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: 700,
                color: isGoodFit ? COLORS.green : COLORS.pink,
                marginBottom: 6,
              }}
            >
              {isGoodFit ? 'Model generalizes well!' : 'Model struggles on new data'}
            </div>
            <p
              style={{
                fontFamily: FONTS.serif,
                fontStyle: 'italic',
                fontSize: 12,
                color: COLORS.muted,
                lineHeight: 1.5,
              }}
            >
              {isGoodFit ? scenario.storyValidateGood : scenario.storyValidateBad}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
