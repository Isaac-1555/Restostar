# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

- `docs/` – Product and design documentation (PRD, database architecture, user flows, design system)
- `restostar-app/` – The React + Vite + Convex application implementation

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Auth:** Clerk (with `ConvexProviderWithClerk`)
- **Backend & Database:** Convex
- **AI:** OpenAI API (via Convex actions)
- **Email:** Gmail SMTP via nodemailer (in Convex actions)

## Commands

All commands run from `restostar-app/`:

```bash
# Install dependencies
npm install

# Start Vite dev server (requires .env.local with VITE_CLERK_PUBLISHABLE_KEY and VITE_CONVEX_URL)
npm run dev

# Start Convex backend (separate terminal)
npx convex dev

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Frontend (.env.local)
- `VITE_CLERK_PUBLISHABLE_KEY` – Clerk publishable key
- `VITE_CONVEX_URL` – Convex deployment URL (from `npx convex dev`)

### Convex (set via `npx convex env set` or dashboard)
- `GMAIL_SMTP_USER` – Gmail address for sending coupon emails
- `GMAIL_SMTP_APP_PASSWORD` – Gmail app password
- `OPENAI_API_KEY` – For AI Analyzer
- `OPENAI_MODEL` – Optional, defaults to `gpt-4o-mini`

## Code Architecture

### Frontend (`restostar-app/src/`)

**Entry point:** `main.tsx` wraps the app in `ClerkProvider` and `ConvexProviderWithClerk`.

**Routing (React Router in `App.tsx`):**
- `/` – Home/landing page
- `/r/:publicId/:slug` – Customer QR review funnel (public, no auth)
- `/sign-in/*`, `/sign-up/*` – Clerk auth pages
- `/app` – Owner dashboard (auth required)
- `/app/onboarding` – Restaurant setup wizard
- `/app/ai` – AI Analyzer for sentiment insights
- `/staff/redeem` – Staff coupon redemption

**Route organization:**
- `routes/public/` – Customer-facing pages (ReviewFunnelPage)
- `routes/owner/` – Restaurant owner pages (OwnerLayout, DashboardPage, OnboardingPage, AiAnalyzerPage)
- `routes/auth/` – SignInPage, SignUpPage
- `routes/staff/` – StaffRedeemPage

### Backend (`restostar-app/convex/`)

**Schema (`schema.ts`):** Defines 6 tables: `users`, `restaurants`, `coupons`, `reviews`, `customerCoupons`, `aiInsights`

**Key modules:**
- `restaurants.ts` – CRUD for restaurants, uses `publicId` + `slug` for QR URLs
- `reviews.ts` – `submitReview` (public mutation), `listReviews` (owner query)
- `coupons.ts` – Coupon configuration and redemption
- `users.ts` – User management synced with Clerk
- `ai.ts` – `generateInsights` action calls OpenAI, stores results in `aiInsights`
- `email.ts` – Internal action `sendCouponEmail` sends via nodemailer

**Auth pattern (`convex/lib/auth.ts`):**
- `requireIdentity(ctx)` throws if unauthenticated, returns Clerk identity
- Owner functions use `identity.subject` (Clerk user ID) to find/create `users` row

**Public vs authenticated:**
- `getRestaurantPublic`, `submitReview` – No auth required (customer flow)
- `listMyRestaurants`, `listReviews`, `generateInsights` – Require owner auth

**ID generation (`convex/lib/strings.ts`):**
- `generatePublicId()` – 10-char URL-safe ID for restaurants
- `generateCouponCode()` – 8-char uppercase code for customers
- `normalizeSlug()` – Lowercase, alphanumeric slug

## Key Flows

### Customer QR Flow
1. Customer scans QR → `/r/:publicId/:slug`
2. `getRestaurantPublic` fetches restaurant config
3. Customer submits rating via `submitReview`
4. If email provided, generates `customerCoupons` record and schedules `sendCouponEmail`
5. 4-5 stars → redirect to Google Maps review; ≤3 stars → private feedback captured

### Owner Onboarding
1. Owner signs in via Clerk
2. `createRestaurant` auto-creates `users` row if needed, generates `publicId`
3. Owner configures coupons (positive/negative sentiment types)
4. QR code generated from `publicId` + `slug`

### AI Analyzer
1. Owner triggers `generateInsights` action with time range (daily/monthly/all)
2. Action fetches reviews, builds prompt, calls OpenAI
3. Saves structured insights to `aiInsights` table
4. Dashboard displays sentiment summary, complaints, suggestions

## Design Guidelines

From `docs/Restostar_Design_System.md`:
- Primary color: Emerald Green (`#10B981`)
- Typography: Poppins (headings), Inter (body)
- Mobile-first QR flow
- Clear sentiment branching (positive → Google Maps + coupon, negative → private feedback + recovery)
