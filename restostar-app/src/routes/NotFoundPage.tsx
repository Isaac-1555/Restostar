import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-12">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-950/5 text-4xl mb-6">
        🔍
      </div>
      <h1 className="text-2xl font-bold text-emerald-950">Page Not Found</h1>
      <p className="mt-2 text-emerald-900/70 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-all hover:shadow-md"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
