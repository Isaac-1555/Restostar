import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";

import { api } from "@/convex";

export function VerifierPage() {
  const [couponCode, setCouponCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const result = useQuery(
    api.coupons.verifyCouponForOwner,
    searchCode ? { couponCode: searchCode } : "skip"
  );

  const redeemCoupon = useMutation(api.coupons.redeemCouponAsOwner);

  // Reset success/error when searching new code
  useEffect(() => {
    setRedeemSuccess(null);
    setRedeemError(null);
  }, [searchCode]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchCode(couponCode.trim().toUpperCase());
  }

  async function handleRedeem() {
    if (!searchCode) return;
    
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const result = await redeemCoupon({ couponCode: searchCode });
      setRedeemSuccess(`Coupon redeemed successfully at ${new Date(result.redeemedAt).toLocaleString()}`);
      // Refresh the search to show updated status
      setSearchCode("");
      setTimeout(() => setSearchCode(couponCode.trim().toUpperCase()), 100);
    } catch (e) {
      setRedeemError(e instanceof Error ? e.message : "Failed to redeem coupon");
    } finally {
      setIsRedeeming(false);
    }
  }

  function getStatusBadge() {
    if (!result) return null;

    switch (result.status) {
      case "valid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Valid - Ready to Redeem
          </span>
        );
      case "already_redeemed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Already Redeemed
          </span>
        );
      case "not_found":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Not Found
          </span>
        );
      case "unauthorized":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Not Your Restaurant
          </span>
        );
      case "invalid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full bg-gray-500" />
            Invalid
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sage-700">Coupon Verifier</h1>
        <p className="mt-1 text-sm text-sage-600">
          Verify and redeem customer coupons for your restaurant.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-sage-700">Enter Coupon Code</span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              className="h-12 flex-1 rounded-lg border border-sage-200 bg-white px-4 text-lg font-mono uppercase tracking-widest focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
              placeholder="ABC123"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={12}
            />
            <button
              type="submit"
              className="h-12 rounded-lg bg-sage px-6 text-sm font-semibold text-white transition-colors hover:bg-sage-500 disabled:opacity-50"
              disabled={!couponCode.trim()}
            >
              Verify
            </button>
          </div>
        </label>
      </form>

      {/* Results */}
      {searchCode && (
        <div className="rounded-lg border border-sage-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-sage-100 bg-cream-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-semibold text-sage-700">{searchCode}</span>
              {getStatusBadge()}
            </div>
          </div>

          {result === undefined ? (
            <div className="p-6 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sage border-t-transparent" />
              <p className="mt-2 text-sm text-sage-600">Verifying coupon...</p>
            </div>
          ) : result.status === "valid" || result.status === "already_redeemed" ? (
            <div className="p-4 space-y-4">
              {/* Coupon Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-cream-50 p-3">
                  <div className="text-xs font-medium text-sage-500 uppercase tracking-wide">Restaurant</div>
                  <div className="mt-1 font-medium text-sage-700">{result.restaurantName}</div>
                </div>
                <div className="rounded-lg bg-cream-50 p-3">
                  <div className="text-xs font-medium text-sage-500 uppercase tracking-wide">Customer Email</div>
                  <div className="mt-1 font-medium text-sage-700">{result.customerEmail || "Not provided"}</div>
                </div>
                <div className="rounded-lg bg-cream-50 p-3">
                  <div className="text-xs font-medium text-sage-500 uppercase tracking-wide">Review Rating</div>
                  <div className="mt-1 font-medium text-sage-700">
                    {result.reviewStars ? `${result.reviewStars}★ (${result.sentimentType})` : "N/A"}
                  </div>
                </div>
                <div className="rounded-lg bg-cream-50 p-3">
                  <div className="text-xs font-medium text-sage-500 uppercase tracking-wide">Offer</div>
                  <div className="mt-1 font-medium text-sage-700">
                    {result.offerTitle ? `${result.offerTitle} - ${result.offerDiscountValue}` : "N/A"}
                  </div>
                </div>
                <div className="rounded-lg bg-cream-50 p-3">
                  <div className="text-xs font-medium text-sage-500 uppercase tracking-wide">Sent At</div>
                  <div className="mt-1 font-medium text-sage-700">
                    {new Date(result.sentAt).toLocaleString()}
                  </div>
                </div>
                {result.isRedeemed && result.redeemedAt && (
                  <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                    <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">Redeemed At</div>
                    <div className="mt-1 font-medium text-amber-700">
                      {new Date(result.redeemedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Success/Error Messages */}
              {redeemSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  ✓ {redeemSuccess}
                </div>
              )}
              {redeemError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  ✗ {redeemError}
                </div>
              )}

              {/* Redeem Button */}
              {result.status === "valid" && (
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                  className="w-full h-12 rounded-lg bg-emerald-600 text-base font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  {isRedeeming ? "Redeeming..." : "✓ Mark as Redeemed"}
                </button>
              )}

              {result.status === "already_redeemed" && (
                <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center">
                  <div className="text-amber-600 font-medium">⚠️ This coupon has already been used</div>
                  <div className="mt-1 text-sm text-amber-600">
                    It cannot be redeemed again.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
                ❌
              </div>
              <p className="mt-3 text-sage-700 font-medium">
                {result.message || "Unable to verify coupon"}
              </p>
              <p className="mt-1 text-sm text-sage-500">
                Please check the code and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="rounded-lg border border-sage-100 bg-cream-50 p-4">
        <h3 className="text-sm font-semibold text-sage-700">How it works</h3>
        <ul className="mt-2 space-y-1 text-sm text-sage-600">
          <li>• Enter the coupon code your customer received via email</li>
          <li>• Verify the coupon is valid and belongs to your restaurant</li>
          <li>• Click "Mark as Redeemed" to record the redemption</li>
          <li>• Each coupon can only be redeemed once</li>
        </ul>
      </div>
    </div>
  );
}
