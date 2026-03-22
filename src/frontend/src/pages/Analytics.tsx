import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { Activity, Stethoscope, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#2563EB",
  "#38BDF8",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function Analytics() {
  const { backend, isLoading: actorLoading } = useBackend();
  const [diseaseData, setDiseaseData] = useState<
    { name: string; count: number }[]
  >([]);
  const [admissionData, setAdmissionData] = useState<
    { month: string; count: number }[]
  >([]);
  const [workloadData, setWorkloadData] = useState<
    { name: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend || actorLoading) return;
    setLoading(true);
    Promise.all([
      backend.getDiseaseFrequency(),
      backend.getAdmissionsByDate(),
      backend.getDoctorAppointmentCounts(),
      backend.getAllDoctors(),
    ])
      .then(([diseases, admissions, workload, docs]) => {
        setDiseaseData(
          diseases.map(([name, count]) => ({ name, count: Number(count) })),
        );

        const monthMap = new Map<string, number>();
        for (const [date, count] of admissions) {
          const month = date.slice(0, 7);
          monthMap.set(month, (monthMap.get(month) ?? 0) + Number(count));
        }
        setAdmissionData(
          Array.from(monthMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count })),
        );

        const docMap = new Map(docs.map((d) => [d.id, d.name]));
        setWorkloadData(
          workload.map(([id, count]) => ({
            name: docMap.get(id) ?? `Dr. #${id}`,
            count: Number(count),
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [backend, actorLoading]);

  const topDisease = [...diseaseData].sort((a, b) => b.count - a.count)[0];
  const busyDoctor = [...workloadData].sort((a, b) => b.count - a.count)[0];
  const totalAdmissions = admissionData.reduce((s, d) => s + d.count, 0);

  const statCards = [
    {
      label: "Total Admissions",
      value: totalAdmissions,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Disease Types",
      value: diseaseData.length,
      icon: Activity,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Top Disease",
      value: topDisease?.name ?? "—",
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Busiest Doctor",
      value: busyDoctor?.name ?? "—",
      icon: Stethoscope,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        data-ocid="analytics.summary.section"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="shadow-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton className="mt-1 h-7 w-24" />
                    ) : (
                      <p className="mt-1 text-2xl font-bold text-foreground truncate max-w-[140px]">
                        {card.value}
                      </p>
                    )}
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
              Disease Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.disease_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.disease_chart.empty_state"
              >
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={diseaseData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    horizontal={false}
                  />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
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
                    radius={[0, 4, 4, 0]}
                    name="Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Patient Admissions by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.admissions_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : admissionData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.admissions_chart.empty_state"
              >
                No admission data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={admissionData}
                  margin={{ top: 4, right: 16, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#2563EB" }}
                    name="Admissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Doctor Workload (Appointments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.workload_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : workloadData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.workload_chart.empty_state"
              >
                No workload data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={workloadData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
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
                    radius={[4, 4, 0, 0]}
                    name="Appointments"
                  >
                    {workloadData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            workloadData.indexOf(entry) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                data-ocid="analytics.disease_pie.loading_state"
              >
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.disease_pie.empty_state"
              >
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {diseaseData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            diseaseData.indexOf(entry) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
