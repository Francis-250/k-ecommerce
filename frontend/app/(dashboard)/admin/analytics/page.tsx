import { AdminPageHeader } from "../_components/AdminPageHeader";
import { DashboardPanel } from "../_components/DashboardPanel";
import { SalesChart, ShipmentChart } from "../_components/DashboardCharts";
import { StatCard } from "../_components/StatCard";
import {
  CalendarDays,
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  Users,
} from "lucide-react";
export default function AnalyticsPage() {
  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Sales, revenue, conversion, and customer insights."
      />
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600">
          <CalendarDays size={15} />
          Last 30 days
        </button>
        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600">
          Compare: previous period
        </button>
        <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600">
          <option>USD</option>
          <option>EUR</option>
        </select>
      </div>
      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value="$100.4K"
          change="+12.5%"
          icon={DollarSign}
          theme="green"
        />
        <StatCard
          label="Visitors"
          value="48.2K"
          change="+8.4%"
          icon={Users}
          theme="blue"
        />
        <StatCard
          label="Orders"
          value="1.6K"
          change="+10.3%"
          icon={ShoppingCart}
          theme="orange"
        />
        <StatCard
          label="Conversion"
          value="3.8%"
          change="+0.6%"
          icon={MousePointerClick}
          theme="violet"
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Revenue trend">
          <SalesChart />
        </DashboardPanel>
        <DashboardPanel title="Order distribution">
          <ShipmentChart />
        </DashboardPanel>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <DashboardPanel title="Sales by channel">
          <div className="space-y-4">
            {[
              { label: "Online store", value: "$68,420", percent: 68 },
              { label: "Mobile", value: "$21,860", percent: 22 },
              { label: "Social", value: "$10,120", percent: 10 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <strong className="font-medium text-slate-800">
                    {item.value}
                  </strong>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
        <DashboardPanel title="Top products">
          <div className="divide-y divide-slate-100">
            {[
              { name: "Printed Summer", units: 184, sales: "$8,280" },
              { name: "Fashion Handbag", units: 96, sales: "$8,160" },
              { name: "Blouse Collection", units: 142, sales: "$5,396" },
              { name: "Faded Short Sleeve", units: 74, sales: "$5,180" },
            ].map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <span className="grid size-7 place-items-center rounded-md bg-slate-100 text-xs text-slate-500">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-slate-500">{item.units} units</span>
                <strong className="font-medium text-slate-800">
                  {item.sales}
                </strong>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>
    </>
  );
}
