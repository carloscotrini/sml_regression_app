// Color palette (Dark Lecture theme)
export const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#273549',
  primary: '#38bdf8',
  amber: '#fbbf24',
  green: '#34d399',
  pink: '#f472b6',
  cyan: '#22d3ee',
  text: '#f1f5f9',
  muted: '#94a3b8',
  grid: '#334155',
  dormant: '#131c2e',
  white: '#ffffff',
};

// Typography
export const FONTS = {
  display: "'Syne', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
  serif: "'Lora', serif",
};

// Layout
export const LAYOUT = {
  plotWidth: 0.62,
  sidePanel: 0.38,
  headerHeight: 64,
  narrativeBarHeight: 72,
  padding: 24,
};

// Animation
export const ANIMATION = {
  pointStagger: 20,
  curveDrawDuration: 600,
  residualStagger: 15,
  sliderUpdateRate: 16,
  optimizationDuration: 2000,
  optimizationSteps: 60,
  testPointStagger: 30,
  crossFade: 400,
  lossPulse: 200,
};

// Scenarios
export const SCENARIOS = [
  {
    id: 'linear',
    name: 'Hooke\'s Law',
    subtitle: 'Spring Force vs. Displacement',
    icon: '\u27CB',
    xLabel: 'Displacement x (mm)',
    yLabel: 'Force F (N)',
    story: 'You\'re in the materials lab testing a spring. You measure displacement and the restoring force. Hooke\'s Law says F = kx \u2014 but your measurements have sensor noise. Can you recover the spring constant?',
    storyValidateGood: 'Your model captures the linear relationship beautifully. The spring constant you found matches the manufacturer\'s spec. New measurements fall right on the line.',
    storyValidateBad: 'This model struggles with the linear trend. A spring\'s force-displacement relationship is fundamentally linear \u2014 the model you chose can\'t capture that simplicity.',
  },
  {
    id: 'exponential',
    name: 'Newton\'s Cooling',
    subtitle: 'Temperature vs. Time',
    icon: '\u2935',
    xLabel: 'Time t (min)',
    yLabel: 'Temperature T (\u00B0C)',
    story: 'You pull a heated steel part from the furnace and measure its temperature as it cools in ambient air. Newton\'s Law of Cooling predicts exponential decay toward room temperature.',
    storyValidateGood: 'Excellent! Your model captures the exponential cooling curve. The predicted ambient temperature matches the room thermometer. New measurements confirm the fit.',
    storyValidateBad: 'The cooling process is inherently exponential \u2014 temperature drops fast initially, then slows. Your chosen model can\'t capture this nonlinear decay.',
  },
  {
    id: 'sinusoidal',
    name: 'Beam Vibration',
    subtitle: 'Displacement vs. Time',
    icon: '\u223F',
    xLabel: 'Time t (s)',
    yLabel: 'Displacement y (mm)',
    story: 'You clamp a steel beam at one end, deflect it, and release. An accelerometer records the free vibration \u2014 a periodic oscillation. Can you find the natural frequency?',
    storyValidateGood: 'Your sinusoidal model captures the oscillation perfectly. The natural frequency you found matches the beam\'s theoretical value. New vibration cycles align with your prediction.',
    storyValidateBad: 'Vibration is inherently periodic \u2014 the beam oscillates back and forth. Your chosen model can\'t capture this repeating pattern.',
  },
];

// Model definitions
export const MODELS = [
  {
    id: 'linear',
    name: 'Linear',
    formula: 'y = ax + b',
    latex: 'y = ax + b',
    params: [
      { name: 'a', label: 'Slope (a)', min: -10, max: 10, default: 1, step: 0.1 },
      { name: 'b', label: 'Intercept (b)', min: -20, max: 50, default: 0, step: 0.5 },
    ],
    fn: (x, p) => p.a * x + p.b,
    // Variations to show in the background when selected
    variations: [
      { a: 0.5, b: 5 },
      { a: 1.5, b: -3 },
      { a: 3.0, b: 0 },
      { a: -1.0, b: 15 },
      { a: 2.5, b: 1 },
      { a: 0.2, b: 10 },
      { a: 4.0, b: -5 },
    ],
  },
  {
    id: 'exponential',
    name: 'Exponential',
    formula: 'y = a\u00B7e^(bx) + c',
    latex: 'y = a \\cdot e^{bx} + c',
    params: [
      { name: 'a', label: 'Amplitude (a)', min: -100, max: 100, default: 50, step: 1 },
      { name: 'b', label: 'Rate (b)', min: -2, max: 2, default: -0.3, step: 0.01 },
      { name: 'c', label: 'Offset (c)', min: -50, max: 100, default: 20, step: 1 },
    ],
    fn: (x, p) => p.a * Math.exp(p.b * x) + p.c,
    variations: [
      { a: 80, b: -0.3, c: 20 },
      { a: 50, b: -0.5, c: 10 },
      { a: 60, b: -0.1, c: 30 },
      { a: 40, b: -0.8, c: 15 },
      { a: 90, b: -0.2, c: 5 },
      { a: 30, b: -0.4, c: 25 },
      { a: 70, b: -0.6, c: 0 },
    ],
  },
  {
    id: 'sinusoidal',
    name: 'Sinusoidal',
    formula: 'y = A\u00B7sin(\u03C9x + \u03C6)',
    latex: 'y = A \\sin(\\omega x + \\varphi)',
    params: [
      { name: 'A', label: 'Amplitude (A)', min: -10, max: 10, default: 3, step: 0.1 },
      { name: 'omega', label: 'Frequency (\u03C9)', min: 0.1, max: 10, default: 2, step: 0.1 },
      { name: 'phi', label: 'Phase (\u03C6)', min: -Math.PI, max: Math.PI, default: 0, step: 0.05 },
    ],
    fn: (x, p) => p.A * Math.sin(p.omega * x + p.phi),
    variations: [
      { A: 2, omega: 1.5, phi: 0 },
      { A: 4, omega: 2.5, phi: 1.0 },
      { A: 3, omega: 3.0, phi: -0.5 },
      { A: 1.5, omega: 1.0, phi: 0.5 },
      { A: 5, omega: 2.0, phi: -1.0 },
      { A: 2.5, omega: 4.0, phi: 0.3 },
      { A: 3.5, omega: 1.8, phi: -0.8 },
    ],
  },
];

// Loss function definitions
export const LOSS_FUNCTIONS = [
  {
    id: 'mse',
    name: 'Mean Squared Error',
    formula: 'L = (1/n) \u03A3(y\u1D62 \u2212 \u0177\u1D62)\u00B2',
    latex: 'L = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2',
    fn: (y, yHat) => {
      const n = y.length;
      return y.reduce((sum, yi, i) => sum + (yi - yHat[i]) ** 2, 0) / n;
    },
    pointLoss: (yi, yHati) => (yi - yHati) ** 2,
  },
  {
    id: 'mae',
    name: 'Mean Absolute Error',
    formula: 'L = (1/n) \u03A3|y\u1D62 \u2212 \u0177\u1D62|',
    latex: 'L = \\frac{1}{n} \\sum_{i=1}^{n} |y_i - \\hat{y}_i|',
    fn: (y, yHat) => {
      const n = y.length;
      return y.reduce((sum, yi, i) => sum + Math.abs(yi - yHat[i]), 0) / n;
    },
    pointLoss: (yi, yHati) => Math.abs(yi - yHati),
  },
];
