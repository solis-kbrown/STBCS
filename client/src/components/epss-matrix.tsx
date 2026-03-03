import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Cve } from "@/lib/api";

interface EpssMatrixProps {
  cves: Cve[];
}

interface TooltipData {
  cve: Cve;
  x: number;
  y: number;
}

const QUADRANT_LABELS = [
  { label: "ACT NOW", desc: "Critical & likely exploited", color: "text-red-400", bg: "bg-red-500/8" },
  { label: "WATCH", desc: "Low severity but targeted", color: "text-yellow-400", bg: "bg-yellow-500/8" },
  { label: "PLAN", desc: "Severe but unlikely soon", color: "text-orange-400", bg: "bg-orange-500/8" },
  { label: "MONITOR", desc: "Low priority", color: "text-green-400", bg: "bg-green-500/8" },
];

export default function EpssMatrix({ cves }: EpssMatrixProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const dataPoints = useMemo(() => {
    return cves.filter(c => c.epssScore != null && c.score != null && c.score > 0);
  }, [cves]);

  const quadrantCounts = useMemo(() => {
    let actNow = 0, watch = 0, plan = 0, monitor = 0;
    for (const c of dataPoints) {
      const cvss = c.score || 0;
      const epss = c.epssScore || 0;
      if (cvss >= 5 && epss >= 0.5) actNow++;
      else if (cvss < 5 && epss >= 0.5) watch++;
      else if (cvss >= 5 && epss < 0.5) plan++;
      else monitor++;
    }
    return [actNow, watch, plan, monitor];
  }, [dataPoints]);

  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const width = 800;
  const height = 500;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const scaleX = useCallback((cvss: number) => {
    return padding.left + (cvss / 10) * plotW;
  }, [plotW, padding.left]);

  const scaleY = useCallback((epss: number) => {
    return padding.top + plotH - epss * plotH;
  }, [plotH, padding.top]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || dataPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    const my = ((e.clientY - rect.top) / rect.height) * height;

    let closest: Cve | null = null;
    let minDist = Infinity;
    for (const c of dataPoints) {
      const cx = scaleX(c.score || 0);
      const cy = scaleY(c.epssScore || 0);
      const d = Math.hypot(cx - mx, cy - my);
      if (d < minDist && d < 20) {
        minDist = d;
        closest = c;
      }
    }

    if (closest) {
      setTooltip({
        cve: closest,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setTooltip(null);
    }
  }, [dataPoints, scaleX, scaleY]);

  const handleClick = useCallback(() => {
    if (tooltip?.cve.cveId) {
      window.open(`https://nvd.nist.gov/vuln/detail/${tooltip.cve.cveId}`, '_blank');
    }
  }, [tooltip]);

  const getDotColor = (cve: Cve) => {
    if (cve.inCisaKev) return "#ef4444";
    const epss = cve.epssScore || 0;
    const cvss = cve.score || 0;
    if (cvss >= 5 && epss >= 0.5) return "#f97316";
    if (epss >= 0.5) return "#eab308";
    if (cvss >= 5) return "#3b82f6";
    return "#6b7280";
  };

  const midX = scaleX(5);
  const midY = scaleY(0.5);

  return (
    <div className="space-y-4" data-testid="epss-matrix-container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUADRANT_LABELS.map((q, i) => (
          <Card key={q.label} className={`border-white/5 ${q.bg}`} data-testid={`card-quadrant-${q.label.toLowerCase().replace(/\s/g, '-')}`}>
            <CardContent className="p-3 text-center">
              <div className={`text-lg font-bold ${q.color}`}>{quadrantCounts[i]}</div>
              <div className="text-xs font-semibold text-white">{q.label}</div>
              <div className="text-[10px] text-muted-foreground">{q.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-card/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <span className="text-xs text-muted-foreground">{dataPoints.length} CVEs plotted</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                CISA KEV
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                Act Now
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                Watch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Plan
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" />
                Monitor
              </span>
            </div>
          </div>

          <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
              onClick={handleClick}
              style={{ cursor: tooltip ? 'pointer' : 'default' }}
              data-testid="epss-matrix-chart"
            >
              <rect x={padding.left} y={padding.top} width={plotW} height={plotH} fill="rgba(255,255,255,0.02)" rx="4" />

              <rect x={midX} y={padding.top} width={plotW - (midX - padding.left)} height={midY - padding.top} fill="rgba(239,68,68,0.06)" />
              <rect x={padding.left} y={padding.top} width={midX - padding.left} height={midY - padding.top} fill="rgba(234,179,8,0.06)" />
              <rect x={midX} y={midY} width={plotW - (midX - padding.left)} height={padding.top + plotH - midY} fill="rgba(249,115,22,0.06)" />
              <rect x={padding.left} y={midY} width={midX - padding.left} height={padding.top + plotH - midY} fill="rgba(34,197,94,0.06)" />

              <text x={midX + (plotW - (midX - padding.left)) / 2} y={padding.top + 18} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize="11" fontWeight="bold">ACT NOW</text>
              <text x={padding.left + (midX - padding.left) / 2} y={padding.top + 18} textAnchor="middle" fill="rgba(234,179,8,0.5)" fontSize="11" fontWeight="bold">WATCH</text>
              <text x={midX + (plotW - (midX - padding.left)) / 2} y={padding.top + plotH - 8} textAnchor="middle" fill="rgba(249,115,22,0.5)" fontSize="11" fontWeight="bold">PLAN</text>
              <text x={padding.left + (midX - padding.left) / 2} y={padding.top + plotH - 8} textAnchor="middle" fill="rgba(34,197,94,0.5)" fontSize="11" fontWeight="bold">MONITOR</text>

              <line x1={midX} y1={padding.top} x2={midX} y2={padding.top + plotH} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />
              <line x1={padding.left} y1={midY} x2={padding.left + plotW} y2={midY} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />

              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <g key={`x-${v}`}>
                  <line x1={scaleX(v)} y1={padding.top + plotH} x2={scaleX(v)} y2={padding.top + plotH + 5} stroke="rgba(255,255,255,0.3)" />
                  <text x={scaleX(v)} y={padding.top + plotH + 20} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">{v}</text>
                </g>
              ))}
              <text x={padding.left + plotW / 2} y={height - 5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="bold">CVSS Score →</text>

              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(v => (
                <g key={`y-${v}`}>
                  <line x1={padding.left - 5} y1={scaleY(v)} x2={padding.left} y2={scaleY(v)} stroke="rgba(255,255,255,0.3)" />
                  <text x={padding.left - 10} y={scaleY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="10">{(v * 100).toFixed(0)}%</text>
                </g>
              ))}
              <text x={15} y={padding.top + plotH / 2} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="bold" transform={`rotate(-90, 15, ${padding.top + plotH / 2})`}>EPSS Probability ↑</text>

              {dataPoints.map((cve) => (
                <circle
                  key={cve.id}
                  cx={scaleX(cve.score || 0)}
                  cy={scaleY(cve.epssScore || 0)}
                  r={cve.inCisaKev ? 5 : 3.5}
                  fill={getDotColor(cve)}
                  opacity={tooltip?.cve.id === cve.id ? 1 : 0.7}
                  stroke={tooltip?.cve.id === cve.id ? "white" : "none"}
                  strokeWidth={2}
                />
              ))}
            </svg>

            {tooltip && (
              <div
                className="absolute z-50 pointer-events-none"
                style={{
                  left: Math.min(tooltip.x + 12, (svgRef.current?.getBoundingClientRect().width || 600) - 260),
                  top: Math.max(tooltip.y - 80, 0),
                }}
              >
                <div className="bg-zinc-900 border border-white/20 rounded-lg p-3 shadow-xl min-w-[220px]" data-testid="epss-matrix-tooltip">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs border-white/20">{tooltip.cve.cveId}</Badge>
                    {tooltip.cve.inCisaKev && <Badge className="bg-red-600 text-white text-[10px]">KEV</Badge>}
                  </div>
                  <p className="text-xs text-white font-medium line-clamp-1 mb-2">{tooltip.cve.platform || 'Unknown'}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <span className="text-muted-foreground">CVSS:</span>
                    <span className={`font-bold ${(tooltip.cve.score || 0) >= 7 ? 'text-red-400' : (tooltip.cve.score || 0) >= 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {tooltip.cve.score?.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">EPSS:</span>
                    <span className={`font-bold ${(tooltip.cve.epssScore || 0) >= 0.5 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {((tooltip.cve.epssScore || 0) * 100).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">Severity:</span>
                    <span className="text-white">{tooltip.cve.severity || 'N/A'}</span>
                    {tooltip.cve.vendor && (
                      <>
                        <span className="text-muted-foreground">Vendor:</span>
                        <span className="text-white">{tooltip.cve.vendor}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Click to view on NVD →</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
