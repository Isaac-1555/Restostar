import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-full bg-cream">
      <header className="sticky top-0 z-50 border-b border-sage-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-sage-600 hover:text-sage-500 transition-colors">
            <span className="text-2xl">⭐</span>
            Restostar
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className="hidden sm:inline-block text-sm font-medium text-sage-600 hover:text-sage transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-500 transition-all hover:shadow-md"
              >
                Get Started
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                to="/app"
                className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-500 transition-all hover:shadow-md"
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className={isHomePage ? "" : "mx-auto max-w-5xl px-4 py-6"}>
        <Outlet />
      </main>
    </div>
  );
}
