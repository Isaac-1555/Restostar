import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex";
import { Pencil } from "lucide-react";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  googleMapsUrl: string;
  emailTone: "assist" | "manual";
}

interface RestaurantEditModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function RestaurantEditModal({ restaurant, onClose }: RestaurantEditModalProps) {
  const updateRestaurant = useMutation(api.restaurants.updateRestaurant);

  const [name, setName] = useState(restaurant.name);
  const [slug, setSlug] = useState(restaurant.slug);
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(restaurant.googleMapsUrl);
  const [emailTone, setEmailTone] = useState<"assist" | "manual">(restaurant.emailTone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateRestaurant({
        // restaurantId type mismatch - Convex generated types not exposed to client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        restaurantId: restaurant._id as any,
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim(),
        emailTone,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-emerald-950">Edit Restaurant</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-emerald-900/60 hover:text-emerald-950"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-emerald-950/10 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-emerald-950/10 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-md border border-emerald-950/10 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full rounded-md border border-emerald-950/10 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
              placeholder="https://maps.google.com/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-1">
              Email Tone
            </label>
            <select
              value={emailTone}
              onChange={(e) => setEmailTone(e.target.value as "assist" | "manual")}
              className="w-full rounded-md border border-emerald-950/10 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald-950/20"
            >
              <option value="assist">Assist (AI-powered)</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-emerald-900 hover:text-emerald-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-950 rounded-md hover:bg-emerald-900 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditButtonProps {
  onClick: () => void;
}

export function EditRestaurantButton({ onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-emerald-900/60 hover:text-emerald-950 transition-colors"
      title="Edit restaurant"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );
}