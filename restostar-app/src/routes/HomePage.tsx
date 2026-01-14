import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const features = [
  {
    icon: "📱",
    title: "QR Code Reviews",
    description: "Generate unique QR codes for each table. Customers scan and leave feedback instantly.",
  },
  {
    icon: "⭐",
    title: "Smart Review Routing",
    description: "Happy customers get directed to Google Reviews. Concerns come straight to you privately.",
  },
  {
    icon: "🎁",
    title: "Automated Coupons",
    description: "Reward feedback with personalized coupons. Each code is unique and trackable.",
  },
  {
    icon: "🤖",
    title: "AI Insights",
    description: "Our AI analyzes feedback patterns to identify trends, common complaints, and opportunities.",
  },
  {
    icon: "📊",
    title: "Owner Dashboard",
    description: "See all reviews, star distributions, and feedback in one beautiful dashboard.",
  },
  {
    icon: "✅",
    title: "Coupon Verification",
    description: "Built-in verifier ensures each coupon can only be used once. No fraud, no hassle.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Set Up Your Restaurant",
    description: "Create your account and add your restaurant details in minutes.",
  },
  {
    step: "2",
    title: "Generate QR Codes",
    description: "Get a unique QR code link to print and place on tables or receipts.",
  },
  {
    step: "3",
    title: "Collect Feedback",
    description: "Customers scan, rate, and share their experience. Positive reviews go to Google.",
  },
  {
    step: "4",
    title: "Grow Your Business",
    description: "Use AI insights to improve operations and watch your online reputation soar.",
  },
];

export function HomePage() {
  return (
    <div className="-mx-4 -mt-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream via-lime-50 to-sage-50 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lime-200 px-4 py-1.5 text-sm font-medium text-sage-700">
            <span className="animate-pulse">🚀</span>
            Now in Beta — Join Early for Free
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-sage-700 md:text-5xl lg:text-6xl">
            Turn Every Customer
            <span className="block text-sage">Into a 5-Star Review</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sage-600 md:text-xl">
            Restostar helps restaurants collect authentic reviews, handle feedback privately,
            and reward customers — all from a simple QR code scan.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignedOut>
              <Link
                to="/sign-up"
                className="w-full rounded-xl bg-sage px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-sage-500 hover:shadow-xl hover:-translate-y-0.5 sm:w-auto"
              >
                Get Started Free →
              </Link>
              <Link
                to="/sign-in"
                className="w-full rounded-xl border-2 border-sage-300 bg-white px-8 py-4 text-base font-semibold text-sage-700 transition-all hover:bg-lime-50 sm:w-auto"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/app"
                className="w-full rounded-xl bg-sage px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-sage-500 hover:shadow-xl hover:-translate-y-0.5 sm:w-auto"
              >
                Go to Dashboard →
              </Link>
            </SignedIn>
            <Link
              to="/r/demo/demo"
              className="text-sm font-medium text-sage-600 underline-offset-4 hover:underline"
            >
              Try the demo flow
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-sage-200 bg-white px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-2xl">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-sage-700">Our Mission</h2>
            <p className="text-sage-600 leading-relaxed">
              To empower restaurant owners with the tools they need to build authentic relationships
              with their customers. We believe every piece of feedback is an opportunity to grow,
              and every happy customer deserves to be heard.
            </p>
          </div>
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-2xl">
              🔮
            </div>
            <h2 className="text-2xl font-bold text-sage-700">Our Vision</h2>
            <p className="text-sage-600 leading-relaxed">
              A world where every restaurant thrives through genuine customer connections.
              Where feedback flows freely, improvements happen faster, and 5-star experiences
              become the norm — not the exception.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-cream px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-sage-700">Everything You Need</h2>
            <p className="mx-auto max-w-2xl text-sage-600">
              From collecting feedback to analyzing trends, Restostar gives you a complete
              toolkit to manage your restaurant's reputation.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-sage-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-sage-700">{feature.title}</h3>
                <p className="text-sm text-sage-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-sage-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-sage-700">How It Works</h2>
            <p className="mx-auto max-w-2xl text-sage-600">
              Get started in minutes, not hours. Here's how simple it is.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < howItWorks.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-sage-300 to-transparent lg:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sage to-sage-500 text-2xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-sage-700">{item.title}</h3>
                <p className="text-sm text-sage-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-sage-600 to-sage-700 px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Grow Your Reviews?</h2>
          <p className="mb-8 text-lg text-sage-100">
            Join hundreds of restaurant owners who are already using Restostar to build
            their online reputation and delight their customers.
          </p>
          <SignedOut>
            <Link
              to="/sign-up"
              className="inline-block rounded-xl bg-lime-300 px-8 py-4 text-base font-semibold text-sage-700 shadow-lg transition-all hover:bg-lime-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Your Free Account →
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              to="/app"
              className="inline-block rounded-xl bg-lime-300 px-8 py-4 text-base font-semibold text-sage-700 shadow-lg transition-all hover:bg-lime-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-sage-600 md:flex-row">
          <div className="font-semibold text-sage-700">© 2025 Restostar. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/sign-in" className="hover:text-sage transition-colors">Sign In</Link>
            <Link to="/sign-up" className="hover:text-sage transition-colors">Sign Up</Link>
            <Link to="/r/demo/demo" className="hover:text-sage transition-colors">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
