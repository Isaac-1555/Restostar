import { useState, useEffect, useCallback } from "react";
import Lottie from "lottie-react";

function QrIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="m4,11h7v-7h-7v7Zm2-5h3v3h-3v-3Zm14-2h-7v7h7v-7Zm-2,5h-3v-3h3v3Zm-14,11h7v-7h-7v7Zm2-5h3v3h-3v-3Zm-3,7h4v2H3c-1.654,0-3-1.346-3-3v-4h2v4c0,.551.449,1,1,1Zm19-5h2v4c0,1.654-1.346,3-3,3h-4v-2h4c.551,0,1-.449,1-1v-4Zm2-14v4h-2V3c0-.551-.449-1-1-1h-4V0h4c1.654,0,3,1.346,3,3ZM2,7H0V3C0,1.346,1.346,0,3,0h4v2H3c-.551,0-1,.449-1,1v4Zm11,10h3v3h-3v-3Zm4-1v-3h3v3h-3Zm-4-3h3v3h-3v-3Z" />
    </svg>
  );
}

function FeedbackIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="m23.763,6.597l-1.577,1.285.652,1.987c.089.269-.001.565-.226.738-.225.173-.534.185-.771.031l-1.836-1.196-1.805,1.208c-.112.075-.242.113-.371.113-.141,0-.282-.045-.4-.133-.227-.17-.321-.464-.236-.734l.627-2.011-1.585-1.29c-.213-.181-.291-.476-.194-.738.096-.262.346-.437.626-.437h2.001l.708-1.987c.097-.261.346-.434.625-.434s.528.173.625.434l.708,1.987h2.001c.28,0,.53.175.626.438.096.263.017.558-.197.739Zm-15.527-3.002l1.585,1.29-.627,2.011c-.085.27.01.564.236.734.118.089.259.133.4.133.129,0,.258-.037.371-.113l1.805-1.208,1.836,1.196c.237.154.546.142.771-.031.225-.173.315-.469.226-.738l-.652-1.987,1.577-1.285c.214-.18.293-.476.197-.739-.096-.263-.346-.438-.626-.438h-2.001l-.708-1.987c-.097-.261-.346-.434-.625-.434s-.528.173-.625.434l-.708,1.987h-2.001c-.28,0-.529.174-.626.437-.097.262-.019.557.194.738Zm-2.394,7.042c.237.154.546.142.771-.031.225-.173.315-.469.226-.738l-.652-1.987,1.577-1.285c.214-.18.293-.476.197-.739-.096-.263-.346-.438-.626-.438h-2.001l-.708-1.987c-.097-.261-.346-.434-.625-.434s-.528.173-.625.434l-.708,1.987H.667c-.28,0-.529.174-.626.437-.097.262-.019.557.194.738l1.585,1.29-.627,2.011c-.085.27.01.564.236.734.118.089.259.133.4.133.129,0,.258-.037.371-.113l1.805-1.208,1.836,1.196Zm14.1,6.951l-.639,3.196c-.374,1.87-2.016,3.216-3.922,3.216H7c-1.657,0-3-1.343-3-3v-4c0-1.657,1.343-3,3-3h1.456l2.193-4.149c.18-.352.428-.614.682-.719.212-.088.427-.132.64-.132.682,0,1.244.446,1.432,1.136.022.08.05.265-.007.599l-.58,3.265h4.183c1.893,0,3.313,1.732,2.942,3.588Zm-12.941,4.412h1v-6h-1c-.551,0-1,.449-1,1v4c0,.551.449,1,1,1Zm10.772-5.634c-.112-.137-.362-.366-.773-.366h-6.999v6h5.379c.95,0,1.775-.676,1.961-1.608l.639-3.196c.081-.404-.095-.693-.207-.83Z" />
    </svg>
  );
}

function StepsIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.523,5.609l1.414-1.415,.807,.806L22.537,.207l1.414,1.414-4.793,4.793c-.78,.78-2.048,.78-2.828,0l-.807-.805ZM3.744,6.999c.512,0,1.024-.195,1.414-.585L9.951,1.621,8.537,.207,3.744,5,1.495,2.752,.081,4.166l2.249,2.248c.39,.39,.902,.585,1.414,.585Zm20.256,11.501l-4.528,5.5H3c-1.654,0-3-1.346-3-3v-5c0-1.654,1.346-3,3-3v-4h2v4h5v-4h2v4h5v-4h2v4h.472l4.528,5.5ZM7.522,15l2.881,3.5-2.881,3.5h4.409l2.883-3.5-2.883-3.5H7.522Zm-4.522,7h1.931l2.883-3.5-2.883-3.5h-1.931c-.552,0-1,.449-1,1v5c0,.551,.448,1,1,1Zm18.41-3.5l-2.882-3.5h-4.006l2.881,3.5-2.881,3.5h4.006l2.882-3.5ZM8.505,5.608l.806,.806c.78,.78,2.048,.78,2.828,0L16.932,1.621,15.518,.207l-4.793,4.793-.806-.806-1.414,1.414Z" />
    </svg>
  );
}

function GiftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20,7H18.262A5.137,5.137,0,0,0,20,3a1,1,0,0,0-2,0c0,2.622-2.371,3.53-4.174,3.841A9.332,9.332,0,0,0,15,3,3,3,0,0,0,9,3a9.332,9.332,0,0,0,1.174,3.841C8.371,6.53,6,5.622,6,3A1,1,0,0,0,4,3,5.137,5.137,0,0,0,5.738,7H4a4,4,0,0,0-4,4v1a2,2,0,0,0,2,2v5a5.006,5.006,0,0,0,5,5H17a5.006,5.006,0,0,0,5-5V14a2,2,0,0,0,2-2V11A4,4,0,0,0,20,7ZM12,2a1,1,0,0,1,1,1,7.71,7.71,0,0,1-1,3.013A7.71,7.71,0,0,1,11,3,1,1,0,0,1,12,2ZM2,11A2,2,0,0,1,4,9h7v3H2Zm2,8V14h7v8H7A3,3,0,0,1,4,19Zm16,0a3,3,0,0,1-3,3H13V14h7Zm-7-7V9h7a2,2,0,0,1,2,2v1Z" />
    </svg>
  );
}

function GrowthIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="m6,12c3.309,0,6-2.691,6-6S9.309,0,6,0,0,2.691,0,6s2.691,6,6,6Zm0-10c2.206,0,4,1.794,4,4,0,1.127-.472,2.143-1.225,2.87-.446-1.095-1.516-1.87-2.77-1.87h-.01c-1.255,0-2.326.774-2.772,1.869-.751-.728-1.223-1.742-1.223-2.869,0-2.206,1.794-4,4-4Zm-1.5,2.5c0-.828.672-1.5,1.5-1.5s1.5.672,1.5,1.5-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5Zm18.863,2.379c-.119.047-.242.068-.363.068-.4,0-.778-.241-.932-.637l-1.114-2.855c-3.657,7.752-10.274,12.966-19.694,15.511-.087.023-.175.034-.261.034-.441,0-.845-.293-.965-.739-.144-.533.171-1.082.705-1.227c8.859-2.393,15.057-7.279,18.45-14.532l-3.072,1.198c-.517.202-1.095-.055-1.295-.568-.201-.515.054-1.094.568-1.295L19.791,.12c.957-.376,2.048.102,2.424,1.062l1.717,4.401c.201.515-.054,1.094-.568,1.295Zm-.363,2.121v14c0,.553-.448,1-1,1s-1-.447-1-1v-14c0-.553.448-1,1-1s1,.447,1,1Zm-5,5v9c0,.553-.448,1-1,1s-1-.447-1-1v-9c0-.553.448-1,1-1s1,.447,1,1Zm-5,4v5c0,.553-.448,1-1,1s-1-.447-1-1v-5c0-.553.448-1,1-1s1,.447,1,1Zm-5,2v3c0,.553-.448,1-1,1s-1-.447-1-1v-3c0-.553.448-1,1-1s1,.447,1,1Zm-5,2v1c0,.553-.448,1-1,1s-1-.447-1-1v-1c0-.553.448-1,1-1s1,.447,1,1Z" />
    </svg>
  );
}

import scanQrAnim from "../assets/lottie/scan-qr.json";
import rateAnim from "../assets/lottie/rate.json";
import routeAnim from "../assets/lottie/route.json";
import rewardAnim from "../assets/lottie/reward.json";
import growAnim from "../assets/lottie/grow.json";

const steps = [
  {
    key: "scan",
    label: "Effortless check-in",
    description: "Guests scan a simple QR at the table — no app needed",
    icon: QrIcon,
    animation: scanQrAnim,
  },
  {
    key: "rate",
    label: "Share how it felt",
    description: "A quick, friendly star rating in under 10 seconds",
    icon: FeedbackIcon,
    animation: rateAnim,
  },
  {
    key: "route",
    label: "Personalized next step",
    description: "Great experiences get celebrated · Concerns stay between you",
    icon: StepsIcon,
    animation: routeAnim,
  },
  {
    key: "reward",
    label: "A thank-you that counts",
    description: "A one-time offer delivered straight to their inbox",
    icon: GiftIcon,
    animation: rewardAnim,
  },
  {
    key: "grow",
    label: "Watch your reputation grow",
    description: "More Google reviews, better star ratings, higher visibility on Google Maps",
    icon: GrowthIcon,
    animation: growAnim,
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
        <div className="pointer-events-none relative z-10 flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-white/60 shadow-2xl shadow-emerald-950/10 transition-all duration-500 sm:h-36 sm:w-36">
          <ActiveIcon className="text-emerald-800" />
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
