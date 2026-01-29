import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "@/convex";

type Sentiment = "positive" | "negative";
type FlowState = "rating" | "submitted";

export function ReviewFunnelPage() {
  const { publicId, slug } = useParams();

  const [stars, setStars] = useState<number | null>(null);
  const [ratingLocked, setRatingLocked] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [alreadyReceivedCoupon, setAlreadyReceivedCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("rating");

  const restaurant = useQuery(
    api.restaurants.getRestaurantPublic,
    publicId && slug ? { publicId, slug } : "skip"
  );

  const submitReview = useMutation(api.reviews.submitReview);

  const sentiment: Sentiment | null = useMemo(() => {
    if (stars == null) return null;
    return stars >= 4 ? "positive" : "negative";
  }, [stars]);

  // For positive reviews: submit + open Google Maps
  async function handlePositiveSubmit() {
    if (!publicId || !slug || stars == null) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitReview({
        publicId,
        slug,
        stars,
        email: email.trim() || undefined,
      });
      if (result.alreadyReceivedCoupon) {
        setAlreadyReceivedCoupon(true);
        setCouponCode(result.existingCouponCode ?? null);
      } else {
        setCouponCode(result.couponCode);
      }
      setFlowState("submitted");

      // Open Google Maps in new tab
      if (restaurant?.googleMapsUrl) {
        window.open(restaurant.googleMapsUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // For negative reviews: submit feedback
  async function handleNegativeSubmit() {
    if (!publicId || !slug || stars == null) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitReview({
        publicId,
        slug,
        stars,
        feedbackText: feedbackText.trim() || undefined,
        email: email.trim() || undefined,
      });
      if (result.alreadyReceivedCoupon) {
        setAlreadyReceivedCoupon(true);
        setCouponCode(result.existingCouponCode ?? null);
      } else {
        setCouponCode(result.couponCode);
      }
      setFlowState("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Submitted state - show thank you
  if (flowState === "submitted") {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md border border-sage-200">
        <div className="space-y-1">
          <div className="text-xs font-medium text-sage-500">
            {restaurant ? restaurant.name : "Restostar"}
          </div>
          <h1 className="text-lg font-semibold text-sage-700">
            {sentiment === "positive" ? "Thank you!" : "Thanks for your feedback"}
          </h1>
        </div>

        <div className="rounded-lg border border-lime-300 bg-lime-50 p-4 space-y-2">
          {sentiment === "positive" ? (
            <p className="text-sm text-sage-700">
              We really appreciate you taking the time to review us on Google!
            </p>
          ) : (
            <p className="text-sm text-sage-700">
              We're sorry about your experience. Your feedback helps us improve.
            </p>
          )}

          {email && (
            <div className="pt-2 border-t border-lime-200">
              <p className="text-xs text-sage-500">
                {alreadyReceivedCoupon
                  ? "You've already received a coupon for this restaurant. Check your email!"
                  : "Your coupon code has been sent to your email."}
              </p>
            </div>
          )}
        </div>

        {/* Restostar Banner */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-sage to-sage-600 p-4 text-center shadow-sm">
          <p className="text-xs text-white/80 mb-1">Powered by</p>
          <p className="text-lg font-bold text-white">Restostar</p>
          <p className="text-xs text-white/90 mt-1">
            Turn every visit into a 5-star review
          </p>
          <a
            href="https://restostar.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-xs font-semibold text-sage hover:bg-lime-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    );
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
            onClick={() => {
              if (!ratingLocked) {
                setStars(n);
                setRatingLocked(true);
              }
            }}
            disabled={ratingLocked && stars !== n}
            className={
              "h-12 w-12 rounded-lg border text-base font-semibold transition " +
              (stars === n
                ? "border-sage bg-lime-100 text-sage-700"
                : ratingLocked
                  ? "border-sage-200 bg-gray-100 text-sage-400 cursor-not-allowed opacity-50"
                  : "border-sage-200 bg-white text-sage-600 hover:bg-lime-50")
            }
            aria-pressed={stars === n}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Positive flow (4-5 stars) */}
      {sentiment === "positive" && (
        <div className="space-y-3 rounded-lg border border-lime-300 bg-lime-50 p-4">
          <p className="text-sm text-sage-700 font-medium">
            Awesome! We'd love if you could share your experience on Google.
          </p>
          <p className="text-xs text-sage-500">
            Want a thank-you coupon? Add your email below (optional).
          </p>
          <input
            className="h-10 w-full rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            inputMode="email"
          />
          {emailFocused && (
            <p className="text-xs text-sage-400 mt-1">
              We respect your privacy. Your email will only be used to send your coupon and will not be shared with third parties.
            </p>
          )}
        </div>
      )}

      {/* Negative flow (1-3 stars) */}
      {sentiment === "negative" && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900 font-medium">
            We're sorry to hear that.
          </p>
          <p className="text-xs text-amber-800">
            Would you share what went wrong? We'd love to make it right.
          </p>
          <textarea
            className="min-h-28 w-full rounded-md border border-amber-200 bg-white p-2 text-sm text-sage-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Tell us what happened..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <p className="text-xs text-amber-800">
            Want a coupon to make up for it? Add your email (optional).
          </p>
          <input
            className="h-10 w-full rounded-md border border-amber-200 bg-white px-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            inputMode="email"
          />
          {emailFocused && (
            <p className="text-xs text-amber-600 mt-1">
              We respect your privacy. Your email will only be used to send your coupon and will not be shared with third parties.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {sentiment === "positive" && (
        <button
          type="button"
          className="h-11 w-full rounded-md bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          disabled={isSubmitting}
          onClick={handlePositiveSubmit}
        >
          {isSubmitting ? "Opening Google Reviews…" : "Continue to Google Reviews"}
        </button>
      )}

      {sentiment === "negative" && (
        <button
          type="button"
          className="h-11 w-full rounded-md bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          disabled={isSubmitting}
          onClick={handleNegativeSubmit}
        >
          {isSubmitting ? "Submitting…" : "Submit Feedback"}
        </button>
      )}

      {!restaurant && publicId && slug && (
        <p className="text-xs text-sage-500">
          No restaurant found for <code className="font-mono bg-cream px-1 rounded">{publicId}/{slug}</code>.
        </p>
      )}

      {/* Restostar Banner */}
      <div className="mt-6 rounded-lg bg-gradient-to-r from-sage to-sage-600 p-4 text-center shadow-sm">
        <p className="text-xs text-white/80 mb-1">Powered by</p>
        <p className="text-lg font-bold text-white">Restostar</p>
        <p className="text-xs text-white/90 mt-1">
          Turn every visit into a 5-star review
        </p>
        <a
          href="https://restostar.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-xs font-semibold text-sage hover:bg-lime-50 transition-colors"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
