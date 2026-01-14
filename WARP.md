# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

- This repository currently contains product and design documentation for **Restostar** under `docs/`.
- There is **no application source code or tooling** checked in yet (no build system, package manifest, or tests).
- Treat this repo as the canonical reference for product requirements, data model, UX flows, and visual design when implementing Restostar in code elsewhere.

## Commands & Tooling

- There are **no build, lint, or test commands** defined in this repository at present.
- The only common command you are likely to run here is basic Git and file navigation, for example:
  - `cd Restostar` – enter the repo
  - `ls docs` – list the available specification documents
- When application code is introduced (e.g., a React + Vite + Convex implementation), ensure that:
  - Project-level commands (dev, build, lint, test, single-test invocation) are documented here.
  - Any framework-specific CLIs or scripts are added to this section with concrete examples.

## Intended Tech Stack (from PRD)

The PRD in `docs/Restostar_PRD.md` defines the planned stack:

- **Frontend:** React + Vite + shadcn/ui
- **Auth:** Clerk
- **Backend & Database:** Convex
- **AI:** OpenAI API
- **Email Delivery:** Resend or SendGrid

Future code in this repository should be consistent with these choices unless the product requirements change.

## High-Level Product Architecture

The high-level behavior of Restostar is spread across four documents in `docs/`:

- `Restostar_PRD.md` – product goals, problem/solution framing, core features, and tech stack.
- `Restostar_Database_Architecture.md` – Convex data model and relationships.
- `Restostar_User_Flow.md` – step-by-step owner and customer flows.
- `Restostar_Design_System.md` – brand, design tokens, core components, and UX principles.

### Core Domains

Conceptually, the system is organized around these domains:

1. **Restaurant Owner Platform**
   - Authentication via Clerk.
   - Onboarding flow to register restaurant details, upload branding, add Google Maps review URL, configure coupons, and choose email tone (AI vs manual).
   - Dashboard to view daily review counts, star distribution, and feedback text.
   - AI Analyzer to summarize sentiment over time ranges (today, monthly, all-time) and surface key complaints and suggested improvements.

2. **Customer QR Review Funnel**
   - QR code placed in a restaurant links to a lightweight rating page.
   - Customers rate their experience from 1–5 stars.
   - **Positive branch (4–5 stars):**
     - Optional email capture.
     - Call-to-action to leave a Google Maps review.
     - Trigger a unique, single-use coupon email.
   - **Negative/neutral branch (≤3 stars):**
     - Private feedback form (free-text feedback).
     - Optional email capture.
     - Trigger an empathetic response email with a coupon, potentially AI-generated.

3. **Insights & Sentiment Analysis**
   - AI summarizes customer feedback into restaurant-specific insights.
   - Stores sentiment summaries, key complaints, and suggested improvements for time-bucketed ranges (daily, monthly, all-time).
   - Exposed to owners via an "AI Analyzer" or insights view in the dashboard.

### Data & Persistence Model (Convex)

From `Restostar_Database_Architecture.md`, the core tables and relationships are:

- **Users**
  - Fields: `id`, `clerkUserId`, `name`, `email`, `createdAt`.
  - Represents authenticated users synchronized with Clerk.

- **Restaurants**
  - Fields: `id`, `ownerId`, `name`, `logoUrl`, `googleMapsUrl`, `createdAt`.
  - `ownerId` references `Users.id`.
  - One owner can manage multiple restaurants.

- **Coupons**
  - Fields: `id`, `restaurantId`, `sentimentType` (positive/negative), `title`, `description`, `discountValue`, `isSingleUse`, `createdAt`.
  - Defines configurable offers per restaurant, differentiated by sentiment branch (positive vs negative experiences).

- **Reviews**
  - Fields: `id`, `restaurantId`, `stars`, `feedbackText`, `isPublic`, `createdAt`.
  - Captures ratings and feedback from the QR flow.
  - `isPublic` can be used to distinguish feedback suitable for public display from private-only comments.

- **CustomerCoupons**
  - Fields: `id`, `reviewId`, `email`, `couponCode`, `isRedeemed`, `redeemedAt`, `sentAt`.
  - Links an individual customer (via email) and review to a concrete coupon instance.
  - Supports single-use enforcement and basic redemption auditing.

- **AIInsights**
  - Fields: `id`, `restaurantId`, `timeRange` (daily/monthly/all), `sentimentSummary`, `keyComplaints`, `suggestions`, `generatedAt`.
  - Stores materialized AI analysis for fast retrieval and historical comparison.

When implementing Convex functions, they should align with this schema (e.g., mutations to create reviews, assign coupons, generate insights) rather than introducing parallel or divergent models.

### End-to-End Flow Summary

Combining the PRD, user flow, and data architecture docs:

1. **Onboarding**
   - Owner signs up via Clerk → `Users` entry created.
   - Owner configures restaurant → `Restaurants` row.
   - Owner defines sentiment-specific `Coupons`.
   - Owner provides Google Maps review URL and email preferences.

2. **Customer Journey via QR**
   - Customer scans QR → front-end fetches restaurant config.
   - Customer submits a star rating (and optionally an email, feedback text).
   - System writes a `Reviews` record and, if needed, a `CustomerCoupons` record.
   - For positive experiences, customer is redirected to Google Maps and emailed a coupon.
   - For negative experiences, customer feedback is stored privately, and they receive an empathetic, possibly AI-authored email and coupon.

3. **Insights & Dashboard**
   - Background or on-demand Convex functions aggregate `Reviews` into `AIInsights` using the OpenAI API.
   - Dashboard surfaces:
     - Aggregated counts and distributions of stars over time.
     - Raw feedback snippets.
     - Time-filtered sentiment summaries and recommendations.

## Design & UX Guidelines

From `Restostar_Design_System.md`:

- **Brand Personality:** Supportive, trustworthy, modern, restaurant-first.
- **Color Palette:**
  - Primary: Emerald Green (`#10B981`).
  - Positive/neutral states: soft greens and slate/gray.
  - Warning for ≤3-star experiences: amber.
  - Error states: red.
- **Typography:**
  - Headings: Poppins.
  - Body: Inter or Lato.
- **Core Components (via shadcn/ui):**
  - Buttons (primary/secondary/ghost), star rating, forms, cards/tables, modals/dialogs, toasts.
- **UX Principles:**
  - Mobile-first QR flow with minimal friction.
  - Clear branching by sentiment (positive → Google Maps + coupon, negative → private feedback + recovery).
  - Calm, reassuring tone for negative feedback experiences.
- **Accessibility:**
  - Aim for WCAG 2.1 AA compliance, including keyboard navigation and sufficient color contrast.

These guidelines should inform component choices, theming, and copywriting in any eventual implementation of the Restostar UI.
