import { useState } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, Outlet } from "react-router-dom";

import { EnsureUser } from "@/components/EnsureUser";

function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-2 text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors md:hidden"
      aria-label="Open menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  links,
}: {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ to: string; label: string }>;
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-56 transform bg-white p-4 shadow-lg transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-4">
          <span className="font-display text-lg font-semibold text-emerald-950">
            Menu
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="grid gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

const navLinks = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/onboarding", label: "Onboarding" },
  { to: "/app/reviews", label: "Reviews" },
  { to: "/app/ai", label: "AI Analyzer" },
  { to: "/app/verifier", label: "Verifier" },
];

export function OwnerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <SignedIn>
        <EnsureUser />
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <div className="md:hidden">
            <HamburgerButton onClick={() => setIsDrawerOpen(true)} />
          </div>
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            links={navLinks}
          />
          <aside className="hidden w-full md:block md:w-56">
            <nav className="grid gap-1 rounded-lg border border-emerald-950/10 bg-white p-2 text-sm shadow-sm">
              <Link
                to="/app"
                className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/app/onboarding"
                className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
              >
                Onboarding
              </Link>
              <Link
                to="/app/reviews"
                className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
              >
                Reviews
              </Link>
              <Link
                to="/app/ai"
                className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
              >
                AI Analyzer
              </Link>
              <Link
                to="/app/verifier"
                className="rounded-md px-3 py-2 font-medium text-emerald-900/75 hover:bg-emerald-950/5 hover:text-emerald-950 transition-colors"
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
