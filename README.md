# Restostar

Restostar is a QR-powered guest feedback platform that helps restaurants turn great experiences into 5-star Google reviews while keeping negative feedback private for recovery.

---

## Features

- **QR Code Reviews**: Table-side feedback entry via QR code for dine-in, takeout, or delivery.
- **Smart Review Routing**: Happy guests get routed to leave public reviews on Google; unhappy guests are redirected to private feedback.
- **Automated Coupons**: Reward satisfied guests with trackable one-time offers delivered via email.
- **AI Insights**: Surface recurring complaints, praise, and improvement themes automatically.
- **Owner Dashboard**: View star distribution, private feedback, and review analytics in one place.
- **Coupon Verification**: Staff can easily verify and redeem coupons through the dashboard.

---

## How It Works

1. **Set up once**: Add business details, review links, and offer settings.
2. **Place QR code**: Use on tables, receipts, takeout packaging, or counter signage.
3. **Sentiment branching**: Satisfied guests see a public review prompt; unhappy guests share private feedback.
4. **Act on patterns**: Use dashboard and AI summaries to spot repeat issues and improve operations.

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk
- **Backend/DB**: Convex
- **Animations**: Lottie React
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Isaac-1555/Restostar.git
cd Restostar

# Install dependencies
cd restostar-app
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in `restostar-app/` with:

- `VITE_CLERK_PUBLISHABLE_KEY` – Clerk authentication key
- `CONVEX_DEPLOY_KEY` – Convex deployment key

---

## Project Structure

```
restostar-app/
├── src/
│   ├── assets/          # SVGs and Lottie animations
│   ├── components/       # Reusable UI components
│   │   ├── HeroWorkflowAnimation.tsx
│   │   └── StarField.tsx
│   ├── routes/          # Page components
│   │   ├── HomePage.tsx
│   │   └── owner/
│   └── ...
├── docs/                # Design system, PRD, user flow, DB architecture
└── ...
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

MIT
