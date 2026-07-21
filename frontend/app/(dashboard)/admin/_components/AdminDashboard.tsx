import {
  ArrowUpRight,
  Boxes,
  ChevronDown,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import { DashboardPanel } from "./DashboardPanel";
import { SalesChart, ShipmentChart } from "./DashboardCharts";
import { StatCard } from "./StatCard";

const orders = [
  {
    product: "Linen summer dress",
    id: "#127381",
    customer: "Alex Almond",
    date: "12 Nov 2025",
    items: 2,
    total: "$240",
    status: "Pending",
  },
  {
    product: "Classic leather bag",
    id: "#127382",
    customer: "Anitra Sen",
    date: "10 Nov 2025",
    items: 1,
    total: "$220",
    status: "Pending",
  },
  {
    product: "Floral midi dress",
    id: "#127383",
    customer: "John Doe",
    date: "12 Nov 2025",
    items: 2,
    total: "$180",
    status: "Completed",
  },
  {
    product: "Essential cotton top",
    id: "#127384",
    customer: "Alisha Madrin",
    date: "8 Nov 2025",
    items: 3,
    total: "$195",
    status: "Processing",
  },
  {
    product: "Everyday denim",
    id: "#127385",
    customer: "Alex Holand",
    date: "7 Nov 2025",
    items: 1,
    total: "$120",
    status: "Completed",
  },
];
const categories = [
  { label: "Dresses", value: 82, color: "bg-violet-500" },
  { label: "Shirts", value: 70, color: "bg-red-500" },
  { label: "Tops", value: 56, color: "bg-amber-400" },
  { label: "Pants", value: 45, color: "bg-emerald-500" },
  { label: "Accessories", value: 33, color: "bg-sky-500" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Processing: "bg-sky-50 text-sky-700",
  Pending: "bg-amber-50 text-amber-700",
};

export function AdminDashboard() {
  return (
    <div className="space-y-5">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Store statistics"
      >
        <StatCard
          label="Total sales"
          value="$100.4K"
          change="+12.5%"
          icon={DollarSign}
          theme="violet"
        />
        <StatCard
          label="Total customers"
          value="20.4K"
          change="+8.2%"
          icon={Users}
          theme="blue"
        />
        <StatCard
          label="Total products"
          value="2.4K"
          change="+4.1%"
          icon={ShoppingBag}
          theme="orange"
        />
        <StatCard
          label="Total orders"
          value="1.6K"
          change="+10.3%"
          icon={PackageCheck}
          theme="green"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <DashboardPanel
          title="Sales statistics"
          action={
            <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              Monthly <ChevronDown size={14} />
            </button>
          }
        >
          <SalesChart />
        </DashboardPanel>
        <DashboardPanel
          title="Shipment status"
          action={
            <span className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
              Today
            </span>
          }
        >
          <ShipmentChart />
        </DashboardPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <DashboardPanel
          title="Recent orders"
          action={
            <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
              Sort by <ChevronDown size={14} />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  {["Product", "Customer", "Items", "Total", "Status"].map(
                    (heading) => (
                      <th key={heading} className="px-3 py-3 font-medium">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {order.product}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{order.date}</td>
                    <td className="px-3 py-3 text-slate-500">{order.items}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {order.total}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status === "Pending" && (
                          <span className="ml-1 inline-block h-1 w-1 animate-pulse rounded-full bg-amber-700" />
                        )}
                        {order.status === "Processing" && (
                          <span className="ml-1 inline-block h-1 w-1 animate-pulse rounded-full bg-sky-700" />
                        )}
                        {order.status === "Completed" && (
                          <span className="ml-1 inline-block h-1 w-1 animate-pulse rounded-full bg-emerald-700" />
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>
        <DashboardPanel
          title="Sales overview"
          action={
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} /> 4.9%
            </span>
          }
        >
          <div className="mb-5">
            <p className="text-xs text-slate-500">Total sales</p>
            <p className="text-2xl font-semibold text-slate-900">9,824</p>
          </div>
          <div className="space-y-5">
            {categories.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-400">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>
    </div>
  );
}
