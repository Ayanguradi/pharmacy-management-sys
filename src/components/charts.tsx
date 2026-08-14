interface BarChartProps {
  data: { label: string; value: number; secondary?: number }[];
  height?: number;
  color?: string;
  secondaryColor?: string;
}

export function BarChart({ data, height = 200, color = '#1b80f5', secondaryColor = '#12c983' }: BarChartProps) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.secondary ?? 0]));
  const barWidth = 100 / data.length;
  const hasSecondary = data.some((d) => d.secondary !== undefined);

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="0" y1={(height / 3) * (1 - p)} x2="100" y2={(height / 3) * (1 - p)} stroke="#e2e8f0" strokeWidth="0.15" strokeDasharray="0.5" />
        ))}
        {data.map((d, i) => {
          const x = i * barWidth + barWidth * 0.15;
          const w = barWidth * (hasSecondary ? 0.32 : 0.5);
          const h = (d.value / max) * (height / 3) * 0.9;
          const h2 = d.secondary ? (d.secondary / max) * (height / 3) * 0.9 : 0;
          return (
            <g key={i}>
              <rect x={x} y={(height / 3) - h} width={w} height={h} rx="0.5" fill={color} className="transition-all duration-300" />
              {hasSecondary && (
                <rect x={x + w + barWidth * 0.06} y={(height / 3) - h2} width={w} height={h2} rx="0.5" fill={secondaryColor} opacity="0.7" className="transition-all duration-300" />
              )}
              <text x={x + (hasSecondary ? barWidth * 0.35 : barWidth * 0.25)} y={(height / 3) + 1.5} fontSize="1.8" fill="#94a3b8" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hasSecondary && (
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-neutral-500"><span className="w-3 h-3 rounded-sm" style={{ background: color }} />Sales</span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-500"><span className="w-3 h-3 rounded-sm" style={{ background: secondaryColor }} />Purchases</span>
        </div>
      )}
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = '#1b80f5' }: LineChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = (height / 3) - ((d.value - min) / range) * (height / 3) * 0.8 - (height / 3) * 0.1;
    return { x, y, ...d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L 100 ${height / 3} L 0 ${height / 3} Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="0" y1={(height / 3) * p} x2="100" y2={(height / 3) * p} stroke="#e2e8f0" strokeWidth="0.15" strokeDasharray="0.5" />
        ))}
        <path d={areaPath} fill="url(#lineGradient)" />
        <path d={path} fill="none" stroke={color} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="0.8" fill="white" stroke={color} strokeWidth="0.4" />
            <text x={p.x} y={(height / 3) + 1.5} fontSize="1.8" fill="#94a3b8" textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface DonutProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ segments, size = 160 }: DonutProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circumference;
          const circle = (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
          offset += len;
          return circle;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm" style={{ background: seg.color }} />
            <span className="text-neutral-600">{seg.label}</span>
            <span className="font-semibold text-neutral-800">{((seg.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HBarProps {
  data: { label: string; value: number; color?: string }[];
  formatter?: (n: number) => string;
  onRowClick?: (label: string) => void;
}

export function HBarChart({ data, formatter = (n) => String(n), onRowClick }: HBarProps) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div 
            className={`flex items-center justify-between mb-1 ${onRowClick ? 'cursor-pointer hover:text-primary-600 transition-colors group' : ''}`}
            onClick={() => onRowClick && onRowClick(d.label)}
          >
            <span className={`text-sm text-neutral-600 ${onRowClick ? 'group-hover:text-primary-600 group-hover:underline' : ''}`}>{d.label}</span>
            <span className="text-sm font-semibold text-neutral-800">{formatter(d.value)}</span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? '#1b80f5' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';

interface ComboChartProps {
  data: { label: string; sales: number; purchases: number }[];
  height?: number;
}

export function ComboChart({ data, height = 240 }: ComboChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const max = Math.max(...data.flatMap((d) => [d.sales, d.purchases])) || 1;
  const min = 0; 
  const range = max - min;
  
  const width = 100;
  const svgHeight = height / 3;

  // Primary (Sales - Teal #0f766e)
  const ptsSales = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = svgHeight - ((d.sales - min) / range) * svgHeight * 0.8 - svgHeight * 0.1;
    return { x, y, ...d };
  });

  // Secondary (Purchases - Amber #d97706)
  const ptsPurchases = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = svgHeight - ((d.purchases - min) / range) * svgHeight * 0.8 - svgHeight * 0.1;
    return { x, y, ...d };
  });

  const createBezierPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cx = (p1.x + p2.x) / 2;
      d += ` C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pathSales = createBezierPath(ptsSales);
  const areaSales = `${pathSales} L ${width} ${svgHeight} L 0 ${svgHeight} Z`;

  const pathPurchases = createBezierPath(ptsPurchases);

  return (
    <div className="w-full relative" style={{ height }}>
      <svg viewBox={`0 -2 ${width} ${svgHeight + 5}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradientSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="0" y1={svgHeight * p} x2={width} y2={svgHeight * p} stroke="#e2e8f0" strokeWidth="0.15" strokeDasharray="0.5" />
        ))}

        {/* Primary Series (Sales Area + Line) */}
        <path d={areaSales} fill="url(#areaGradientSales)" className="transition-all duration-300" />
        <path d={pathSales} fill="none" stroke="#0f766e" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />

        {/* Secondary Series (Purchases Line Only) */}
        <path d={pathPurchases} fill="none" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />

        {/* X-axis labels */}
        {ptsSales.map((p, i) => (
          <text key={i} x={p.x} y={svgHeight + 3.5} fontSize="1.8" fill="#94a3b8" textAnchor="middle">{p.label}</text>
        ))}

        {/* Hover Highlight & Tooltip Line */}
        {hoverIdx !== null && (
          <g>
            <line x1={ptsSales[hoverIdx].x} y1="0" x2={ptsSales[hoverIdx].x} y2={svgHeight} stroke="#cbd5e1" strokeWidth="0.3" strokeDasharray="1" />
            <circle cx={ptsSales[hoverIdx].x} cy={ptsSales[hoverIdx].y} r="1" fill="#0f766e" stroke="white" strokeWidth="0.4" />
            <circle cx={ptsPurchases[hoverIdx].x} cy={ptsPurchases[hoverIdx].y} r="1" fill="#d97706" stroke="white" strokeWidth="0.4" />
          </g>
        )}

        {/* Invisible Hitboxes for Hover */}
        {ptsSales.map((p, i) => {
          const startX = i === 0 ? 0 : (ptsSales[i-1].x + p.x) / 2;
          const endX = i === ptsSales.length - 1 ? width : (p.x + ptsSales[i+1].x) / 2;
          return (
            <rect 
              key={`hitbox-${i}`} 
              x={startX} y={0} width={endX - startX} height={svgHeight} 
              fill="transparent" 
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-crosshair outline-none"
            />
          );
        })}
      </svg>
      
      {/* HTML-based Tooltip */}
      {hoverIdx !== null && (
        <div 
          className="absolute z-10 bg-neutral-900 text-white p-3 rounded-lg shadow-xl text-sm pointer-events-none transition-all duration-100 ease-out"
          style={{ 
            left: `max(10px, min(calc(${(hoverIdx / (data.length - 1)) * 100}% - 70px), calc(100% - 150px)))`, 
            top: '20px' 
          }}
        >
          <div className="font-bold mb-2 border-b border-neutral-700 pb-1">{data[hoverIdx].label}</div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0f766e]"></span> Sales</span>
            <span className="font-mono">₹{data[hoverIdx].sales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 mb-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#d97706]"></span> Purchases</span>
            <span className="font-mono">₹{data[hoverIdx].purchases.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-neutral-700 font-semibold text-neutral-300">
            <span>Margin</span>
            <span className={`font-mono ${data[hoverIdx].sales - data[hoverIdx].purchases >= 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
              {data[hoverIdx].sales - data[hoverIdx].purchases >= 0 ? '+' : ''}
              ₹{(data[hoverIdx].sales - data[hoverIdx].purchases).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#1b80f5', width = 100, height = 30 }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - ((d - min) / range) * 28 - 1;
    return { x, y };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ width: '100%', height: height }}>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface StackedHBarProps {
  data: {
    label: string;
    segments: { label: string; value: number; color: string }[];
  }[];
  formatter?: (n: number) => string;
  onRowClick?: (label: string) => void;
}

export function StackedHBarChart({ data, formatter = (n) => String(n), onRowClick }: StackedHBarProps) {
  const max = Math.max(...data.map((d) => d.segments.reduce((s, seg) => s + seg.value, 0)));
  
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const total = d.segments.reduce((s, seg) => s + seg.value, 0);
        let currentOffset = 0;
        return (
          <div key={i} className="group">
            <div 
              className={`flex items-center justify-between mb-1 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(d.label)}
            >
              <span className={`text-sm font-medium text-neutral-700 ${onRowClick ? 'group-hover:text-primary-600 group-hover:underline' : ''}`}>{d.label}</span>
              <span className="text-sm font-semibold text-neutral-800">{formatter(total)}</span>
            </div>
            
            <div className="h-3 bg-neutral-100 rounded-full flex">
              <div 
                className="h-full flex overflow-hidden rounded-full" 
                style={{ width: max > 0 ? `${(total / max) * 100}%` : '0%' }}
              >
                {d.segments.map((seg, j) => {
                  const width = total > 0 ? (seg.value / total) * 100 : 0;
                  return (
                    <div
                      key={j}
                      className="h-full transition-all duration-500 relative group/tooltip cursor-default"
                      style={{ width: `${width}%`, background: seg.color }}
                    >
                      <div className="absolute opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-neutral-800 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 pointer-events-none">
                        {seg.label}: {formatter(seg.value)} ({width.toFixed(1)}%)
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-neutral-100">
        {Array.from(new Set(data.flatMap(d => d.segments.map(s => s.label)))).map((label, i) => {
          const color = data.flatMap(d => d.segments).find(s => s.label === label)?.color;
          return (
            <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface GroupedBarChartProps {
  data: { label: string; primary: number; secondary: number }[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function GroupedBarChart({ 
  data, 
  height = 240, 
  primaryColor = '#0f766e', 
  secondaryColor = '#ef4444',
  primaryLabel = 'Purchases',
  secondaryLabel = 'Returns'
}: GroupedBarChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const max = Math.max(...data.flatMap((d) => [d.primary, d.secondary])) || 1;
  const width = 100;
  const svgHeight = height / 3;
  const barGroupWidth = width / Math.max(data.length, 1);
  const barWidth = barGroupWidth * 0.35;
  const spacing = barGroupWidth * 0.1;

  return (
    <div className="w-full relative" style={{ height }}>
      <svg viewBox={`0 -2 ${width} ${svgHeight + 5}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="0" y1={svgHeight * p} x2={width} y2={svgHeight * p} stroke="#e2e8f0" strokeWidth="0.15" strokeDasharray="0.5" />
        ))}

        {data.map((d, i) => {
          const xCenter = i * barGroupWidth + barGroupWidth / 2;
          const xPrimary = xCenter - barWidth / 2 - spacing / 2 - barWidth / 2;
          const xSecondary = xCenter + spacing / 2 - barWidth / 2;
          
          const hPrimary = (d.primary / max) * svgHeight * 0.9;
          const hSecondary = (d.secondary / max) * svgHeight * 0.9;
          
          return (
            <g key={i}>
              {/* Primary Bar */}
              <rect x={xPrimary} y={svgHeight - hPrimary} width={barWidth} height={hPrimary} rx="0.5" fill={primaryColor} className="transition-all duration-300" />
              {/* Secondary Bar */}
              <rect x={xSecondary} y={svgHeight - hSecondary} width={barWidth} height={hSecondary} rx="0.5" fill={secondaryColor} className="transition-all duration-300" />
              {/* Label */}
              <text x={xCenter} y={svgHeight + 3.5} fontSize="1.8" fill="#94a3b8" textAnchor="middle">{d.label}</text>
              
              {/* Hover Hitbox */}
              <rect 
                x={i * barGroupWidth} 
                y={0} 
                width={barGroupWidth} 
                height={svgHeight} 
                fill="transparent" 
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-crosshair outline-none"
              />
            </g>
          );
        })}
      </svg>
      
      {/* HTML-based Tooltip */}
      {hoverIdx !== null && (
        <div 
          className="absolute z-10 bg-neutral-900 text-white p-3 rounded-lg shadow-xl text-sm pointer-events-none transition-all duration-100 ease-out"
          style={{ 
            left: `max(10px, min(calc(${(hoverIdx / (data.length - 1)) * 100}% - 70px), calc(100% - 160px)))`, 
            top: '20px' 
          }}
        >
          <div className="font-bold mb-2 border-b border-neutral-700 pb-1">{data[hoverIdx].label}</div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: primaryColor }}></span> {primaryLabel}</span>
            <span className="font-mono">₹{data[hoverIdx].primary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 mb-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: secondaryColor }}></span> {secondaryLabel}</span>
            <span className="font-mono">₹{data[hoverIdx].secondary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-neutral-700 font-semibold text-neutral-300">
            <span>Return Rate</span>
            <span className={`font-mono ${data[hoverIdx].primary > 0 && (data[hoverIdx].secondary / data[hoverIdx].primary) > 0.05 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data[hoverIdx].primary > 0 ? ((data[hoverIdx].secondary / data[hoverIdx].primary) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
