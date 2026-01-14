import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-12">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 text-4xl mb-6">
        🔍
      </div>
      <h1 className="text-2xl font-bold text-sage-700">Page Not Found</h1>
      <p className="mt-2 text-sage-600 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white hover:bg-sage-500 transition-all hover:shadow-md"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
