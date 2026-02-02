import { usePaginatedQuery, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

import { api } from "@/convex";

type TimeRange = "daily" | "weekly" | "monthly" | "all";

const TIME_RANGE_MS: Record<TimeRange, number | null> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  all: null,
};

const POSITIVE_CATEGORIES = ["Food", "Ambience", "Service", "Value"] as const;

export function ReviewsPage() {
  const restaurants = useQuery(api.restaurants.listMyRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  const selected = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null;
    const found = selectedRestaurantId
      ? restaurants.find((r) => String(r._id) === selectedRestaurantId)
      : undefined;
    return found ?? restaurants[0];
  }, [restaurants, selectedRestaurantId]);

  // Compute `since` timestamp. We capture Date.now() once and recalculate when timeRange changes.
  const [now, setNow] = useState(() => Date.now());
  // Update `now` when timeRange changes so we get fresh timestamps
  const sinceMs = TIME_RANGE_MS[timeRange];
  const since = sinceMs !== null ? now - sinceMs : undefined;

  // Reset `now` when time range changes to get a fresh reference point
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setNow(Date.now());
    setTimeRange(newRange);
  };

  const {
    results: reviews,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.reviews.listReviewsPaginated,
    selected ? { restaurantId: selected._id, since } : "skip",
    { initialNumItems: 50 }
  );

  // Split into good (>=4 stars) and bad (<=3 stars)
  const { goodReviews, badReviews, categoryCounts } = useMemo(() => {
    const good: typeof reviews = [];
    const bad: typeof reviews = [];
    const counts: Record<string, number> = {};

    for (const cat of POSITIVE_CATEGORIES) {
      counts[cat] = 0;
    }

    for (const r of reviews) {
      if (r.stars >= 4) {
        good.push(r);
        for (const cat of r.positiveCategories ?? []) {
          if (cat in counts) counts[cat]++;
        }
      } else {
        bad.push(r);
      }
    }

    return { goodReviews: good, badReviews: bad, categoryCounts: counts };
  }, [reviews]);

  // Group bad reviews by star rating
  const badByStars = useMemo(() => {
    const groups: Record<number, typeof badReviews> = { 1: [], 2: [], 3: [] };
    for (const r of badReviews) {
      if (r.stars in groups) groups[r.stars].push(r);
    }
    return groups;
  }, [badReviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sage-700">Reviews</h1>
        <p className="mt-1 text-sm text-sage-600">
          All customer reviews for your restaurant.
        </p>
      </div>

      {restaurants === undefined ? (
        <div className="text-sm text-sage-500">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-lg border border-sage-200 bg-white p-6 text-center shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 mb-3">
            <MessageSquare className="h-6 w-6 text-sage-600" />
          </div>
          <p className="text-sage-700 font-medium">No restaurants yet</p>
          <p className="text-sm text-sage-600 mt-1">
            Create a restaurant first to view reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
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
                  onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
                >
                  <option value="daily">Today (24h)</option>
                  <option value="weekly">Last 7 days</option>
                  <option value="monthly">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </label>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left column - Good reviews */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="h-5 w-5 text-emerald-600" />
                <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                  Good Reviews (4-5★)
                </h2>
              </div>

              <div className="rounded-lg bg-white p-3 border border-emerald-200 mb-3">
                <div className="text-3xl font-bold text-emerald-600">
                  {goodReviews.length}
                </div>
                <div className="text-xs text-emerald-700">total good reviews</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                  What customers liked
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIVE_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="rounded-md bg-white p-2 border border-emerald-200 text-center"
                    >
                      <div className="text-lg font-bold text-emerald-600">
                        {categoryCounts[cat]}
                      </div>
                      <div className="text-xs text-emerald-700">{cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Bad reviews */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="h-5 w-5 text-red-600" />
                <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                  Bad Reviews (1-3★)
                </h2>
              </div>

              <div className="rounded-lg bg-white p-3 border border-red-200 mb-3">
                <div className="text-3xl font-bold text-red-600">
                  {badReviews.length}
                </div>
                <div className="text-xs text-red-700">total bad reviews</div>
              </div>

              <div className="space-y-3">
                {[3, 2, 1].map((stars) => {
                  const reviewsForStar = badByStars[stars];
                  if (reviewsForStar.length === 0) return null;

                  return (
                    <div key={stars}>
                      <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                        {stars}★ Reviews ({reviewsForStar.length})
                      </div>
                      <div className="space-y-2">
                        {reviewsForStar.map((r) => (
                          <div
                            key={r._id}
                            className="rounded-md bg-white p-2 border border-red-200 text-sm text-red-900"
                          >
                            {r.feedbackText || (
                              <span className="italic text-red-400">No comment</span>
                            )}
                            <div className="text-xs text-red-500 mt-1">
                              {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {badReviews.length === 0 && (
                  <div className="text-sm text-red-600 italic">
                    No bad reviews in this time range.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Load more */}
          {status === "CanLoadMore" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => loadMore(50)}
                className="rounded-lg border border-sage-300 bg-white px-6 py-2 text-sm font-medium text-sage-700 hover:bg-lime-50 transition-colors"
              >
                Load more reviews
              </button>
            </div>
          )}
          {status === "LoadingMore" && (
            <div className="text-center text-sm text-sage-500">Loading more…</div>
          )}
          {status === "LoadingFirstPage" && (
            <div className="text-center text-sm text-sage-500">Loading reviews…</div>
          )}
        </div>
      )}
    </div>
  );
}
