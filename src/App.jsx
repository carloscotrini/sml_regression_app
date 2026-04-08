import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { COLORS, FONTS, SCENARIOS, MODELS, LOSS_FUNCTIONS } from './constants';
import { generateAllDatasets } from './mathUtils';
import ScenarioHeader from './components/ScenarioHeader';
import ScatterPlot from './components/ScatterPlot';
import PipelineStepper from './components/shared/PipelineStepper';
import NarrativeBar from './components/shared/NarrativeBar';
import ModelSelector from './components/ModelSelector';
import LossSelector from './components/LossSelector';
import ParameterSliders from './components/ParameterSliders';
import ValidationPanel from './components/ValidationPanel';

// Generate all datasets once
const ALL_DATASETS = generateAllDatasets();

// Pipeline step order
const STEP_ORDER = ['observe', 'model', 'loss', 'params', 'validate'];

function getDefaultParams(modelId) {
  const model = MODELS.find(m => m.id === modelId);
  if (!model) return {};
  const params = {};
  for (const p of model.params) {
    params[p.name] = p.default;
  }
  return params;
}

export default function App() {
  const [scenario, setScenario] = useState('linear');
  const [currentStep, setCurrentStep] = useState('observe');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedLoss, setSelectedLoss] = useState(null);
  const [params, setParams] = useState({});
  const [showTestData, setShowTestData] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(true);
  const contentRef = useRef(null);
  const [plotSize, setPlotSize] = useState({ width: 700, height: 500 });

  // Get current data
  const trainData = ALL_DATASETS[scenario].train;
  const testData = ALL_DATASETS[scenario].test;
  const scenarioDef = SCENARIOS.find(s => s.id === scenario);
  const modelDef = selectedModel ? MODELS.find(m => m.id === selectedModel) : null;
  const lossDef = selectedLoss ? LOSS_FUNCTIONS.find(l => l.id === selectedLoss) : null;

  // Narrative text
  const narrativeText = useMemo(() => {
    if (currentStep === 'observe') return scenarioDef.story;
    if (currentStep === 'model') return 'Which mathematical model best describes this data? Choose wisely — or learn from a wrong choice.';
    if (currentStep === 'loss') return 'How should we measure error? The loss function quantifies the gap between your prediction and reality.';
    if (currentStep === 'params') return 'Drag the sliders to fit your model to the data, or let gradient descent find the optimum automatically.';
    if (currentStep === 'validate') {
      if (!showTestData) return 'Your model is trained. The real test: does it work on data it has never seen before?';
      return showTestData ? (
        (() => {
          const model = MODELS.find(m => m.id === selectedModel);
          const loss = LOSS_FUNCTIONS.find(l => l.id === selectedLoss);
          if (!model || !loss) return '';
          const trainPred = trainData.map(d => model.fn(d.x, params));
          const testPred = testData.map(d => model.fn(d.x, params));
          const trnLoss = loss.fn(trainData.map(d => d.y), trainPred);
          const tstLoss = loss.fn(testData.map(d => d.y), testPred);
          const good = tstLoss < trnLoss * 3 && tstLoss < 20;
          return good ? scenarioDef.storyValidateGood : scenarioDef.storyValidateBad;
        })()
      ) : '';
    }
    return '';
  }, [currentStep, scenarioDef, showTestData, selectedModel, selectedLoss, params, trainData, testData]);

  // Resize observer for plot
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setPlotSize({ width: Math.max(300, width), height: Math.max(300, height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset when scenario changes
  const handleScenarioChange = useCallback((newScenario) => {
    setScenario(newScenario);
    setCurrentStep('observe');
    setCompletedSteps([]);
    setSelectedModel(null);
    setSelectedLoss(null);
    setParams({});
    setShowTestData(false);
    setAnimatePoints(true);
    setTimeout(() => setAnimatePoints(false), 2000);
  }, []);

  // Step navigation
  const advanceStep = useCallback((fromStep) => {
    const idx = STEP_ORDER.indexOf(fromStep);
    if (idx < STEP_ORDER.length - 1) {
      setCompletedSteps(prev => [...new Set([...prev, fromStep])]);
      setCurrentStep(STEP_ORDER[idx + 1]);
    }
  }, []);

  const handleStepClick = useCallback((stepId) => {
    setCurrentStep(stepId);
  }, []);

  // Model selection
  const handleModelSelect = useCallback((modelId) => {
    setSelectedModel(modelId);
    setParams(getDefaultParams(modelId));
    setShowTestData(false);
    // Auto-advance from observe to model step handled by pipeline
    if (currentStep === 'observe') {
      setCompletedSteps(prev => [...new Set([...prev, 'observe'])]);
      setCurrentStep('model');
    }
  }, [currentStep]);

  // Loss selection
  const handleLossSelect = useCallback((lossId) => {
    setSelectedLoss(lossId);
    setShowTestData(false);
  }, []);

  // Validate
  const handleValidate = useCallback(() => {
    setShowTestData(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        const idx = STEP_ORDER.indexOf(currentStep);
        // Only advance if current step has required selection
        if (currentStep === 'observe') {
          // Can always advance from observe
        } else if (currentStep === 'model' && !selectedModel) return;
        else if (currentStep === 'loss' && !selectedLoss) return;

        if (idx < STEP_ORDER.length - 1) {
          advanceStep(currentStep);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx > 0) {
          setCurrentStep(STEP_ORDER[idx - 1]);
        }
      } else if (e.key >= '1' && e.key <= '3') {
        const scenarios = ['linear', 'exponential', 'sinusoidal'];
        handleScenarioChange(scenarios[parseInt(e.key) - 1]);
      } else if (e.key === 'Escape') {
        handleScenarioChange(scenario);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, selectedModel, selectedLoss, advanceStep, handleScenarioChange, scenario]);

  // Initial animation timeout
  useEffect(() => {
    const t = setTimeout(() => setAnimatePoints(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Render side panel content based on current step
  const renderSidePanelContent = () => {
    switch (currentStep) {
      case 'observe':
        return (
          <div style={{ animation: 'slideInRight 0.4s ease-out' }}>
            <h3
              style={{
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: 8,
              }}
            >
              Observe the Data
            </h3>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: 13,
                color: COLORS.muted,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Study the scatter plot. What pattern do you see? Hover over points to inspect values.
            </p>
            <div
              style={{
                padding: '12px 16px',
                background: COLORS.dormant,
                borderRadius: 10,
                border: `1px solid ${COLORS.grid}`,
                marginBottom: 12,
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                Dataset
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.amber }}>
                {trainData.length} training points
              </div>
            </div>
            <button
              onClick={() => advanceStep('observe')}
              style={{
                padding: '12px 20px',
                width: '100%',
                background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.primary})`,
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.background,
                boxShadow: `0 4px 16px ${COLORS.amber}40`,
                transition: 'all 0.3s ease',
              }}
            >
              Next: Choose a Model
            </button>
          </div>
        );

      case 'model':
        return (
          <>
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={handleModelSelect}
            />
            {selectedModel && (
              <button
                onClick={() => advanceStep('model')}
                style={{
                  marginTop: 12,
                  padding: '10px 16px',
                  width: '100%',
                  background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.primary})`,
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: FONTS.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.background,
                  transition: 'all 0.3s ease',
                }}
              >
                Next: Define Loss Function
              </button>
            )}
          </>
        );

      case 'loss':
        return (
          <>
            <LossSelector
              selectedLoss={selectedLoss}
              onSelectLoss={handleLossSelect}
            />
            {selectedLoss && (
              <button
                onClick={() => advanceStep('loss')}
                style={{
                  marginTop: 12,
                  padding: '10px 16px',
                  width: '100%',
                  background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.primary})`,
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: FONTS.display,
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.background,
                  transition: 'all 0.3s ease',
                }}
              >
                Next: Set Parameters
              </button>
            )}
          </>
        );

      case 'params':
        return (
          <>
            <ParameterSliders
              modelId={selectedModel}
              lossId={selectedLoss}
              params={params}
              onParamsChange={setParams}
              trainData={trainData}
            />
            <button
              onClick={() => advanceStep('params')}
              style={{
                marginTop: 12,
                padding: '10px 16px',
                width: '100%',
                background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.green})`,
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: FONTS.display,
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.background,
                transition: 'all 0.3s ease',
              }}
            >
              Next: Validate on New Data
            </button>
          </>
        );

      case 'validate':
        return (
          <ValidationPanel
            modelId={selectedModel}
            lossId={selectedLoss}
            params={params}
            trainData={trainData}
            testData={testData}
            scenarioId={scenario}
            onValidate={handleValidate}
            showTestData={showTestData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: COLORS.background,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <ScenarioHeader
        activeScenario={scenario}
        onScenarioChange={handleScenarioChange}
      />

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Plot area */}
        <div
          ref={contentRef}
          style={{
            flex: '1 1 62%',
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <ScatterPlot
            trainData={trainData}
            testData={testData}
            modelFn={modelDef?.fn}
            modelId={selectedModel}
            modelParams={selectedModel ? params : null}
            lossFn={lossDef}
            showResiduals={currentStep === 'loss' || currentStep === 'params' || currentStep === 'validate'}
            showTestData={showTestData}
            width={plotSize.width}
            height={plotSize.height}
            xLabel={scenarioDef.xLabel}
            yLabel={scenarioDef.yLabel}
            animatePoints={animatePoints}
          />
        </div>

        {/* Side panel */}
        <div
          style={{
            flex: '0 0 340px',
            background: COLORS.surface,
            borderLeft: `1px solid ${COLORS.grid}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Pipeline stepper */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${COLORS.grid}`,
            }}
          >
            <PipelineStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step content */}
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {renderSidePanelContent()}
          </div>
        </div>
      </div>

      {/* Narrative bar */}
      <NarrativeBar text={narrativeText} />
    </div>
  );
}
