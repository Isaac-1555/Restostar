import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "@/convex";

export function StaffRedeemPage() {
  const redeemCoupon = useMutation(api.coupons.redeemCoupon);

  const [couponCode, setCouponCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "warning" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRedeem() {
    setIsSubmitting(true);
    setStatus(null);
    setStatusType(null);
    setError(null);

    try {
      const result = await redeemCoupon({ couponCode });

      const meta = [
        result.restaurantName ? `Restaurant: ${result.restaurantName}` : null,
        result.offerTitle ? `Offer: ${result.offerTitle}` : null,
        result.offerDiscountValue ? `Discount: ${result.offerDiscountValue}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      if (result.status === "already_redeemed") {
        setStatusType("warning");
        setStatus(
          `⚠️ Already redeemed${result.redeemedAt ? ` at ${new Date(result.redeemedAt).toLocaleString()}` : "."}` +
            (meta ? ` — ${meta}` : "")
        );
      } else {
        setStatusType("success");
        setStatus(
          `✓ Redeemed at ${new Date(result.redeemedAt).toLocaleString()}` +
            (meta ? ` — ${meta}` : "")
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="rounded-xl border border-sage-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime-100 text-2xl mb-3">
            🎫
          </div>
          <h1 className="text-xl font-semibold text-sage-700">Staff Coupon Redemption</h1>
          <p className="mt-1 text-sm text-sage-600">
            Enter the customer's coupon code to redeem it.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-sage-700">Coupon Code</span>
          <input
            className="mt-1.5 h-12 w-full rounded-lg border border-sage-200 bg-white px-4 text-lg font-mono uppercase tracking-widest text-center focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            placeholder="ABC123"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={12}
          />
        </label>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ✗ {error}
          </div>
        )}

        {status && (
          <div className={`mt-4 rounded-lg border p-3 text-sm ${
            statusType === "warning" 
              ? "border-amber-200 bg-amber-50 text-amber-700" 
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {status}
          </div>
        )}

        <button
          type="button"
          className="mt-4 h-12 w-full rounded-lg bg-sage text-sm font-semibold text-white hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          onClick={handleRedeem}
          disabled={isSubmitting || !couponCode.trim()}
        >
          {isSubmitting ? "Checking…" : "✓ Mark as Redeemed"}
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
        <p className="text-xs text-amber-700">
          ⚠️ <strong>Staff Only</strong> — This page is for internal use. Do not share publicly.
        </p>
      </div>
    </div>
  );
}
