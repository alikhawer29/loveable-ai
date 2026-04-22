import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Users, FolderTree, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MiniChart({ data, color }: { data: number[]; color: string }) {
  return (
    <svg viewBox="0 0 100 40" className="w-24 h-10" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={data
          .map((v, i) => `${(i / (data.length - 1)) * 100},${40 - (v / Math.max(...data)) * 36}`)
          .join(" ")}
      />
    </svg>
  );
}

function fillDays(start: Date, end: Date, counts: Record<string, number>) {
  const result: { date: string; count: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    result.push({ date: key, count: counts[key] ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function formatLabel(iso: string, days: number) {
  const d = new Date(iso);
  if (days <= 30) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const AdminDashboard = () => {
  const [duration, setDuration] = useState("7");
  const [stats, setStats] = useState({ totalUsers: 0, totalCategories: 0, totalQueries: 0 });
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [activityChartData, setActivityChartData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, categoriesRes, queriesRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase.from("queries").select("id", { count: "exact", head: true }),
        ]);
        setStats({
          totalUsers: usersRes.count ?? 0,
          totalCategories: categoriesRes.count ?? 0,
          totalQueries: queriesRes.count ?? 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      setChartLoading(true);
      try {
        const days = parseInt(duration, 10);
        const now = new Date();
        const start = new Date();
        start.setDate(now.getDate() - days + 1);
        start.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from("profiles")
          .select("created_at")
          .gte("created_at", start.toISOString());

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data ?? []).forEach((row) => {
          const key = row.created_at.slice(0, 10);
          counts[key] = (counts[key] ?? 0) + 1;
        });

        setActivityChartData(fillDays(start, now, counts));
      } catch (err) {
        console.error("Failed to load activity data:", err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchActivity();
  }, [duration]);

  const days = parseInt(duration, 10);

  const statsData = [
    {
      label: "Total Users",
      value: loading ? "—" : String(stats.totalUsers),
      icon: Users,
      color: "hsl(142 71% 45%)",
      bgColor: "hsl(142 71% 45% / 0.12)",
      chartData: [200, 350, 300, 420, 380, 450, 400],
    },
    {
      label: "Total Categories",
      value: loading ? "—" : String(stats.totalCategories),
      icon: FolderTree,
      color: "hsl(35 92% 55%)",
      bgColor: "hsl(35 92% 55% / 0.12)",
      chartData: [300, 280, 350, 320, 400, 380, 420],
    },
    {
      label: "Total Queries",
      value: loading ? "—" : String(stats.totalQueries),
      icon: HelpCircle,
      color: "hsl(45 38% 48%)",
      bgColor: "hsl(45 38% 48% / 0.12)",
      chartData: [150, 280, 220, 350, 300, 280, 320],
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {statsData.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: stat.bgColor }}>
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <MiniChart data={stat.chartData} color={stat.color} />
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Users Activity Review</h2>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7">07 Days</option>
            <option value="30">30 Days</option>
            <option value="90">03 Months</option>
          </select>
        </div>
        <div className="h-80">
          {chartLoading ? (
            <div className="flex flex-col gap-4 h-full justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(0 0% 45%)" }}
                  axisLine={{ stroke: "hsl(0 0% 90%)" }}
                  tickLine={false}
                  tickFormatter={(v) => formatLabel(v, days)}
                  interval={days <= 7 ? 0 : days <= 30 ? 4 : 13}
                  label={{ value: "Date", position: "bottom", offset: 0, fontSize: 12, fill: "hsl(0 0% 45%)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(0 0% 45%)" }}
                  axisLine={{ stroke: "hsl(0 0% 90%)" }}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ value: "New Signups", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: "hsl(0 0% 45%)" }}
                />
                <Tooltip
                  labelFormatter={(v) => formatLabel(v as string, days)}
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(0 0% 90%)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(142 71% 45%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
