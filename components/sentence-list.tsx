"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { sentences } from "@/data/sentences";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

export function SentenceList() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const filtered = React.useMemo(() => {
    const term = query.toLowerCase();
    return sentences.filter((item) => [item.arabic, item.german].join(" ").toLowerCase().includes(term));
  }, [query]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="card-surface">
        <CardContent className="flex items-center gap-3 p-6">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardContent>
      </Card>

      {loading && (
        <Card className="card-surface">
          <CardContent className="p-6 text-center text-sm text-slate-500">Lade Sätze...</CardContent>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="card-surface">
          <CardContent className="p-6 text-center text-sm text-slate-500">{t.emptyState}</CardContent>
        </Card>
      )}

      {!loading && (
        <div className="grid gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="card-surface">
            <CardContent className={cn("space-y-3 p-6", isRtl && "text-right")}> 
              <div className="flex items-center justify-between">
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="primary">{item.level}</Badge>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{item.german}</p>
                <p className="text-sm text-slate-500">{item.arabic}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}
