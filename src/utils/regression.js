import SimpleLinearRegression from "ml-regression-simple-linear";
import PolynomialRegression from "ml-regression-polynomial";

// --- helpers ---
function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function sse(yTrue, yPred) {
  return yTrue.reduce((s, y, i) => s + (y - yPred[i]) ** 2, 0);
}

function sst(yTrue) {
  const m = mean(yTrue);
  return yTrue.reduce((s, y) => s + (y - m) ** 2, 0);
}

export function rSquared(yTrue, yPred) {
  const ss_res = sse(yTrue, yPred);
  const ss_tot = sst(yTrue);
  return ss_tot === 0 ? 1 : 1 - ss_res / ss_tot;
}

export function mse(yTrue, yPred) {
  return sse(yTrue, yPred) / yTrue.length;
}

export function rmse(yTrue, yPred) {
  return Math.sqrt(mse(yTrue, yPred));
}

// --- regression models ---

export function fitLinear(x, y) {
  const reg = new SimpleLinearRegression(x, y);
  const predict = (xVal) => reg.predict(xVal);
  const yPred = x.map(predict);
  return {
    name: "Linear",
    predict,
    coefficients: { slope: reg.slope, intercept: reg.intercept },
    metrics: { r2: rSquared(y, yPred), rmse: rmse(y, yPred) },
  };
}

export function fitPolynomial(x, y, degree = 2) {
  const reg = new PolynomialRegression(x, y, degree);
  const predict = (xVal) => reg.predict(xVal);
  const yPred = x.map(predict);
  return {
    name: `Polynomial (degree ${degree})`,
    predict,
    coefficients: reg.coefficients,
    metrics: { r2: rSquared(y, yPred), rmse: rmse(y, yPred) },
  };
}

// Ridge regression (L2 regularization) — manual closed-form
export function fitRidge(x, y, alpha = 1.0) {
  const n = x.length;
  const xMean = mean(x);
  const yMean = mean(y);

  // Center
  const xc = x.map((v) => v - xMean);
  const yc = y.map((v) => v - yMean);

  const xtx = xc.reduce((s, v) => s + v * v, 0);
  const xty = xc.reduce((s, v, i) => s + v * yc[i], 0);

  const slope = xty / (xtx + alpha);
  const intercept = yMean - slope * xMean;

  const predict = (xVal) => slope * xVal + intercept;
  const yPred = x.map(predict);

  return {
    name: `Ridge (\u03B1=${alpha})`,
    predict,
    coefficients: { slope, intercept, alpha },
    metrics: { r2: rSquared(y, yPred), rmse: rmse(y, yPred) },
  };
}

// Lasso regression (L1) — coordinate descent, single feature
export function fitLasso(x, y, alpha = 1.0, maxIter = 1000) {
  const n = x.length;
  const xMean = mean(x);
  const yMean = mean(y);

  const xc = x.map((v) => v - xMean);
  const yc = y.map((v) => v - yMean);

  const xtx = xc.reduce((s, v) => s + v * v, 0);
  let slope = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    const rho = xc.reduce((s, v, i) => s + v * (yc[i] - 0), 0); // single feature
    if (rho < -alpha / 2) {
      slope = (rho + alpha / 2) / xtx;
    } else if (rho > alpha / 2) {
      slope = (rho - alpha / 2) / xtx;
    } else {
      slope = 0;
    }
  }

  const intercept = yMean - slope * xMean;
  const predict = (xVal) => slope * xVal + intercept;
  const yPred = x.map(predict);

  return {
    name: `Lasso (\u03B1=${alpha})`,
    predict,
    coefficients: { slope, intercept, alpha },
    metrics: { r2: rSquared(y, yPred), rmse: rmse(y, yPred) },
  };
}

// Generate smooth curve for plotting
export function generateCurve(predict, xMin, xMax, nPoints = 200) {
  const step = (xMax - xMin) / (nPoints - 1);
  return Array.from({ length: nPoints }, (_, i) => {
    const xVal = xMin + i * step;
    return { x: xVal, y: predict(xVal) };
  });
}
