# Product Requirements Document (PRD)
## Product Name
Restostar

## One-liner
Restostar helps restaurants turn customer feedback into better Google reviews, smarter insights, and loyal customers.

## Problem
New and small restaurant owners struggle to:
- Collect positive Google Maps reviews consistently
- Handle negative feedback constructively
- Understand patterns in customer sentiment
- Incentivize customers without abuse (coupon reuse)

## Solution
Restostar provides a QR-based smart review funnel that:
- Routes happy customers to Google Maps reviews
- Captures unhappy feedback privately
- Sends contextual coupons via email
- Uses AI to analyze sentiment and suggest improvements

## Target Users
- Primary: New restaurant owners in Calgary
- Secondary: Independent and small-chain restaurants

## Core Features
### Customer Experience
- QR code scan → rating page
- 4–5 stars:
  - Optional email entry for coupon
  - CTA to leave Google Maps review
  - Unique single-use coupon emailed
- ≤3 stars:
  - Private feedback form
  - Optional email for coupon
  - AI-generated empathetic email + coupon

### Restaurant Owner Experience
- Authentication via Clerk
- Guided onboarding:
  1. Restaurant & owner details
  2. Logo upload
  3. Google Maps review link
  4. Coupon setup (positive vs negative)
  5. Email style preference (AI or manual)
- Dashboard:
  - Daily review count
  - Star distribution
  - Feedback text
- AI Analyzer:
  - Sentiment summaries
  - Key issues & improvement suggestions
  - Time filters (today / monthly / all-time)

## Non-Functional Requirements
- Fast QR page load (<1s)
- Secure data isolation per restaurant
- Single-use coupon enforcement
- Email reliability
- PIPEDA-compliant data handling (Canada)

## Tech Stack
- Frontend: React + Vite + shadcn/ui
- Auth: Clerk
- Backend & DB: Convex
- AI: OpenAI API
- Email: Resend / SendGrid
