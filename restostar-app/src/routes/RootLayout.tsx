import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className={isHomePage ? "min-h-full bg-stone-50" : "min-h-full bg-cream"}>
      <header
        className={
          isHomePage
            ? "sticky top-0 z-50 border-b border-emerald-950/5 bg-stone-50/85 backdrop-blur-xl"
            : "sticky top-0 z-50 border-b border-sage-200 bg-white/95 shadow-sm backdrop-blur-sm"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className={`group flex items-center gap-3 transition-colors ${
              isHomePage ? "text-emerald-950" : "text-sage-600 hover:text-sage-500"
            }`}
          >
            <img
              src={logo}
              alt="Restostar"
              className={`h-9 w-9 rounded-full object-cover ring-1 ${
                isHomePage ? "ring-emerald-950/10" : "ring-sage-200"
              }`}
            />
            <span className="font-display text-xl font-semibold tracking-[-0.03em]">Restostar</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:inline-flex ${
                  isHomePage
                    ? "text-emerald-900/75 hover:text-emerald-950"
                    : "text-sage-600 hover:text-sage"
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                  isHomePage
                    ? "bg-emerald-950 hover:bg-emerald-900 hover:shadow-lg hover:shadow-emerald-950/10"
                    : "bg-sage hover:bg-sage-500 hover:shadow-md"
                }`}
              >
                Get Started
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                to="/app"
                className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                  isHomePage
                    ? "bg-emerald-950 hover:bg-emerald-900 hover:shadow-lg hover:shadow-emerald-950/10"
                    : "bg-sage hover:bg-sage-500 hover:shadow-md"
                }`}
              >
                Dashboard
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className={isHomePage ? "" : "mx-auto max-w-6xl px-4 py-6"}>
        <Outlet />
      </main>
    </div>
  );
}
