/**
 * Mathematical utilities for regression, loss computation, and optimization.
 */

// Seeded random number generator (mulberry32)
export function createRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for Gaussian noise
export function gaussianNoise(rng, mean = 0, stddev = 1) {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stddev * z;
}

// Generate dataset for a scenario
export function generateDataset(scenarioId, seed, count) {
  const rng = createRng(seed);
  const points = [];

  for (let i = 0; i < count; i++) {
    let x, y;
    switch (scenarioId) {
      case 'linear': {
        x = rng() * 10;
        y = 2.5 * x + 1.0 + gaussianNoise(rng, 0, 1.5);
        break;
      }
      case 'exponential': {
        x = rng() * 10;
        y = 80 * Math.exp(-0.3 * x) + 20 + gaussianNoise(rng, 0, 3);
        break;
      }
      case 'sinusoidal': {
        x = rng() * 4 * Math.PI;
        y = 3 * Math.sin(2 * x + 0.5) + gaussianNoise(rng, 0, 0.5);
        break;
      }
      default:
        x = 0;
        y = 0;
    }
    points.push({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 });
  }

  return points.sort((a, b) => a.x - b.x);
}

// Generate all datasets
export function generateAllDatasets() {
  return {
    linear: {
      train: generateDataset('linear', 42, 40),
      test: generateDataset('linear', 137, 20),
    },
    exponential: {
      train: generateDataset('exponential', 42, 40),
      test: generateDataset('exponential', 137, 20),
    },
    sinusoidal: {
      train: generateDataset('sinusoidal', 42, 40),
      test: generateDataset('sinusoidal', 137, 20),
    },
  };
}

// Compute predictions for a model
export function computePredictions(modelFn, params, xValues) {
  return xValues.map(x => modelFn(x, params));
}

// Compute numerical gradient for optimization
export function computeGradient(modelFn, lossFn, params, paramDefs, xValues, yValues, epsilon = 1e-5) {
  const gradient = {};
  for (const pDef of paramDefs) {
    const name = pDef.name;
    const paramsPlus = { ...params, [name]: params[name] + epsilon };
    const paramsMinus = { ...params, [name]: params[name] - epsilon };
    const predPlus = computePredictions(modelFn, paramsPlus, xValues);
    const predMinus = computePredictions(modelFn, paramsMinus, xValues);
    const lossPlus = lossFn(yValues, predPlus);
    const lossMinus = lossFn(yValues, predMinus);
    gradient[name] = (lossPlus - lossMinus) / (2 * epsilon);
  }
  return gradient;
}

// Run one step of gradient descent
export function gradientDescentStep(params, gradient, learningRate) {
  const newParams = { ...params };
  for (const key of Object.keys(gradient)) {
    newParams[key] = params[key] - learningRate * gradient[key];
  }
  return newParams;
}

// Clamp params to their defined ranges
export function clampParams(params, paramDefs) {
  const clamped = { ...params };
  for (const pDef of paramDefs) {
    clamped[pDef.name] = Math.max(pDef.min, Math.min(pDef.max, clamped[pDef.name]));
  }
  return clamped;
}

// Generate smooth curve points for plotting
export function generateCurvePoints(modelFn, params, xMin, xMax, numPoints = 200) {
  const points = [];
  const step = (xMax - xMin) / (numPoints - 1);
  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    const y = modelFn(x, params);
    if (isFinite(y)) {
      points.push({ x, y });
    }
  }
  return points;
}

// Adaptive learning rate based on scenario and model
export function getAdaptiveLearningRate(scenarioId, modelId) {
  const rates = {
    linear: { linear: 0.01, exponential: 0.0001, sinusoidal: 0.001 },
    exponential: { linear: 0.001, exponential: 0.0001, sinusoidal: 0.0005 },
    sinusoidal: { linear: 0.001, exponential: 0.0001, sinusoidal: 0.001 },
  };
  return rates[scenarioId]?.[modelId] ?? 0.001;
}
