import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-sage-700">Welcome Back</h1>
        <p className="mt-2 text-sage-600">Sign in to manage your restaurant reviews</p>
      </div>
      <div className="w-full max-w-md">
        <SignIn 
          routing="path" 
          path="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "rounded-xl shadow-lg border border-sage-200",
              headerTitle: "text-sage-700",
              headerSubtitle: "text-sage-600",
              formButtonPrimary: "bg-sage hover:bg-sage-500",
              footerActionLink: "text-sage hover:text-sage-500",
            }
          }}
        />
      </div>
      <p className="mt-6 text-sm text-sage-600">
        Don't have an account?{" "}
        <Link to="/sign-up" className="font-medium text-sage hover:text-sage-500 underline-offset-4 hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
