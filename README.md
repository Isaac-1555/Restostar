# Restostar

Restostar is a web app that helps new restaurant owners earn more positive reviews and handle critical feedback in an organized, actionable way.

It focuses on:
- Guiding **happy** guests to leave public reviews on major platforms.
- Capturing **unhappy** guests privately so you can fix issues before they hit your public rating.

---

## Features

- Review funnel:
  - Simple in-restaurant flow (QR/tablet) that asks guests about their experience.
  - Happy-path guests are nudged to leave public reviews on sites like Google and TripAdvisor.
- Critical feedback capture:
  - If guests report problems, they are routed to a private feedback form (not public review sites).
  - Owner dashboard to see what went wrong, when, and at which location.
- Response templates:
  - Suggested wording for answering negative reviews professionally and consistently.
- Basic analytics:
  - Track number of feedback submissions, ratio of happy vs unhappy responses, and public review links followed.

---

## How It Works

1. Restaurant staff provide guests with a Restostar link or QR code after the meal.
2. Guest answers a short “How was everything?” flow.
3. If the guest is satisfied:
   - They see links/buttons to your preferred public review platforms.
4. If the guest is unsatisfied:
   - They see a short form to describe what went wrong and optionally share contact details.
   - The feedback is stored internally so the owner or manager can follow up and improve operations.

---

## Tech Stack

This section is intentionally generic; update it to match the actual stack in the repo.

- Frontend: React or vanilla HTML/CSS/JS
- Backend: Node.js/Express (or your chosen framework)
- Database: MongoDB/PostgreSQL/SQLite for storing internal feedback
- Deployment: Any Node-compatible host (Render, Railway, Heroku, etc.)

---

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Git installed to clone the repository.

### Installation

# Clone the repository
git clone https://github.com/Isaac-1555/Restostar.git
cd Restostar

# Install dependencies
npm install

# Start development server
npm run dev

## Configuration

Create a `.env` file (or equivalent) for:

* `PORT` – Port for the web server.
* `DATABASE_URL` – Connection string for your database.
* `REVIEW_LINK_GOOGLE` – URL to your Google Business review page.
* `REVIEW_LINK_TRIPADVISOR` – URL to your TripAdvisor listing.
* Any email/notification credentials (if you send alerts on new critical feedback).

## Usage

* Share the Restostar link or place QR codes on tables, receipts, or near the exit.
* Check the internal feedback dashboard regularly to:
   * Spot repeated issues (slow service, cold food, etc.).
   * Reply to guests who left contact information.
   * Update staff training or menu items based on patterns.
* Periodically verify that all external review links (Google, Yelp, TripAdvisor) are still correct.

## Roadmap

Planned or possible enhancements:

* Multi-location support with per-branch analytics.
* SMS or email follow-up sequences to thank happy guests and recover unhappy ones.
* Integration with POS or reservation systems.
* Exportable reports for management meetings.

## Contributing

Contributions, feature ideas, and bug reports are welcome.

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Submit a pull request with a clear description of the change.

## License

Add your chosen license here, for example:

This project is licensed under the MIT License – see the `LICENSE` file for details.
