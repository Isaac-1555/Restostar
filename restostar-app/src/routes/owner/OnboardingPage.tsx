import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/convex";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function OnboardingPage() {
  const restaurants = useQuery(api.restaurants.listMyRestaurants);
  const createRestaurant = useMutation(api.restaurants.createRestaurant);
  const updateRestaurant = useMutation(api.restaurants.updateRestaurant);
  const setCoupon = useMutation(api.coupons.setCoupon);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [emailTone, setEmailTone] = useState<"assist" | "manual">("assist");

  const [selectedCouponsRestaurantId, setSelectedCouponsRestaurantId] = useState<
    string | null
  >(null);

  const selectedCouponsRestaurant = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null;

    const found = selectedCouponsRestaurantId
      ? restaurants.find((r) => String(r._id) === selectedCouponsRestaurantId)
      : undefined;

    return found ?? restaurants[0];
  }, [restaurants, selectedCouponsRestaurantId]);

  const coupons = useQuery(
    api.coupons.getCouponsForRestaurant,
    selectedCouponsRestaurant
      ? { restaurantId: selectedCouponsRestaurant._id }
      : "skip"
  );

  type SendDelayMinutes = 0 | 1 | 2 | 5;

  const SEND_DELAY_OPTIONS: { value: SendDelayMinutes; label: string }[] = [
    { value: 0, label: "Immediately" },
    { value: 1, label: "1 minute" },
    { value: 2, label: "2 minutes" },
    { value: 5, label: "5 minutes" },
  ];

  const [positiveCoupon, setPositiveCoupon] = useState({
    title: "",
    description: "",
    offerValue: "",
    isSingleUse: true,
    sendDelayMinutes: 1 as SendDelayMinutes,
  });
  const [negativeCoupon, setNegativeCoupon] = useState({
    title: "",
    description: "",
    offerValue: "",
    isSingleUse: true,
    sendDelayMinutes: 1 as SendDelayMinutes,
  });

  const [selectedEmailTone, setSelectedEmailTone] = useState<"assist" | "manual">("assist");
  const [emailToneSaving, setEmailToneSaving] = useState(false);

  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugSuggestions = useMemo(() => {
    const base = normalizeSlug(name);
    if (!base) return [];

    const existing = new Set((restaurants ?? []).map((r) => r.slug));
    const suggestions: string[] = [];

    for (let i = 0; i < 5; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      if (!existing.has(candidate)) suggestions.push(candidate);
    }

    return suggestions;
  }, [name, restaurants]);

  // Auto-fill slug if the user hasn't typed one yet.
  useEffect(() => {
    if (!slug.trim() && slugSuggestions.length > 0) {
      setSlug(slugSuggestions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugSuggestions.join("|")]);

  // Default selected restaurant for coupon config.
  useEffect(() => {
    if (!restaurants || restaurants.length === 0) return;
    if (selectedCouponsRestaurantId) return;
    setSelectedCouponsRestaurantId(restaurants[0]._id);
  }, [restaurants, selectedCouponsRestaurantId]);

  // Sync emailTone toggle when selected restaurant changes.
  useEffect(() => {
    if (selectedCouponsRestaurant) {
      setSelectedEmailTone(selectedCouponsRestaurant.emailTone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCouponsRestaurant?._id, selectedCouponsRestaurant?.emailTone]);

  // Load coupon config into local form state when changing restaurant.
  useEffect(() => {
    setCouponStatus(null);
    setCouponError(null);

    const pos = coupons?.find((c) => c.sentimentType === "positive");
    const neg = coupons?.find((c) => c.sentimentType === "negative");

    setPositiveCoupon({
      title: pos?.title ?? "Thanks for the review!",
      description: pos?.description ?? "",
      offerValue: pos?.discountValue ?? "Free soft drink",
      isSingleUse: pos?.isSingleUse ?? true,
      // Backward-compat: if coupon exists but has no delay configured, treat as immediate.
      // If coupon doesn't exist yet, default to 1 minute.
      sendDelayMinutes: (pos ? pos.sendDelayMinutes ?? 0 : 1) as SendDelayMinutes,
    });

    setNegativeCoupon({
      title: neg?.title ?? "We’re sorry — here’s a coupon",
      description: neg?.description ?? "",
      offerValue: neg?.discountValue ?? "Free dessert",
      isSingleUse: neg?.isSingleUse ?? true,
      sendDelayMinutes: (neg ? neg.sendDelayMinutes ?? 0 : 1) as SendDelayMinutes,
    });
  }, [selectedCouponsRestaurant?._id, coupons]);

  async function handleCreate() {
    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      const result = await createRestaurant({
        name: name.trim(),
        slug: slug.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        emailTone,
      });

      setStatus(
        `Created! QR URL: /r/${result.publicId}/${result.slug} (publicId: ${result.publicId})`
      );

      // Auto-select this restaurant for coupon config.
      setSelectedCouponsRestaurantId(result.restaurantId);

      setName("");
      setSlug("");
      setGoogleMapsUrl("");
      setEmailTone("assist");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleEmailTone(newTone: "assist" | "manual") {
    if (!selectedCouponsRestaurant) return;

    setSelectedEmailTone(newTone);
    setEmailToneSaving(true);
    setCouponStatus(null);
    setCouponError(null);

    try {
      await updateRestaurant({
        restaurantId: selectedCouponsRestaurant._id,
        emailTone: newTone,
      });
      setCouponStatus(
        newTone === "assist"
          ? "Email copy set to AI-assisted."
          : "Email copy set to generic/default."
      );
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Something went wrong");
      // Revert toggle on error
      setSelectedEmailTone(selectedCouponsRestaurant.emailTone);
    } finally {
      setEmailToneSaving(false);
    }
  }

  async function handleSaveCoupon(sentimentType: "positive" | "negative") {
    if (!selectedCouponsRestaurant) return;

    setCouponStatus(null);
    setCouponError(null);

    try {
      const c = sentimentType === "positive" ? positiveCoupon : negativeCoupon;
      await setCoupon({
        restaurantId: selectedCouponsRestaurant._id,
        sentimentType,
        title: c.title.trim(),
        description: c.description.trim() || undefined,
        discountValue: c.offerValue.trim(),
        isSingleUse: c.isSingleUse,
        sendDelayMinutes: c.sendDelayMinutes,
      });
      setCouponStatus(`Saved ${sentimentType} coupon.`);
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  // Normalize URL on blur
  function handleGoogleMapsUrlBlur() {
    const trimmed = googleMapsUrl.trim();
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setGoogleMapsUrl("https://" + trimmed);
    }
  }

  const isFormValid = name.trim() && slug.trim() && googleMapsUrl.trim();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Onboarding</h1>
        <p className="text-sm text-slate-700">
          Create your restaurant, then print your QR code using the generated URL.
        </p>
      </div>

      {/* Add a restaurant - moved to top for better UX */}
      <form
        className="space-y-4 rounded-lg border-2 border-sage-300 bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <h2 className="text-base font-semibold text-sage-700">Add a restaurant</h2>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </div>
        )}

        {status && (
          <div className="rounded-md border border-sage-300 bg-lime-100 p-3 text-sm text-sage-700">
            {status}
          </div>
        )}

        <label className="grid gap-1">
          <span className="text-sm font-medium text-sage-700">Restaurant name</span>
          <input
            className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunny Cafe"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-sage-700">Slug</span>
          <input
            className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. sunny-cafe"
            required
          />
          {slugSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {slugSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border border-sage-200 bg-lime-50 px-2.5 py-0.5 text-xs text-sage-700 hover:bg-lime-200 transition-colors"
                  onClick={() => setSlug(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-sage-500">
            Used in your QR link. Unique per owner.
          </p>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-sage-700">Google Maps review URL</span>
          <input
            className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            onBlur={handleGoogleMapsUrlBlur}
            placeholder="https://maps.google.com/..."
            required
          />
          <p className="text-xs text-sage-500">
            Customers will be redirected here after positive reviews.
          </p>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-sage-700">Email copy preference</span>
          <select
            className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
            value={emailTone}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "assist" || value === "manual") {
                setEmailTone(value);
              }
            }}
          >
            <option value="assist">AI-assisted suggestions</option>
            <option value="manual">Manual (owner-approved template)</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full h-11 rounded-md bg-sage text-sm font-semibold text-white hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSubmitting ? "Creating…" : "Create Restaurant"}
        </button>
      </form>

      {/* Your restaurants */}
      <div className="space-y-2 rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-sage-700">Your restaurants</h2>

        {restaurants === undefined ? (
          <div className="text-sm text-sage-500">Loading…</div>
        ) : restaurants.length === 0 ? (
          <div className="text-sm text-sage-500">No restaurants yet. Create one above!</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {restaurants.map((r) => (
              <li key={r._id} className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-lime-50 border border-lime-200">
                <span className="font-medium text-sage-700">{r.name}</span>
                <code className="text-xs text-sage-600 bg-white px-1.5 py-0.5 rounded border border-sage-200">
                  /r/{r.publicId}/{r.slug}
                </code>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Coupon setup - only shown when restaurants exist */}
      {restaurants && restaurants.length > 0 && (
        <div className="space-y-3 rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-sage-700">Coupon setup</h2>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-sage-700">Restaurant</span>
            <select
              className="h-10 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
              value={selectedCouponsRestaurant?._id ?? ""}
              onChange={(e) => setSelectedCouponsRestaurantId(e.target.value)}
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {/* Email copy toggle */}
          <div className="flex items-center justify-between rounded-md border border-sage-200 bg-cream-50 p-3">
            <div>
              <div className="text-sm font-medium text-sage-700">Email copy style</div>
              <p className="text-xs text-sage-500 mt-0.5">
                {selectedEmailTone === "assist"
                  ? "Emails are personalized by AI based on each review."
                  : "Emails use generic templates with basic keyword matching."}
              </p>
            </div>
            <button
              type="button"
              disabled={emailToneSaving}
              onClick={() =>
                handleToggleEmailTone(
                  selectedEmailTone === "assist" ? "manual" : "assist"
                )
              }
              className={
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-50 " +
                (selectedEmailTone === "assist" ? "bg-sage" : "bg-sage-200")
              }
              role="switch"
              aria-checked={selectedEmailTone === "assist"}
              aria-label="Toggle AI-assisted email copy"
            >
              <span
                className={
                  "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform " +
                  (selectedEmailTone === "assist" ? "translate-x-5" : "translate-x-0")
                }
              />
            </button>
          </div>

          {couponError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-900">
              {couponError}
            </div>
          )}

          {couponStatus && (
            <div className="rounded-md border border-sage-300 bg-lime-100 p-2 text-sm text-sage-700">
              {couponStatus}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-md border border-sage-200 bg-cream-50 p-3">
              <div className="text-sm font-semibold text-sage-700">Positive (4–5★)</div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Title</span>
                <input
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={positiveCoupon.title}
                  onChange={(e) =>
                    setPositiveCoupon((c) => ({ ...c, title: e.target.value }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Description</span>
                <textarea
                  className="min-h-16 rounded-md border border-sage-200 bg-white p-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={positiveCoupon.description}
                  onChange={(e) =>
                    setPositiveCoupon((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Reward</span>
                <input
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={positiveCoupon.offerValue}
                  onChange={(e) =>
                    setPositiveCoupon((c) => ({
                      ...c,
                      offerValue: e.target.value,
                    }))
                  }
                  placeholder="e.g. Free soft drink"
                />
                <p className="text-xs text-sage-500">
                  What the customer gets when they redeem this coupon in-store.
                </p>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Email delay</span>
                <select
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={positiveCoupon.sendDelayMinutes}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (n === 0 || n === 1 || n === 2 || n === 5) {
                      setPositiveCoupon((c) => ({
                        ...c,
                        sendDelayMinutes: n as SendDelayMinutes,
                      }));
                    }
                  }}
                >
                  {SEND_DELAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-sage-500">
                  When the coupon email is sent after the customer submits.
                </p>
              </label>

              <label className="flex items-center gap-2 text-sm text-sage-700">
                <input
                  type="checkbox"
                  className="accent-sage"
                  checked={positiveCoupon.isSingleUse}
                  onChange={(e) =>
                    setPositiveCoupon((c) => ({
                      ...c,
                      isSingleUse: e.target.checked,
                    }))
                  }
                />
                Single-use
              </label>

              <button
                type="button"
                className="h-9 rounded-md bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 transition-colors"
                onClick={() => handleSaveCoupon("positive")}
              >
                Save
              </button>
            </div>

            <div className="space-y-2 rounded-md border border-sage-200 bg-cream-50 p-3">
              <div className="text-sm font-semibold text-sage-700">Negative (≤3★)</div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Title</span>
                <input
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={negativeCoupon.title}
                  onChange={(e) =>
                    setNegativeCoupon((c) => ({ ...c, title: e.target.value }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Description</span>
                <textarea
                  className="min-h-16 rounded-md border border-sage-200 bg-white p-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={negativeCoupon.description}
                  onChange={(e) =>
                    setNegativeCoupon((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Reward</span>
                <input
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={negativeCoupon.offerValue}
                  onChange={(e) =>
                    setNegativeCoupon((c) => ({
                      ...c,
                      offerValue: e.target.value,
                    }))
                  }
                  placeholder="e.g. Free dessert"
                />
                <p className="text-xs text-sage-500">
                  What the customer gets when they redeem this coupon in-store.
                </p>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-sage-600">Email delay</span>
                <select
                  className="h-9 rounded-md border border-sage-200 bg-white px-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-300"
                  value={negativeCoupon.sendDelayMinutes}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (n === 0 || n === 1 || n === 2 || n === 5) {
                      setNegativeCoupon((c) => ({
                        ...c,
                        sendDelayMinutes: n as SendDelayMinutes,
                      }));
                    }
                  }}
                >
                  {SEND_DELAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-sage-500">
                  When the coupon email is sent after the customer submits.
                </p>
              </label>

              <label className="flex items-center gap-2 text-sm text-sage-700">
                <input
                  type="checkbox"
                  className="accent-sage"
                  checked={negativeCoupon.isSingleUse}
                  onChange={(e) =>
                    setNegativeCoupon((c) => ({
                      ...c,
                      isSingleUse: e.target.checked,
                    }))
                  }
                />
                Single-use
              </label>

              <button
                type="button"
                className="h-9 rounded-md bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 transition-colors"
                onClick={() => handleSaveCoupon("negative")}
              >
                Save
              </button>
            </div>
          </div>

          <p className="text-xs text-sage-500">
            Coupons are emailed to customers. Redeem at /staff/redeem.
          </p>
        </div>
      )}
    </div>
  );
}
