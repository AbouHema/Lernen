"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuizHistory } from "@/lib/storage";

export function ProgressChart() {
  const [data, setData] = React.useState<{ date: string; score: number }[]>([]);

  React.useEffect(() => {
    setData(getQuizHistory());
  }, []);

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle>Quiz-Verlauf</CardTitle>
      </CardHeader>
      <CardContent className="h-60">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Quiz-Daten vorhanden.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3B5BFF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
