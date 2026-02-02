import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { SignInPage } from "./routes/auth/SignInPage";
import { SignUpPage } from "./routes/auth/SignUpPage";
import { HomePage } from "./routes/HomePage";
import { NotFoundPage } from "./routes/NotFoundPage";
import { ReviewFunnelPage } from "./routes/public/ReviewFunnelPage";
import { RootLayout } from "./routes/RootLayout";
import { OwnerLayout } from "./routes/owner/OwnerLayout";
import { DashboardPage } from "./routes/owner/DashboardPage";
import { OnboardingPage } from "./routes/owner/OnboardingPage";
import { AiAnalyzerPage } from "./routes/owner/AiAnalyzerPage";
import { ReviewsPage } from "./routes/owner/ReviewsPage";
import { VerifierPage } from "./routes/owner/VerifierPage";
import { StaffRedeemPage } from "./routes/staff/StaffRedeemPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "r/:publicId/:slug", element: <ReviewFunnelPage /> },
      { path: "sign-in/*", element: <SignInPage /> },
      { path: "sign-up/*", element: <SignUpPage /> },
      {
        path: "app",
        element: <OwnerLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "onboarding", element: <OnboardingPage /> },
          { path: "reviews", element: <ReviewsPage /> },
          { path: "ai", element: <AiAnalyzerPage /> },
          { path: "verifier", element: <VerifierPage /> },
        ],
      },
      { path: "staff/redeem", element: <StaffRedeemPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
