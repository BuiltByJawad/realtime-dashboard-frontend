'use client';

import { useGetOverviewQuery } from '@/features/analytics/api/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function AnalyticsPage() {
  const STATUS_COLORS: Record<string, string> = {
    active: '#22c55e',
    inactive: '#f97316',
  };
  const CATEGORY_COLORS = ['#0ea5e9', '#6366f1', '#f97316', '#22c55e', '#e11d48'];
  const statusChartConfig: ChartConfig = {
    active: { label: 'Active', color: STATUS_COLORS.active },
    inactive: { label: 'Inactive', color: STATUS_COLORS.inactive },
  };
  const categoryChartConfig: ChartConfig = {
    category: { label: 'Category', color: CATEGORY_COLORS[0] },
  };

  const { data, isLoading, isError } = useGetOverviewQuery();
  const overview = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of products by status, category, and inventory value.
        </p>
      </div>

      {isLoading && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="text-sm text-slate-300">
            Loading analytics...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-red-900 bg-red-950/40">
          <CardContent className="text-sm text-red-300">
            Failed to load analytics.
          </CardContent>
        </Card>
      )}

      {overview && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">
                  Total inventory value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  ${overview?.totalInventoryValue?.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">
                  By status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-slate-300">
                  {overview?.byStatus.map((s) => (
                    <li key={s?.status}>
                      <span className="capitalize">{s?.status}</span>: {s?.count}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">
                  By category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-slate-300">
                  {overview?.byCategory?.map((c) => (
                    <li key={c?.category}>
                      {c?.category}: {c?.count}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">
                  Products by status
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Distribution of active vs inactive products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={statusChartConfig}
                  className="h-[260px] w-full"
                >
                  <BarChart data={overview?.byStatus}>
                    <CartesianGrid
                      stroke="rgba(148,163,184,0.25)"
                      vertical={false}
                      fill="#020617"
                      fillOpacity={1}
                    />
                    <XAxis dataKey="status" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count">
                      {overview?.byStatus?.map((s) => (
                        <Cell
                          key={s?.status}
                          fill={`var(--color-${s?.status})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">
                  Products by category
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  How your products are split across categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={categoryChartConfig}
                  className="h-[260px] w-full bg-slate-950/80"
                >
                  <PieChart style={{ backgroundColor: 'transparent' }}>
                    <Pie
                      data={overview?.byCategory}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry?.category} (${entry?.count})`
                      }
                    >
                      {overview?.byCategory?.map((c, index) => (
                        <Cell
                          key={c?.category}
                          fill={
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}