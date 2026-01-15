import { useAction, useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { api } from "@/convex";

type TimeRange = "daily" | "monthly" | "all";

export function AiAnalyzerPage() {
  const restaurants = useQuery(api.restaurants.listMyRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  const selected = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null;

    const found = selectedRestaurantId
      ? restaurants.find((r) => r._id === (selectedRestaurantId as any))
      : undefined;

    return found ?? restaurants[0];
  }, [restaurants, selectedRestaurantId]);

  const insights = useQuery(
    api.ai.getInsights,
    selected ? { restaurantId: selected._id, timeRange } : "skip"
  );

  const generateInsights = useAction(api.ai.generateInsights);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!selected) return;

    setIsGenerating(true);
    setError(null);
    setStatus(null);

    try {
      await generateInsights({ restaurantId: selected._id, timeRange });
      setStatus("Generated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sage-700">AI Analyzer</h1>
        <p className="mt-1 text-sm text-sage-600">
          On-demand insights generated from private feedback and ratings.
        </p>
      </div>

      {restaurants === undefined ? (
        <div className="text-sm text-sage-500">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-lg border border-sage-200 bg-white p-6 text-center shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 text-2xl mb-3">
            🤖
          </div>
          <p className="text-sage-700 font-medium">No restaurants yet</p>
          <p className="text-sm text-sage-600 mt-1">Create a restaurant first to start analyzing feedback.</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-sage-700">Restaurant</span>
              <select
                className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={selected?._id ?? ""}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-sage-700">Time range</span>
              <select
                className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              >
                <option value="daily">Today (24h)</option>
                <option value="monthly">Monthly (30d)</option>
                <option value="all">All time</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {error}
            </div>
          )}

          {status && (
            <div className="rounded-lg border border-sage-300 bg-lime-100 p-3 text-sm text-sage-700">
              ✓ {status}
            </div>
          )}

          <button
            type="button"
            className="h-11 w-full rounded-lg bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 disabled:opacity-50 transition-colors shadow-sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating…" : "🤖 Generate Insights"}
          </button>

          <div className="rounded-lg bg-cream-50 border border-sage-100 p-4">
            {insights === undefined ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sage border-t-transparent" />
                <span className="ml-2 text-sm text-sage-600">Loading insights...</span>
              </div>
            ) : !insights ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm text-sage-600">No insights generated yet. Click the button above to analyze your reviews.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-3 border border-sage-200">
                  <div className="text-xs font-semibold text-sage-500 uppercase tracking-wide">Summary</div>
                  <div className="mt-1 text-sage-700">{insights.sentimentSummary}</div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Key Complaints</div>
                    <ul className="mt-2 space-y-1">
                      {insights.keyComplaints.length > 0 ? insights.keyComplaints.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-red-700">
                          <span className="text-red-400">•</span>
                          {c}
                        </li>
                      )) : (
                        <li className="text-sm text-red-600 opacity-75">No complaints found</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Suggestions</div>
                    <ul className="mt-2 space-y-1">
                      {insights.suggestions.length > 0 ? insights.suggestions.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-emerald-700">
                          <span className="text-emerald-400">•</span>
                          {s}
                        </li>
                      )) : (
                        <li className="text-sm text-emerald-600 opacity-75">No suggestions yet</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="text-xs text-sage-500 text-center">
                  Last generated: {new Date(insights.generatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
