import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, Outlet } from "react-router-dom";

import { EnsureUser } from "@/components/EnsureUser";

export function OwnerLayout() {
  return (
    <>
      <SignedIn>
        <EnsureUser />
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <aside className="w-full md:w-56">
            <nav className="grid gap-1 rounded-lg border border-sage-200 bg-white p-2 text-sm shadow-sm">
              <Link
                to="/app"
                className="rounded-md px-3 py-2 font-medium text-sage-700 hover:bg-lime-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/app/onboarding"
                className="rounded-md px-3 py-2 font-medium text-sage-700 hover:bg-lime-100 transition-colors"
              >
                Onboarding
              </Link>
              <Link
                to="/app/ai"
                className="rounded-md px-3 py-2 font-medium text-sage-700 hover:bg-lime-100 transition-colors"
              >
                AI Analyzer
              </Link>
              <Link
                to="/app/verifier"
                className="rounded-md px-3 py-2 font-medium text-sage-700 hover:bg-lime-100 transition-colors"
              >
                Verifier
              </Link>
            </nav>
          </aside>

          <section className="min-w-0 flex-1">
            <Outlet />
          </section>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
