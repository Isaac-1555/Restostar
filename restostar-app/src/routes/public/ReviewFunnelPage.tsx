import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "@/convex";

type Sentiment = "positive" | "negative";

export function ReviewFunnelPage() {
  const { publicId, slug } = useParams();

  const [stars, setStars] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restaurant = useQuery(
    api.restaurants.getRestaurantPublic,
    publicId && slug ? { publicId, slug } : "skip"
  );

  const submitReview = useMutation(api.reviews.submitReview);

  const sentiment: Sentiment | null = useMemo(() => {
    if (stars == null) return null;
    return stars >= 4 ? "positive" : "negative";
  }, [stars]);

  async function handleSubmit() {
    if (!publicId || !slug || stars == null) return;

    setIsSubmitting(true);
    setError(null);
    setCouponCode(null);

    try {
      const result = await submitReview({
        publicId,
        slug,
        stars,
        feedbackText: feedbackText.trim() || undefined,
        email: email.trim() || undefined,
      });
      setCouponCode(result.couponCode);

      if (sentiment === "positive" && restaurant?.googleMapsUrl) {
        window.open(restaurant.googleMapsUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md border border-sage-200">
      <div className="space-y-1">
        <div className="text-xs font-medium text-sage-500">
          {restaurant ? restaurant.name : "Restostar"}
        </div>
        <h1 className="text-lg font-semibold text-sage-700">How was your experience?</h1>
      </div>

      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            className={
              "h-12 w-12 rounded-lg border text-base font-semibold transition " +
              (stars === n
                ? "border-sage bg-lime-100 text-sage-700"
                : "border-sage-200 bg-white text-sage-600 hover:bg-lime-50")
            }
            aria-pressed={stars === n}
          >
            {n}
          </button>
        ))}
      </div>

      {sentiment === "positive" && (
        <div className="space-y-3 rounded-lg border border-lime-300 bg-lime-50 p-4">
          <p className="text-sm text-sage-700">
            Thanks! Want a coupon? Add your email and we'll send it.
          </p>
          <input
            className="h-10 w-full rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
          />
        </div>
      )}

      {sentiment === "negative" && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            We're sorry to hear that. Would you share what went wrong?
          </p>
          <textarea
            className="min-h-28 w-full rounded-md border border-amber-200 bg-white p-2 text-sm text-sage-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <input
            className="h-10 w-full rounded-md border border-amber-200 bg-white px-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {couponCode && (
        <div className="rounded-lg border border-lime-300 bg-lime-100 p-3 text-sm text-sage-700">
          Coupon code: <span className="font-mono font-bold text-sage-700">{couponCode}</span>
        </div>
      )}

      <button
        type="button"
        className="h-11 w-full rounded-md bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        disabled={stars == null || isSubmitting}
        onClick={handleSubmit}
      >
        {sentiment === "positive"
          ? isSubmitting
            ? "Opening Google…"
            : "Continue"
          : isSubmitting
          ? "Submitting…"
          : "Submit"}
      </button>

      {!restaurant && publicId && slug && (
        <p className="text-xs text-sage-500">
          No restaurant found for <code className="font-mono bg-cream px-1 rounded">{publicId}/{slug}</code>.
        </p>
      )}
    </div>
  );
}
