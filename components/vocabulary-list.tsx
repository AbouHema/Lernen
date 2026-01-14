"use client";

import * as React from "react";
import { Heart, Search, Star } from "lucide-react";

import { vocabulary } from "@/data/vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";
import { getFavorites, setFavorites, getLearned, setLearned } from "@/lib/storage";

export function VocabularyList() {
  const { t, locale } = useApp();
  const isRtl = locale === "ar";
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [favorites, setFavoritesState] = React.useState<string[]>([]);
  const [learned, setLearnedState] = React.useState<string[]>([]);

  React.useEffect(() => {
    setFavoritesState(getFavorites());
    setLearnedState(getLearned());
    const timeout = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = React.useMemo(() => {
    const term = query.toLowerCase();
    return vocabulary.filter((item) =>
      [item.arabic, item.german, item.example_de, item.example_ar]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [query]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((fav) => fav !== id) : [...favorites, id];
    setFavoritesState(next);
    setFavorites(next);
  };

  const toggleLearned = (id: string) => {
    const next = learned.includes(id) ? learned.filter((value) => value !== id) : [...learned, id];
    setLearnedState(next);
    setLearned(next);
  };

  return (
    <div className="space-y-6">
      <Card className="card-surface">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className={cn("flex flex-1 items-center gap-3", isRtl && "flex-row-reverse")}> 
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Star className="h-4 w-4" />
            {favorites.length} {t.favorites}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="card-surface">
          <CardContent className="p-6 text-center text-sm text-slate-500">Lade Vokabeln...</CardContent>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="card-surface">
          <CardContent className="p-6 text-center text-sm text-slate-500">{t.emptyState}</CardContent>
        </Card>
      )}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => {
          const isFavorite = favorites.includes(item.id);
          const isLearned = learned.includes(item.id);
          return (
            <Card key={item.id} className="card-surface">
              <CardContent className="space-y-4 p-6">
                <div className={cn("flex items-start justify-between", isRtl && "flex-row-reverse")}> 
                  <div className={cn("space-y-1", isRtl && "text-right")}> 
                    <p className="text-xl font-semibold">{item.arabic}</p>
                    <p className="text-sm text-slate-500">
                      {item.article} {item.german}
                    </p>
                  </div>
                  <Badge variant="outline">{item.level}</Badge>
                </div>
                <div className={cn("space-y-1 text-sm", isRtl && "text-right")}> 
                  <p className="text-slate-700">{item.example_de}</p>
                  <p className="text-slate-400">{item.example_ar}</p>
                </div>
                <div className={cn("flex flex-wrap gap-2", isRtl && "flex-row-reverse")}> 
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <Heart className="h-4 w-4" />
                    {isFavorite ? t.removeFavorite : t.addFavorite}
                  </Button>
                  <Button
                    variant={isLearned ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleLearned(item.id)}
                  >
                    {isLearned ? t.learned : "Als gelernt markieren"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
