"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SalesChartPoint = { month: string; value: number };
export type ShipmentChartPoint = {
  name: string;
  value: number;
  color: string;
};

const previewSales: SalesChartPoint[] = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 54 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 57 },
  { month: "May", value: 73 },
  { month: "Jun", value: 66 },
  { month: "Jul", value: 77 },
  { month: "Aug", value: 49 },
  { month: "Sep", value: 71 },
  { month: "Oct", value: 86 },
  { month: "Nov", value: 61 },
  { month: "Dec", value: 94 },
];
const previewShipments: ShipmentChartPoint[] = [
  { name: "Delivered", value: 42, color: "#059669" },
  { name: "On delivery", value: 28, color: "#14b8a6" },
  { name: "Returned", value: 12, color: "#ef4444" },
  { name: "Canceled", value: 18, color: "#f59e0b" },
];

export function SalesChart({
  data = previewSales,
}: {
  data?: SalesChartPoint[];
}) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            cursor={{ stroke: "#059669", strokeDasharray: "4 4" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "none",
              fontSize: 13,
            }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#salesFill)"
            activeDot={{
              r: 4,
              fill: "#059669",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShipmentChart({
  data = previewShipments,
}: {
  data?: ShipmentChartPoint[];
}) {
  return (
    <div>
      <div className="mx-auto h-48 max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              stroke="white"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, "Orders"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "none",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-xs text-slate-600"
          >
            <span
              className="size-2.5 rounded-sm"
              style={{ background: item.color }}
            />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
