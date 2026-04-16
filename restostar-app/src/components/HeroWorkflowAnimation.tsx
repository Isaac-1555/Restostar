import { useState, useEffect, useCallback } from "react";
import Lottie from "lottie-react";
import { QrCode, Star, GitFork, Gift } from "lucide-react";

// Placeholder Lottie data – swap each import for your production animation files
import scanQrAnim from "../assets/lottie/scan-qr.json";
import rateAnim from "../assets/lottie/rate.json";
import routeAnim from "../assets/lottie/route.json";
import rewardAnim from "../assets/lottie/reward.json";

const steps = [
  {
    key: "scan",
    label: "Effortless check-in",
    description: "Guests scan a simple QR at the table — no app needed",
    icon: QrCode,
    animation: scanQrAnim,
  },
  {
    key: "rate",
    label: "Share how it felt",
    description: "A quick, friendly star rating in under 10 seconds",
    icon: Star,
    animation: rateAnim,
  },
  {
    key: "route",
    label: "Personalized next step",
    description: "Great experiences get celebrated · Concerns stay between you",
    icon: GitFork,
    animation: routeAnim,
  },
  {
    key: "reward",
    label: "A thank-you that counts",
    description: "A one-time offer delivered straight to their inbox",
    icon: Gift,
    animation: rewardAnim,
  },
] as const;

const STEP_DURATION_MS = 4000;

export function HeroWorkflowAnimation() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % steps.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(advance, STEP_DURATION_MS);
    return () => clearInterval(id);
  }, [advance, isPaused]);

  const ActiveIcon = steps[active].icon;

  return (
    <div
      className="-mt-4 flex flex-col items-center lg:-mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Lottie background + large centered icon */}
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-[22rem] sm:w-[22rem] lg:h-[26rem] lg:w-[26rem]">
        {/* Lottie layers */}
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
          >
            <Lottie
              animationData={step.animation}
              loop
              autoplay={i === active}
              className="h-full w-full"
            />
          </div>
        ))}

        {/* Large foreground icon */}
        <div className="pointer-events-none relative z-10 flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-white/60 bg-white/80 shadow-2xl shadow-emerald-950/10 backdrop-blur-lg transition-all duration-500 sm:h-36 sm:w-36">
          <ActiveIcon className="h-14 w-14 text-emerald-800 sm:h-[4.5rem] sm:w-[4.5rem]" />
        </div>
      </div>

      {/* Active step label + description */}
      <div className="-mt-8 min-h-[4rem] text-center">
        <p className="text-xl font-semibold text-emerald-950 sm:text-2xl">
          {steps[active].label}
        </p>
        <p className="mt-1.5 text-sm text-emerald-900/65 sm:text-base">
          {steps[active].description}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="mt-2 flex items-center gap-2.5">
        {steps.map((step, i) => {
          const isActive = i === active;
          return (
            <button
              key={step.key}
              type="button"
              aria-label={step.label}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                isActive
                  ? "h-2.5 w-8 bg-emerald-800"
                  : "h-2.5 w-2.5 bg-emerald-800/20 hover:bg-emerald-800/40"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
