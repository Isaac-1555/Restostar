import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "@/convex";
import { QrCodeCard } from "@/components/QrCodeCard";

export function DashboardPage() {
  const restaurants = useQuery(api.restaurants.listMyRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null
  );

  const selected = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null;

    const found = selectedRestaurantId
      ? restaurants.find((r) => String(r._id) === selectedRestaurantId)
      : undefined;

    return found ?? restaurants[0];
  }, [restaurants, selectedRestaurantId]);

  const reviews = useQuery(
    api.reviews.listReviews,
    selected ? { restaurantId: selected._id, limit: 50 } : "skip"
  );

  const starCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    for (const r of reviews ?? []) counts[r.stars] = (counts[r.stars] ?? 0) + 1;
    return counts;
  }, [reviews]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-emerald-950">Dashboard</h1>
        <Link
          to="/app/onboarding"
          className="text-sm font-semibold text-emerald-900 hover:text-emerald-950 transition-colors"
        >
          + Add Restaurant
        </Link>
      </div>

      {restaurants === undefined ? (
        <div className="text-sm text-emerald-900/60">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-lg border border-emerald-950/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-emerald-900/70">No restaurants yet.</p>
          <Link
            to="/app/onboarding"
            className="mt-3 inline-block rounded-md bg-emerald-950 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors"
          >
            Create your first restaurant
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-emerald-950">Restaurant</span>
              <select
                className="h-10 rounded-md border border-emerald-950/10 bg-white px-3 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
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

          </div>

          {selected && (
            <QrCodeCard
              publicId={selected.publicId}
              slug={selected.slug}
              restaurantName={selected.name}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-950">Star distribution (last 50)</h2>
              <div className="mt-3 grid gap-1 text-sm text-emerald-900/70">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center justify-between py-1 border-b border-emerald-950/5 last:border-0">
                    <span className="text-emerald-900/70">{n}★</span>
                    <span className="font-mono font-medium text-emerald-950">{starCounts[n] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-950">Recent feedback</h2>
              <div className="mt-3 space-y-2">
                {reviews === undefined ? (
                  <p className="text-sm text-emerald-900/60">Loading…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-emerald-900/60">No reviews yet.</p>
                ) : (
                  reviews
                    .filter((r) => r.feedbackText)
                    .slice(0, 8)
                    .map((r) => (
                      <div key={r._id} className="rounded-md bg-stone-50 p-2 border border-emerald-950/5">
                        <div className="text-xs font-medium text-emerald-900/70">
                          {r.stars}★
                        </div>
                        <div className="text-sm text-emerald-950">{r.feedbackText}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
