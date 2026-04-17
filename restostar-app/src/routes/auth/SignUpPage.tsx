import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-emerald-950">Create Your Account</h1>
        <p className="mt-2 text-emerald-900/70">Start collecting reviews in minutes</p>
      </div>
      <div className="w-full max-w-md">
        <SignUp 
          routing="path" 
          path="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "rounded-xl shadow-lg border border-emerald-950/10",
              headerTitle: "text-emerald-950",
              headerSubtitle: "text-emerald-900/70",
              formButtonPrimary: "bg-emerald-950 hover:bg-emerald-900",
              footerActionLink: "text-emerald-950 hover:text-emerald-900/60",
            }
          }}
        />
      </div>
      <p className="mt-6 text-sm text-emerald-900/70">
        Already have an account?{" "}
        <Link to="/sign-in" className="font-medium text-emerald-950 hover:text-emerald-900/60 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
