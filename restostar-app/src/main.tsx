import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import { MissingEnvPage } from "./routes/MissingEnvPage";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

const missing = [
  !clerkPublishableKey && "VITE_CLERK_PUBLISHABLE_KEY",
  !convexUrl && "VITE_CONVEX_URL",
].filter(Boolean) as string[];

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

if (missing.length > 0) {
  createRoot(rootEl).render(
    <StrictMode>
      <MissingEnvPage missing={missing} />
    </StrictMode>
  );
} else {
  const convex = new ConvexReactClient(convexUrl!);

  createRoot(rootEl).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey!}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </StrictMode>
  );
}
