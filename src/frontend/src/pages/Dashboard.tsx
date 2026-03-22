import type { Page } from "@/App";
import type { Appointment, DashboardTotals } from "@/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { backend, isLoading: actorLoading } = useBackend();
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [diseaseData, setDiseaseData] = useState<
    { name: string; count: number }[]
  >([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend || actorLoading) return;
    const today = new Date().toISOString().slice(0, 10);
    setLoading(true);
    Promise.all([
      backend.getDashboardTotals(today),
      backend.getDiseaseFrequency(),
      backend.getAllAppointments(),
    ])
      .then(([t, diseases, appts]) => {
        setTotals(t);
        setDiseaseData(
          diseases.map(([name, count]) => ({ name, count: Number(count) })),
        );
        const sorted = [...appts].sort((a, b) => (a.date < b.date ? 1 : -1));
        setRecentAppointments(sorted.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [backend, actorLoading]);

  const kpiCards = [
    {
      label: "Total Patients",
      value: totals ? Number(totals.totalPatients) : 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      trend: "+12%",
      trendUp: true,
      ocid: "dashboard.total_patients.card",
    },
    {
      label: "Total Doctors",
      value: totals ? Number(totals.totalDoctors) : 0,
      icon: Stethoscope,
      color: "bg-emerald-50 text-emerald-600",
      trend: "+3%",
      trendUp: true,
      ocid: "dashboard.total_doctors.card",
    },
    {
      label: "Total Appointments",
      value: totals ? Number(totals.totalAppointments) : 0,
      icon: CalendarDays,
      color: "bg-violet-50 text-violet-600",
      trend: "+8%",
      trendUp: true,
      ocid: "dashboard.total_appointments.card",
    },
    {
      label: "Today's Appointments",
      value: totals ? Number(totals.todaysAppointments) : 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      trend: "Today",
      trendUp: null,
      ocid: "dashboard.todays_appointments.card",
    },
  ];

  const statusColor = (status: string) => {
    if (status === "booked") return "bg-blue-100 text-blue-700";
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        data-ocid="dashboard.kpi.section"
      >
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              data-ocid={card.ocid}
              className="shadow-card border-border"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton className="mt-1 h-8 w-20" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-foreground">
                        {card.value.toLocaleString()}
                      </p>
                    )}
                    <div className="mt-2">
                      {card.trendUp !== null ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          <TrendingUp className="h-3 w-3" />
                          {card.trend}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Disease Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="dashboard.disease_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
                data-ocid="dashboard.disease_chart.empty_state"
              >
                No disease data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={diseaseData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                    name="Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Appointments
            </CardTitle>
            <button
              type="button"
              data-ocid="dashboard.view_all_appointments.link"
              onClick={() => onNavigate("appointments")}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div
                className="space-y-2 p-4"
                data-ocid="dashboard.recent_appointments.loading_state"
              >
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
                data-ocid="dashboard.recent_appointments.empty_state"
              >
                No appointments yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentAppointments.map((appt, idx) => (
                  <div
                    key={String(appt.id)}
                    data-ocid={`dashboard.recent_appointments.item.${idx + 1}`}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Appointment #{String(appt.id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.date} at {appt.time}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(appt.status)}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
