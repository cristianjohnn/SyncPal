"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Clock, TrendingUp, CheckCircle2 } from "lucide-react";

const burndownData = [
  { day: "Day 1", ideal: 100, actual: 100 },
  { day: "Day 2", ideal: 90, actual: 95 },
  { day: "Day 3", ideal: 80, actual: 85 },
  { day: "Day 4", ideal: 70, actual: 75 },
  { day: "Day 5", ideal: 60, actual: 65 },
  { day: "Day 6", ideal: 50, actual: 40 },
  { day: "Day 7", ideal: 40, actual: 35 },
  { day: "Day 8", ideal: 30, actual: 30 },
  { day: "Day 9", ideal: 20, actual: 25 },
  { day: "Day 10", ideal: 10, actual: 15 },
  { day: "Day 11", ideal: 0, actual: 5 },
  { day: "Day 12", ideal: 0, actual: 0 },
];

const statusData = [
  { name: "To Do", value: 35 },
  { name: "In Progress", value: 25 },
  { name: "Review", value: 15 },
  { name: "Done", value: 45 },
];

const STATUS_COLORS = ["#64748b", "#3b82f6", "#f59e0b", "#10b981"];

const velocityData = [
  { sprint: "Sprint 1", points: 42 },
  { sprint: "Sprint 2", points: 48 },
  { sprint: "Sprint 3", points: 45 },
  { sprint: "Sprint 4", points: 55 },
  { sprint: "Sprint 5", points: 52 },
  { sprint: "Sprint 6", points: 60 },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your team's velocity and project health.
        </p>
      </div>

      {/* Time Tracking Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284h</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50.3 pts</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per two-week sprint
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">482</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active boards
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Burndown Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Sprint Burndown</CardTitle>
            <CardDescription>Ideal vs. Actual remaining effort</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value + "pts"} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ideal" name="Ideal Tasks" stroke="#888888" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual Remaining" stroke="#4F6EF7" strokeWidth={3} dot={{ r: 4, fill: "#4F6EF7" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Current distribution of work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={"cell-" + index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Velocity Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Velocity</CardTitle>
            <CardDescription>Story points completed per sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="sprint" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px" }}
                  />
                  <Bar dataKey="points" name="Points Completed" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
