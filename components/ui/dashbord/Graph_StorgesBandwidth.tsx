"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  Line,
  YAxis,
  ComposedChart,
} from "recharts";

// Format a GB value into a human-readable label
const formatGB = (value: number): string => {
  if (value === 0) return "0 B";
  if (value < 0.001) return `${(value * 1024 * 1024).toFixed(2)} KB`;
  if (value < 1) return `${(value * 1024).toFixed(2)} MB`;
  return `${value.toFixed(2)} GB`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const date = payload[0]?.payload?.date;
  return (
    <div className="bg-(--bg-primary) border border-(--border) rounded-sm shadow-md px-3 py-2 text-xs">
      <p className="font-bold text-(--text-primary) mb-1">{date || label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mt-0.5">
          <span
            className="w-2.5 h-2.5 rounded-md border-2 inline-block"
            style={{ borderColor: entry.color, backgroundColor: "transparent" }}
          />
          <span className="text-(--text-secondary) capitalize">
            {entry.dataKey}:
          </span>
          <span className="font-bold text-(--text-primary)">
            {formatGB(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const getBestUnit = (
  data: any[],
  key: "storage" | "bandwidth",
  isMobile: boolean,
) => {
  const maxVal =
    data && data.length > 0 ? Math.max(...data.map((d) => d[key] || 0)) : 0;

  if (maxVal <= 0) {
    return {
      unit: "GB",
      format: (v: number) => (isMobile ? "0" : "0 B"),
    };
  }
  if (maxVal < 0.001) {
    return {
      unit: "KB",
      format: (v: number) => {
        if (v === 0) return isMobile ? "0" : "0 B";
        const val = v * 1024 * 1024;
        return isMobile ? `${val.toFixed(0)}K` : `${val.toFixed(2)} KB`;
      },
    };
  }
  if (maxVal < 1) {
    return {
      unit: "MB",
      format: (v: number) => {
        if (v === 0) return isMobile ? "0" : "0 B";
        const val = v * 1024;
        return isMobile ? `${val.toFixed(0)}M` : `${val.toFixed(2)} MB`;
      },
    };
  }
  return {
    unit: "GB",
    format: (v: number) => {
      if (v === 0) return isMobile ? "0" : "0 B";
      return isMobile ? `${v.toFixed(1)}G` : `${v.toFixed(2)} GB`;
    },
  };
};

export default function Graph_StorgesBandwidth({
  chartData,
}: {
  chartData: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return <div className="h-[2px] w-full" />;
  }

  // Determine units and formats based on data
  const storageUnit = getBestUnit(chartData, "storage", isMobile);
  const bandwidthUnit = getBestUnit(chartData, "bandwidth", isMobile);

  return (
    <div className="h-full min-h-[260px] w-full flex flex-col justify-between gap-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs font-bold text-(--text-secondary) shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md border-2 border-[#14b8a6] bg-transparent" />
          <span>Storage ({storageUnit.unit})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md border-2 border-[#3b82f6] bg-transparent" />
          <span>Bandwidth ({bandwidthUnit.unit})</span>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={
              isMobile
                ? { top: 5, right: 5, left: 5, bottom: 5 }
                : { top: 5, right: 20, left: 20, bottom: 5 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            />

            <YAxis
              yAxisId="left"
              tick={{ fontSize: 9, fill: "var(--text-muted)" }}
              tickFormatter={storageUnit.format}
              width={isMobile ? 32 : 70}
              label={
                isMobile
                  ? undefined
                  : {
                      value: "Storage",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: {
                        textAnchor: "middle",
                        fill: "var(--text-secondary)",
                        fontSize: 10,
                        fontWeight: 500,
                      },
                    }
              }
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9, fill: "var(--text-muted)" }}
              tickFormatter={bandwidthUnit.format}
              width={isMobile ? 32 : 70}
              label={
                isMobile
                  ? undefined
                  : {
                      value: "Bandwidth",
                      angle: 90,
                      position: "insideRight",
                      offset: 10,
                      style: {
                        textAnchor: "middle",
                        fill: "var(--text-secondary)",
                        fontSize: 10,
                        fontWeight: 500,
                      },
                    }
              }
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="storage"
              fill="#14b8a6"
              stroke="#14b8a6"
              fillOpacity={0.15}
              strokeWidth={3}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bandwidth"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                r: 4,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
