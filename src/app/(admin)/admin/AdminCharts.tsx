"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { AdminDashboardChartsData } from "@/lib/types/dto";
import { ArrowUpRight, TrendingUp, Filter, CheckCircle2 } from "lucide-react";

interface AdminChartsProps {
  chartsData: AdminDashboardChartsData;
  isStaff?: boolean;
}

export default function AdminCharts({ chartsData, isStaff = false }: AdminChartsProps) {
  const formatNairaShort = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
    return `₦${value}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Signups per day */}
      <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-base-content flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>User Signups Trend</span>
            </h3>
            <p className="text-xs text-base-content/60 font-medium">Daily user registrations</p>
          </div>
          <span className="badge badge-outline text-[11px] font-bold">30 Days</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartsData.signupsPerDay}>
              <defs>
                <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#signupsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Revenue per month split by service type */}
      <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-base-content flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              <span>Revenue by Service</span>
            </h3>
            <p className="text-xs text-base-content/60 font-medium">Monthly breakdown (NGN)</p>
          </div>
          {isStaff && (
            <span className="badge badge-warning text-[10px] font-bold">Restricted View</span>
          )}
        </div>

        {isStaff ? (
          <div className="h-64 flex flex-col items-center justify-center bg-base-200/40 rounded-2xl p-6 text-center space-y-2">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-bold text-base-content/70">Revenue figures hidden for Staff role</p>
            <p className="text-[11px] text-base-content/50">Contact Admin for financial report permissions</p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData.revenuePerMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNairaShort}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `₦${Number(value || 0).toLocaleString("en-NG")}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="digital" name="Digital Suite" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                <Bar dataKey="ecosystem" name="Ecosystem" stackId="a" fill="#10b981" />
                <Bar dataKey="billboard" name="Billboard" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 3: Conversion Funnel */}
      <div className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-base-content flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-500" />
            <span>Conversion Funnel</span>
          </h3>
          <p className="text-xs text-base-content/60 font-medium">Pipeline conversion % between steps</p>
        </div>

        <div className="space-y-3 pt-2">
          {chartsData.conversionFunnel.map((step, idx) => (
            <div key={step.step} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-base-content/80 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step.step}</span>
                </span>
                <span className="text-base-content">
                  {step.count} <span className="text-base-content/50 font-normal">({step.conversionRate}%)</span>
                </span>
              </div>
              <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(step.conversionRate, 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
