import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function Dashboard() {
  // Mock data - will be replaced with actual backend response
  const mockData = {
    mean_prob: 0.72,
    std: 0.15,
    ci_5: 0.53,
    ci_95: 0.87,
    all_samples: Array.from({ length: 100 }, (_, i) => ({
      probability: i / 100,
      density:
        Math.exp(-Math.pow((i / 100 - 0.72) / 0.15, 2) / 2) /
        (0.15 * Math.sqrt(2 * Math.PI)),
    })),
    risk_category: "High Risk",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Risk Assessment</h1>
              <p className="text-gray-400 mt-1">
                Project delay probability analysis
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                Last 30 days
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#111111] border border-gray-800 hover:border-gray-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-gray-400 text-sm font-medium">
                  Delay Probability
                </div>
                <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2L6 10M6 10L9 7M6 10L3 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  High
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {(mockData.mean_prob * 100).toFixed(0)}%
              </div>
              <div className="text-gray-400 text-sm">
                Mean probability of delay
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border border-gray-800 hover:border-gray-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-gray-400 text-sm font-medium">
                  Uncertainty
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                  ±{(mockData.std * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {(mockData.std * 100).toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">Standard deviation</div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border border-gray-800 hover:border-gray-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-gray-400 text-sm font-medium">
                  Lower Bound
                </div>
                <div className="text-gray-500 text-sm font-medium">
                  5th percentile
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {(mockData.ci_5 * 100).toFixed(0)}%
              </div>
              <div className="text-gray-400 text-sm">
                Credible interval start
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border border-gray-800 hover:border-gray-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-gray-400 text-sm font-medium">
                  Upper Bound
                </div>
                <div className="text-gray-500 text-sm font-medium">
                  95th percentile
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {(mockData.ci_95 * 100).toFixed(0)}%
              </div>
              <div className="text-gray-400 text-sm">Credible interval end</div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart */}
        <Card className="bg-[#111111] border border-gray-800 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-white">
                  Probability Distribution
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  90% credible interval: {(mockData.ci_5 * 100).toFixed(0)}% -{" "}
                  {(mockData.ci_95 * 100).toFixed(0)}%
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors">
                  3 months
                </button>
                <button className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-xs font-medium hover:bg-gray-700 transition-colors">
                  30 days
                </button>
                <button className="px-3 py-1.5 bg-gray-700 text-white rounded-md text-xs font-medium">
                  7 days
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={mockData.all_samples}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis
                  dataKey="probability"
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  stroke="#666"
                  tick={{ fill: "#999" }}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#999" }}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [value.toFixed(3), "Density"]}
                  labelFormatter={(value) =>
                    `Probability: ${(value * 100).toFixed(1)}%`
                  }
                />
                {/* Shaded CI region */}
                <Area
                  type="monotone"
                  dataKey={(d) =>
                    d.probability >= mockData.ci_5 &&
                    d.probability <= mockData.ci_95
                      ? d.density
                      : 0
                  }
                  fill="url(#colorDensity)"
                  stroke="none"
                />
                {/* Full distribution */}
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="none"
                />
                {/* Mean line */}
                <ReferenceLine
                  x={mockData.mean_prob}
                  stroke="#fff"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Mean: ${(mockData.mean_prob * 100).toFixed(1)}%`,
                    position: "top",
                    fill: "#fff",
                    fontWeight: "bold",
                  }}
                />
                {/* CI boundaries */}
                <ReferenceLine
                  x={mockData.ci_5}
                  stroke="#666"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <ReferenceLine
                  x={mockData.ci_95}
                  stroke="#666"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Gauge Meter */}
        <Card className="bg-[#111111] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Risk Level Gauge
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Current project risk assessment
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col items-center justify-center py-8">
              {/* SVG Gauge */}
              <svg
                width="100%"
                height="280"
                viewBox="0 0 450 280"
                className="max-w-2xl"
              >
                <defs>
                  {/* Modern gradients for each zone */}
                  <linearGradient
                    id="lowGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient
                    id="modGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient
                    id="highGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                  </linearGradient>

                  {/* Glow effects */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter id="shadow">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="4"
                      floodOpacity="0.4"
                    />
                  </filter>

                  <filter id="innerGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    <feComposite in2="SourceGraphic" operator="in" />
                  </filter>
                </defs>

                <g transform="translate(225, 210)">
                  {/* Background dark track */}
                  <path
                    d="M -155,0 A 155,155 0 0,1 155,0 L 130,0 A 130,130 0 0,0 -130,0 Z"
                    fill="#0a0a0a"
                  />

                  {/* Low Risk - White (0-33%) - Filled segment */}
                  <path
                    d="M -150,0 A 150,150 0 0,1 -75,-130 L -65,-112.5 A 130,130 0 0,0 -130,0 Z"
                    fill="url(#lowGrad)"
                    filter="url(#glow)"
                  />

                  {/* Moderate Risk - Yellow (33-66%) - Filled segment */}
                  <path
                    d="M -75,-130 A 150,150 0 0,1 75,-130 L 65,-112.5 A 130,130 0 0,0 -65,-112.5 Z"
                    fill="url(#modGrad)"
                    filter="url(#glow)"
                  />

                  {/* High Risk - Red (66-100%) - Filled segment */}
                  <path
                    d="M 75,-130 A 150,150 0 0,1 150,0 L 130,0 A 130,130 0 0,0 65,-112.5 Z"
                    fill="url(#highGrad)"
                    filter="url(#glow)"
                  />

                  {/* Tick marks */}
                  {Array.from({ length: 13 }).map((_, i) => {
                    const angle = -180 + i * 15;
                    const isMajor = i % 4 === 0;
                    const length = isMajor ? 15 : 8;
                    const width = isMajor ? 2 : 1;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = Math.cos(rad) * 138;
                    const y1 = Math.sin(rad) * 138;
                    const x2 = Math.cos(rad) * (138 - length);
                    const y2 = Math.sin(rad) * (138 - length);

                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#444"
                        strokeWidth={width}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Needle */}
                  <g transform={`rotate(${(mockData.mean_prob - 0.5) * 180})`}>
                    <path
                      d="M -2,8 L -1,-130 L 0,-135 L 1,-130 L 2,8 Z"
                      fill="url(#needleGrad)"
                      filter="url(#shadow)"
                    />
                    <circle
                      cx="0"
                      cy="-130"
                      r="3"
                      fill="#ff4444"
                      filter="url(#glow)"
                    />
                  </g>

                  <linearGradient
                    id="needleGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#cccccc" />
                  </linearGradient>

                  {/* Modern center hub with depth */}
                  <circle cx="0" cy="0" r="16" fill="#0a0a0a" opacity="0.5" />
                  <circle
                    cx="0"
                    cy="0"
                    r="14"
                    fill="#1a1a1a"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="8"
                    fill="#2a2a2a"
                    filter="url(#innerGlow)"
                  />
                  <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.8" />

                  {/* Labels positioned correctly along arc */}
                  <text
                    x="-128"
                    y="15"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    LOW
                  </text>
                  <text
                    x="0"
                    y="-152"
                    fill="#eab308"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    MODERATE
                  </text>
                  <text
                    x="128"
                    y="15"
                    fill="#ef4444"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    HIGH
                  </text>

                  {/* Percentage markers */}
                  <text
                    x="-165"
                    y="8"
                    fill="#666"
                    fontSize="11"
                    fontWeight="600"
                  >
                    0%
                  </text>
                  <text
                    x="0"
                    y="-165"
                    fill="#666"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    50%
                  </text>
                  <text
                    x="165"
                    y="8"
                    fill="#666"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    100%
                  </text>
                </g>
              </svg>

              {/* Risk percentage display */}
              <div className="mt-8 text-center">
                <div className="relative inline-block">
                  <div className="text-7xl font-bold bg-gradient-to-br from-orange-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-3 tracking-tight">
                    {Math.round(mockData.mean_prob * 100)}%
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-2xl -z-10 rounded-full" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-6 font-semibold">
                  Probability of Delay
                </div>
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-red-500/40 rounded-full backdrop-blur-sm shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                  <span className="text-red-400 font-bold text-base tracking-wider">
                    {mockData.risk_category.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
