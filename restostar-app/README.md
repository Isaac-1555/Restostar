# Restostar App (implementation)

React + Vite + Tailwind + Clerk + Convex.

## Setup
1. Install dependencies:
   - `npm install`
2. Create local env:
   - `cp .env.example .env.local`
   - Fill in:
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_CONVEX_URL`
3. Run dev server:
   - `npm run dev`

If you run the app without required env vars, it will render a “Missing env vars” screen.

## Convex
- From this repo root:
  - `npx convex dev`
- Use the printed deployment URL as `VITE_CONVEX_URL`.

## Clerk
- Create a Clerk application and copy the publishable key into `VITE_CLERK_PUBLISHABLE_KEY`.
- Create a Clerk JWT template named `convex` (used by `ConvexProviderWithClerk`).

## Convex + Clerk auth
- Configure your Convex deployment to trust Clerk JWTs (see Convex docs: Auth → Clerk).

## Email (Gmail SMTP)
Coupon emails are sent from a Convex **internal action** using nodemailer.
Set these Convex env vars (via dashboard or `npx convex env set`):
- `GMAIL_SMTP_USER`
- `GMAIL_SMTP_APP_PASSWORD`

## AI (OpenAI)
AI Analyzer runs a Convex action that calls OpenAI.
Set these Convex env vars:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)

## Routes
- Customer QR funnel: `/r/:publicId/:slug`
- Owner app (auth): `/app`
- Staff/internal redemption: `/staff/redeem`
