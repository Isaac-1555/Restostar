import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "@/convex";
import { QrCodeCard } from "@/components/QrCodeCard";
import { RestaurantEditModal, EditRestaurantButton } from "@/components/RestaurantEditModal";

export function DashboardPage() {
  const restaurants = useQuery(api.restaurants.listMyRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);

  const selected = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null;

    const found = selectedRestaurantId
      ? restaurants.find((r) => String(r._id) === selectedRestaurantId)
      : undefined;

    return found ?? restaurants[0];
  }, [restaurants, selectedRestaurantId]);

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const todayStart = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }, []);

  const todayReviews = useQuery(
    api.reviews.listReviews,
    selected ? { restaurantId: selected._id, limit: 5, since: todayStart } : "skip"
  );

  const allReviews = useQuery(
    api.reviews.listReviews,
    selected ? { restaurantId: selected._id, limit: 5 } : "skip"
  );

  const displayReviews = todayReviews && todayReviews.length > 0 ? todayReviews : allReviews;

  const selectedReview = useMemo(() => {
    if (!selectedReviewId || !displayReviews) return null;
    return displayReviews.find((r) => r._id === selectedReviewId) ?? null;
  }, [selectedReviewId, displayReviews]);

  const starCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    for (const r of todayReviews ?? []) counts[r.stars] = (counts[r.stars] ?? 0) + 1;
    return counts;
  }, [todayReviews]);

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <h1 className="text-lg font-semibold text-emerald-950">Dashboard</h1>
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
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="rounded-lg border border-emerald-950/10 bg-white p-3 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <label className="grid gap-1 flex-1">
                <span className="text-xs font-medium text-emerald-950">Restaurant</span>
                <select
                  className="h-8 rounded-md border border-emerald-950/10 bg-white px-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
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
              <div className="flex items-end pb-0.5">
                <EditRestaurantButton onClick={() => setShowEditModal(true)} />
              </div>
            </div>
          </div>

          {selected && (
            <QrCodeCard
              publicId={selected.publicId}
              slug={selected.slug}
              restaurantName={selected.name}
            />
          )}

          <div className="grid grid-cols-5 gap-2 flex-shrink-0">
            {[5, 4, 3, 2, 1].map((n) => (
              <div
                key={n}
                className={`rounded-lg p-3 text-center ${
                  n === 5 ? "bg-green-50 border border-green-200" :
                  n === 4 ? "bg-lime-50 border border-lime-200" :
                  n === 3 ? "bg-yellow-50 border border-yellow-200" :
                  n === 2 ? "bg-orange-50 border border-orange-200" :
                  "bg-red-50 border border-red-200"
                }`}
              >
                <div className="text-lg font-bold text-emerald-950">{starCounts[n] ?? 0}</div>
                <div className={`text-sm ${
                  n >= 4 ? "text-green-700" :
                  n === 3 ? "text-yellow-700" :
                  "text-red-700"
                }`}>{n}★</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-emerald-950/10 bg-white p-3 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-emerald-950">Recent reviews (today)</h2>
              <Link
                to="/app/reviews"
                className="text-xs font-medium text-emerald-700 hover:text-emerald-950"
              >
                View all →
              </Link>
            </div>
            <div className="mt-2 space-y-2">
              {displayReviews === undefined ? (
                <p className="text-sm text-emerald-900/60">Loading…</p>
              ) : displayReviews.length === 0 ? (
                <p className="text-sm text-emerald-900/60">No reviews today.</p>
              ) : (
                displayReviews
                  .filter((r) => r.feedbackText)
                  .slice(0, 5)
                  .map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setSelectedReviewId(r._id)}
                      className="w-full text-left rounded-md bg-stone-50 p-2 border border-emerald-950/5 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          r.stars >= 4 ? "text-green-700" :
                          r.stars === 3 ? "text-yellow-700" :
                          "text-red-700"
                        }`}>{r.stars}★</span>
                        <span className="text-sm text-emerald-950 truncate">{r.feedbackText}</span>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {selected && showEditModal && (
        <RestaurantEditModal
          restaurant={selected}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedReviewId(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold ${
                  selectedReview.stars >= 4 ? "text-green-700" :
                  selectedReview.stars === 3 ? "text-yellow-700" :
                  "text-red-700"
                }`}>{selectedReview.stars}★</span>
                <span className="text-sm text-emerald-900/60">review</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewId(null)}
                className="text-sm text-emerald-900/60 hover:text-emerald-950"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-emerald-950 whitespace-pre-wrap">{selectedReview.feedbackText}</p>
          </div>
        </div>
      )}
    </div>
  );
}