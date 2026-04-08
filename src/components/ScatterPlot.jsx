import React, { useMemo, useCallback, useState } from 'react';
import { COLORS, FONTS, MODELS } from '../constants';
import { generateCurvePoints } from '../mathUtils';

// Simple linear scale
function linearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const scale = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  scale.inverse = (v) => d0 + ((v - r0) / (r1 - r0)) * (d1 - d0);
  return scale;
}

// Generate nice tick values
function niceTickValues(min, max, count = 5) {
  const range = max - min;
  const rawStep = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normStep = rawStep / mag;
  let step;
  if (normStep <= 1.5) step = 1 * mag;
  else if (normStep <= 3.5) step = 2 * mag;
  else if (normStep <= 7.5) step = 5 * mag;
  else step = 10 * mag;

  const ticks = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + step * 0.001; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
}

const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };

// Faint palette for variation curves
const VARIATION_COLORS = [
  '#38bdf840', '#fbbf2440', '#34d39940', '#f472b640',
  '#22d3ee40', '#a78bfa40', '#fb923c40',
];

export default function ScatterPlot({
  trainData,
  testData,
  modelFn,
  modelId,
  modelParams,
  lossFn,
  showResiduals,
  showTestData,
  width,
  height,
  xLabel,
  yLabel,
  animatePoints,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute bounds from data
  const { xScale, yScale, xTicks, yTicks } = useMemo(() => {
    const allData = [...trainData, ...(showTestData ? testData : [])];
    if (allData.length === 0) {
      return {
        xScale: linearScale([0, 1], [MARGIN.left, width - MARGIN.right]),
        yScale: linearScale([0, 1], [height - MARGIN.bottom, MARGIN.top]),
        xTicks: [],
        yTicks: [],
      };
    }

    let xMin = Math.min(...allData.map(d => d.x));
    let xMax = Math.max(...allData.map(d => d.x));
    let yMin = Math.min(...allData.map(d => d.y));
    let yMax = Math.max(...allData.map(d => d.y));

    // Add padding
    const xPad = (xMax - xMin) * 0.08 || 1;
    const yPad = (yMax - yMin) * 0.08 || 1;
    xMin -= xPad;
    xMax += xPad;
    yMin -= yPad;
    yMax += yPad;

    return {
      xScale: linearScale([xMin, xMax], [MARGIN.left, width - MARGIN.right]),
      yScale: linearScale([yMin, yMax], [height - MARGIN.bottom, MARGIN.top]),
      xTicks: niceTickValues(xMin, xMax, 6),
      yTicks: niceTickValues(yMin, yMax, 5),
    };
  }, [trainData, testData, showTestData, width, height]);

  // Generate model curve
  const curvePoints = useMemo(() => {
    if (!modelFn || !modelParams) return null;
    const xMin = xScale.inverse(MARGIN.left);
    const xMax = xScale.inverse(width - MARGIN.right);
    const pts = generateCurvePoints(modelFn, modelParams, xMin, xMax, 300);
    return pts;
  }, [modelFn, modelParams, xScale, width]);

  // Build SVG path for curve
  const curvePath = useMemo(() => {
    if (!curvePoints || curvePoints.length === 0) return '';
    const yTop = MARGIN.top - 20;
    const yBottom = height - MARGIN.bottom + 20;
    let d = '';
    let drawing = false;
    for (const pt of curvePoints) {
      const sx = xScale(pt.x);
      const sy = yScale(pt.y);
      if (sy < yTop || sy > yBottom || !isFinite(sy)) {
        drawing = false;
        continue;
      }
      if (!drawing) {
        d += `M${sx},${sy}`;
        drawing = true;
      } else {
        d += `L${sx},${sy}`;
      }
    }
    return d;
  }, [curvePoints, xScale, yScale, height]);

  // Generate variation curves (multiple model instances shown in background)
  const variationPaths = useMemo(() => {
    if (!modelId || !modelFn) return [];
    const modelDef = MODELS.find(m => m.id === modelId);
    if (!modelDef || !modelDef.variations) return [];

    const xMin = xScale.inverse(MARGIN.left);
    const xMax = xScale.inverse(width - MARGIN.right);
    const yTop = MARGIN.top - 20;
    const yBottom = height - MARGIN.bottom + 20;

    return modelDef.variations.map((varParams) => {
      const pts = generateCurvePoints(modelFn, varParams, xMin, xMax, 200);
      let d = '';
      let drawing = false;
      for (const pt of pts) {
        const sx = xScale(pt.x);
        const sy = yScale(pt.y);
        if (sy < yTop || sy > yBottom || !isFinite(sy)) {
          drawing = false;
          continue;
        }
        if (!drawing) {
          d += `M${sx},${sy}`;
          drawing = true;
        } else {
          d += `L${sx},${sy}`;
        }
      }
      return d;
    });
  }, [modelId, modelFn, xScale, yScale, width, height]);

  const handlePointHover = useCallback((point, type) => {
    setHoveredPoint(point ? { ...point, type } : null);
  }, []);

  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Background */}
      <rect
        x={MARGIN.left}
        y={MARGIN.top}
        width={plotWidth}
        height={plotHeight}
        fill={COLORS.dormant}
        rx={4}
      />

      {/* Grid lines */}
      {xTicks.map(tick => (
        <line
          key={`xg-${tick}`}
          x1={xScale(tick)}
          y1={MARGIN.top}
          x2={xScale(tick)}
          y2={height - MARGIN.bottom}
          stroke={COLORS.grid}
          strokeWidth={0.5}
          opacity={0.4}
        />
      ))}
      {yTicks.map(tick => (
        <line
          key={`yg-${tick}`}
          x1={MARGIN.left}
          y1={yScale(tick)}
          x2={width - MARGIN.right}
          y2={yScale(tick)}
          stroke={COLORS.grid}
          strokeWidth={0.5}
          opacity={0.4}
        />
      ))}

      {/* Axes */}
      <line
        x1={MARGIN.left}
        y1={height - MARGIN.bottom}
        x2={width - MARGIN.right}
        y2={height - MARGIN.bottom}
        stroke={COLORS.grid}
        strokeWidth={1.5}
      />
      <line
        x1={MARGIN.left}
        y1={MARGIN.top}
        x2={MARGIN.left}
        y2={height - MARGIN.bottom}
        stroke={COLORS.grid}
        strokeWidth={1.5}
      />

      {/* X axis ticks & labels */}
      {xTicks.map(tick => (
        <g key={`xt-${tick}`}>
          <line
            x1={xScale(tick)}
            y1={height - MARGIN.bottom}
            x2={xScale(tick)}
            y2={height - MARGIN.bottom + 6}
            stroke={COLORS.muted}
            strokeWidth={1}
          />
          <text
            x={xScale(tick)}
            y={height - MARGIN.bottom + 20}
            textAnchor="middle"
            fontFamily={FONTS.mono}
            fontSize={11}
            fill={COLORS.muted}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Y axis ticks & labels */}
      {yTicks.map(tick => (
        <g key={`yt-${tick}`}>
          <line
            x1={MARGIN.left - 6}
            y1={yScale(tick)}
            x2={MARGIN.left}
            y2={yScale(tick)}
            stroke={COLORS.muted}
            strokeWidth={1}
          />
          <text
            x={MARGIN.left - 12}
            y={yScale(tick) + 4}
            textAnchor="end"
            fontFamily={FONTS.mono}
            fontSize={11}
            fill={COLORS.muted}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text
        x={MARGIN.left + plotWidth / 2}
        y={height - 6}
        textAnchor="middle"
        fontFamily={FONTS.body}
        fontSize={13}
        fontWeight={500}
        fill={COLORS.muted}
      >
        {xLabel}
      </text>
      <text
        x={14}
        y={MARGIN.top + plotHeight / 2}
        textAnchor="middle"
        fontFamily={FONTS.body}
        fontSize={13}
        fontWeight={500}
        fill={COLORS.muted}
        transform={`rotate(-90, 14, ${MARGIN.top + plotHeight / 2})`}
      >
        {yLabel}
      </text>

      {/* Clip path for plot area */}
      <defs>
        <clipPath id="plot-clip">
          <rect x={MARGIN.left} y={MARGIN.top} width={plotWidth} height={plotHeight} />
        </clipPath>
      </defs>

      <g clipPath="url(#plot-clip)">
        {/* Residual lines */}
        {showResiduals && modelFn && modelParams && trainData.map((pt, i) => {
          const predicted = modelFn(pt.x, modelParams);
          if (!isFinite(predicted)) return null;
          const residual = Math.abs(pt.y - predicted);
          const maxResidual = 10;
          const t = Math.min(residual / maxResidual, 1);
          // Interpolate green -> pink
          const color = t < 0.5
            ? COLORS.green
            : COLORS.pink;
          return (
            <line
              key={`r-${i}`}
              x1={xScale(pt.x)}
              y1={yScale(pt.y)}
              x2={xScale(pt.x)}
              y2={yScale(predicted)}
              stroke={color}
              strokeWidth={1.5}
              opacity={0.5}
              style={{
                animation: animatePoints ? `fadeInUp 0.3s ease-out ${i * 15}ms both` : 'none',
              }}
            />
          );
        })}

        {/* Variation curves (multiple model instances in background) */}
        {variationPaths.map((vPath, i) => vPath && (
          <path
            key={`var-${i}`}
            d={vPath}
            fill="none"
            stroke={VARIATION_COLORS[i % VARIATION_COLORS.length]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            opacity={0.6}
          />
        ))}

        {/* Model curve (current parameters) */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 0 6px ${COLORS.primary}60)`,
            }}
          />
        )}

        {/* Training data points */}
        {trainData.map((pt, i) => (
          <circle
            key={`train-${i}`}
            cx={xScale(pt.x)}
            cy={yScale(pt.y)}
            r={hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y ? 7 : 5}
            fill={COLORS.amber}
            stroke={COLORS.background}
            strokeWidth={1.5}
            opacity={showTestData ? 0.5 : 0.9}
            style={{
              cursor: 'pointer',
              transition: 'r 0.15s ease, opacity 0.3s ease',
              animation: animatePoints ? `fadeInUp 0.3s ease-out ${i * 20}ms both` : 'none',
              filter: `drop-shadow(0 0 3px ${COLORS.amber}50)`,
            }}
            onMouseEnter={() => handlePointHover(pt, 'train')}
            onMouseLeave={() => handlePointHover(null)}
          />
        ))}

        {/* Test data points */}
        {showTestData && testData.map((pt, i) => (
          <circle
            key={`test-${i}`}
            cx={xScale(pt.x)}
            cy={yScale(pt.y)}
            r={hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y ? 7 : 5.5}
            fill={COLORS.cyan}
            stroke={COLORS.background}
            strokeWidth={1.5}
            opacity={0.9}
            style={{
              cursor: 'pointer',
              transition: 'r 0.15s ease',
              animation: `fadeInUp 0.4s ease-out ${i * 30}ms both`,
              filter: `drop-shadow(0 0 5px ${COLORS.cyan}60)`,
            }}
            onMouseEnter={() => handlePointHover(pt, 'test')}
            onMouseLeave={() => handlePointHover(null)}
          />
        ))}
      </g>

      {/* Tooltip */}
      {hoveredPoint && (
        <g
          transform={`translate(${xScale(hoveredPoint.x)}, ${yScale(hoveredPoint.y) - 16})`}
          style={{ pointerEvents: 'none' }}
        >
          <rect
            x={-48}
            y={-28}
            width={96}
            height={24}
            rx={6}
            fill={COLORS.surface}
            stroke={hoveredPoint.type === 'train' ? COLORS.amber : COLORS.cyan}
            strokeWidth={1}
          />
          <text
            x={0}
            y={-12}
            textAnchor="middle"
            fontFamily={FONTS.mono}
            fontSize={11}
            fill={COLORS.text}
          >
            ({hoveredPoint.x.toFixed(2)}, {hoveredPoint.y.toFixed(2)})
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${width - MARGIN.right - 120}, ${MARGIN.top + 12})`}>
        <circle cx={0} cy={0} r={4} fill={COLORS.amber} />
        <text x={10} y={4} fontFamily={FONTS.body} fontSize={11} fill={COLORS.muted}>
          Training data
        </text>
        {showTestData && (
          <>
            <circle cx={0} cy={18} r={4} fill={COLORS.cyan} />
            <text x={10} y={22} fontFamily={FONTS.body} fontSize={11} fill={COLORS.muted}>
              Test data
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
