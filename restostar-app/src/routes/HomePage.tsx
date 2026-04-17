import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle,
  Gift,
  MessageSquare,
  QrCode,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { HeroWorkflowAnimation } from "../components/HeroWorkflowAnimation";

const proofCards = [
  {
    icon: Star,
    title: "Guide happy guests to the public review ask",
    description:
      "Catch the moment when a guest is already satisfied, then route them cleanly toward Google instead of hoping they remember later.",
  },
  {
    icon: MessageSquare,
    title: "Keep recovery conversations inside your own flow",
    description:
      "Lower ratings stay private so your team can understand what happened, follow up fast, and protect the public reputation you worked for.",
  },
  {
    icon: Gift,
    title: "Reward guests without losing operational control",
    description:
      "Deliver a one-time coupon by email and verify redemption on the staff side, so incentives feel helpful instead of messy.",
  },
];

const ownerBenefits = [
  {
    icon: Star,
    title: "Get more Google reviews",
    description:
      "Encourages customers to leave reviews at the right moment, when their experience is fresh.",
  },
  {
    icon: MessageSquare,
    title: "Address concerns before they go public",
    description:
      "Re-routes unhappy guests to private feedback so you can fix issues before they reach Google.",
  },
  {
    icon: BarChart3,
    title: "See all feedback in one place",
    description:
      "Consolidates customer feelings and reviews in one dashboard for easy analysis.",
  },
  {
    icon: Target,
    title: "Boost your visibility on Google Maps",
    description:
      "Better reviews and star ratings mean more visibility since Google Maps is the first thing people use to find local restaurants.",
  },
];

const features = [
  {
    icon: QrCode,
    title: "QR Code Reviews",
    description:
      "Create a table-side review entry point that feels natural in service, takeout, or delivery touchpoints.",
  },
  {
    icon: Star,
    title: "Smart Review Routing",
    description:
      "Positive guests get the public review prompt. Lower ratings stay in a private recovery channel first.",
  },
  {
    icon: Gift,
    title: "Automated Coupons",
    description:
      "Reward feedback with trackable one-time offers that keep your thank-you flow consistent across every shift.",
  },
  {
    icon: Bot,
    title: "AI Insights",
    description:
      "Surface recurring complaints, guest praise, and improvement themes without reading every comment manually.",
  },
  {
    icon: BarChart3,
    title: "Owner Dashboard",
    description:
      "See star distribution, private feedback, and review momentum in one owner-friendly view.",
  },
  {
    icon: CheckCircle,
    title: "Coupon Verification",
    description:
      "Give staff a clear redemption flow so every coupon can be checked once and redeemed with confidence.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Set up your restaurant once",
    description:
      "Add your business details, review link, and offer settings so the flow matches how you actually operate.",
  },
  {
    step: "02",
    title: "Place your QR where feedback happens",
    description:
      "Use one shareable link on tables, receipts, takeout packaging, or counter signage.",
  },
  {
    step: "03",
    title: "Let the flow branch by sentiment",
    description:
      "Satisfied guests get the review ask. Unhappy guests leave private context so you can recover the experience.",
  },
  {
    step: "04",
    title: "Act on patterns, not scattered comments",
    description:
      "Use the dashboard and AI summaries to spot repeat issues, improve service, and strengthen your public rating over time.",
  },
];

export function HomePage() {
  return (
    <div className="overflow-hidden bg-stone-50 text-emerald-950">
      <section className="relative isolate overflow-hidden border-b border-emerald-950/5 bg-gradient-to-br from-[#f5f0e8] via-[#eef7f0] to-[#e8f5ec]">
        {/* Subtle animated background blobs */}
        <div
          className="absolute -left-32 -top-16 h-[30rem] w-[30rem] rounded-full bg-emerald-200/30 blur-[120px]"
          style={{ animation: "float 20s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-20 right-0 h-[26rem] w-[26rem] rounded-full bg-lime-200/25 blur-[100px]"
          style={{ animation: "float 25s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-emerald-100/30 blur-[80px]"
          style={{ animation: "float 18s ease-in-out infinite 2s" }}
        />

        <div className="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.04em] text-emerald-950 sm:text-6xl lg:text-7xl">
              Turn great experiences into{" "}
              <span className="text-emerald-700">5-star reviews.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-900/75 md:text-xl">
              Restostar gives restaurants a QR-powered guest feedback flow that routes happy
              diners to Google, keeps lower ratings private, and closes the loop with trackable
              recovery offers.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SignedOut>
                <Link
                  to="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-900"
                >
                  Start your review funnel
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/r/demo/demo"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-950/10 bg-white/80 px-6 py-3.5 text-base font-semibold text-emerald-900 transition-colors hover:bg-white"
                >
                  Try the guest demo
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-900"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/r/demo/demo"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-950/10 bg-white/80 px-6 py-3.5 text-base font-semibold text-emerald-900 transition-colors hover:bg-white"
                >
                  View the guest flow
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <HeroWorkflowAnimation />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                <Target className="h-4 w-4" />
                Why restaurants choose Restostar
              </div>
              <h2 className="font-display text-3xl tracking-[-0.03em] text-emerald-950 sm:text-4xl">
                Every review shapes your reputation. Make sure the right ones go public.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-emerald-900/70">
              Happy guests get a smooth path to leave a Google review while the visit is still
              fresh. Unhappy guests share feedback privately so your team can act before it becomes
              a public problem.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {proofCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[2rem] border border-emerald-950/10 bg-stone-50 p-7 shadow-sm"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{card.title}</h3>
                <p className="mt-3 text-base leading-7 text-emerald-900/65">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Why it works for owners
            </div>
            <h2 className="font-display text-3xl tracking-[-0.03em] text-emerald-950 sm:text-4xl">
              Turn feedback into a competitive advantage
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ownerBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-sm"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-emerald-950">{benefit.title}</h3>
                <p className="mt-3 text-base leading-7 text-emerald-900/65">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              <Sparkles className="h-4 w-4" />
              The full loop
            </div>
            <h2 className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">
              One system for the entire guest feedback cycle
            </h2>
            <p className="mt-4 text-base leading-8 text-emerald-50/75">
              From the QR scan to the owner dashboard, Restostar keeps the flow calm, trackable,
              and built for real restaurant operations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-transform hover:-translate-y-1"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lime-200">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-emerald-50/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              How it works
            </div>
            <h2 className="font-display text-3xl tracking-[-0.03em] text-emerald-950 sm:text-4xl">
              Built to go live quickly, then get smarter with every shift
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-sm"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-emerald-900/65">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2.5rem] border border-emerald-950/10 bg-[#f5efe2] px-8 py-10 shadow-sm sm:px-10 sm:py-12 lg:px-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  Ready to launch
                </div>
                <h2 className="font-display text-3xl tracking-[-0.03em] text-emerald-950 sm:text-4xl">
                  Give guests an easier way to praise you and your team a better way to recover issues.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-900/70">
                  Restostar helps restaurants collect meaningful feedback at the table, keep the
                  public review ask intentional, and turn comments into improvements your team can
                  actually act on.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                <SignedOut>
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-900"
                  >
                    Create your account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/app"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-900"
                  >
                    Open dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </SignedIn>
                <Link
                  to="/r/demo/demo"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-950/10 bg-white px-6 py-3.5 text-base font-semibold text-emerald-950 transition-colors hover:bg-stone-50"
                >
                  View demo flow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-950/5 bg-stone-50 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-emerald-900/65 md:flex-row">
          <div className="font-semibold text-emerald-950">© 2026 Restostar. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/sign-in" className="transition-colors hover:text-emerald-950">
              Sign In
            </Link>
            <Link to="/sign-up" className="transition-colors hover:text-emerald-950">
              Sign Up
            </Link>
            <Link to="/r/demo/demo" className="transition-colors hover:text-emerald-950">
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
