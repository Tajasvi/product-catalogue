# Code Challenge: AI-Native Engineer — Phased Plan

Goal: a small but **production-shaped** product catalogue (not a throwaway POC), submitted within 3 days, time-boxed to 2–3 hours, with every decision defensible in the follow-up interview.

---

## 1. Requirements at a glance

### Functional (acceptance criteria)
| Feature | Requirement |
|---|---|
| Home | Show 5 featured ("top rated") products, chosen by the business |
| Category page | Top-rated products for the category **and** additional products in that category |
| Search | Search bar + button; show only products whose text matches the term |
| Product page | Click a tile, see product details |
| Enquiry | "Enquire" button on a product, form with contact details, submit → email to sales inbox + "Thank you" message to customer |

### Hard constraints
1. One client + one backend (e.g. React + TypeScript, Node.js + TypeScript). Justify in README.
2. Client must **never** call Fake Store API; everything goes through our backend.
3. Any infrastructure must be AWS-compatible.
4. Reviewer runs it locally in < 10 minutes (ideally `docker compose up`).
5. No committed secrets; provide `.env.example`.
6. No paid services / accounts needed by the reviewer.

### Hidden expectations (the "grow with the vision" clause)
Data source, look & feel and email provider **will change**, so:
- Product data behind an interface (adapter pattern) — Fake Store is just one implementation.
- Email behind an interface — local SMTP catcher now, SES/SendGrid later.
- UI themeable and componentised (design tokens, no hard-coded styling everywhere).
- Clear frontend / backend / data-source boundaries.

### Deliverables
Repo + feature branch + **open PR into main** (PR description is assessed), source + tests, README, `DECISIONS.md`, `AI_USAGE.md` (+ committed agent files like `CLAUDE.md`), time spent breakdown.

### Scoring areas
Solution design · Decisions & assumptions · Implementation quality · Testing · AI engineering practice.

---

## 2. Proposed stack (to confirm in Phase 0)

- **Client:** React + TypeScript (Vite), React Router, TanStack Query
- **Backend:** Node.js + TypeScript (Fastify or Express), Zod for validation
- **Email (dev):** Mailpit via SMTP (free, local, shows the "sales inbox"); `nodemailer` behind an `EmailSender` interface
- **Tests:** Vitest (unit/integration), Supertest/inject for API, React Testing Library for key UI flows
- **Run:** `docker compose up` (client + api + mailpit)
- **Structure:** monorepo (`/apps/web`, `/apps/api`)

---

## 3. Phases

### Phase 0 — Decisions & setup
- Confirm stack and write the reasons (goes into README/DECISIONS).
- Write down assumptions up front (see section 4).
- Create repo, feature branch, `CLAUDE.md` / agent instruction file, empty `DECISIONS.md` and `AI_USAGE.md`.
- Start a time log (planning / building / testing / reviewing).
- **Done when:** repo skeleton + conventions committed.

### Phase 1 — Architecture & contracts
- Define domain types: `Product`, `Category`, `Enquiry`.
- Define interfaces: `ProductProvider`, `EmailSender`.
- Define API contract (endpoints, response shapes, error format).
- Config design (env-driven: featured product IDs, sales inbox, SMTP, provider selection).
- **Done when:** a short architecture diagram/notes + typed contracts exist.

### Phase 2 — Backend foundation
- Project scaffold, config loader with validation, logging, central error handler, health endpoint, CORS.
- `FakeStoreProvider` adapter (timeouts, error mapping, small in-memory cache).
- **Done when:** provider returns normalised products; unit tests pass with mocked HTTP.

### Phase 3 — Backend catalogue API
- `GET /api/products/featured` (5 configured products)
- `GET /api/categories`
- `GET /api/categories/:category/products` (top-rated + additional)
- `GET /api/products?q=` (search)
- `GET /api/products/:id`
- Input validation, 404/400 handling, tests for each.
- **Done when:** all read endpoints covered by tests and manually verifiable with curl.

### Phase 4 — Backend enquiry flow
- `POST /api/enquiries` with Zod validation (name, email, phone optional, message, productId).
- Verify product exists, build email, send via `EmailSender` (SMTP → Mailpit).
- Basics: rate limiting, honeypot field, input sanitisation, no PII in logs.
- **Done when:** enquiry arrives in Mailpit; failure paths tested (invalid input, mail failure).

### Phase 5 — Frontend foundation
- Vite + React + TS, routing, API client layer (single place that talks to backend), design tokens/theme, layout shell with search bar and category nav.
- Shared states: loading, error, empty.
- **Done when:** shell renders and fetches categories from the API.

### Phase 6 — Frontend features
- Home (featured 5), Category page (top rated section + more products), Search results, Product details page.
- Reusable `ProductCard` / `ProductGrid`.
- Accessibility basics (semantic HTML, alt text, labels, keyboard nav).
- **Done when:** all browse/search flows work end to end.

### Phase 7 — Enquiry UI
- Enquire button → form (modal or page) with client-side validation, submit state, error display, "Thank you" confirmation.
- **Done when:** submit from UI → email visible in Mailpit → thank-you shown.

### Phase 8 — Testing & quality
- Backend: provider, services, routes, enquiry validation/failure.
- Frontend: search, enquiry form, one happy-path render per page.
- Lint + typecheck + format scripts; optional CI workflow (GitHub Actions).
- **Done when:** one `npm test` runs everything green.

### Phase 9 — Dockerise & run-in-10-minutes
- Dockerfiles, `docker-compose.yml`, `.env.example`, seed defaults so it works with zero config.
- Test from a clean clone, following README only.
- **Done when:** `docker compose up` gives working app + Mailpit UI.

### Phase 10 — Documentation & AI usage notes
- README (setup, choices, how to run tests, how to swap provider/email).
- `DECISIONS.md`: assumptions, dropped/simplified items, growth path, next steps with another day.
- `AI_USAGE.md`: tools/models, agent files, plan/spec, 3–5 key prompts, **where AI was wrong and how you caught it** (keep notes as you go!).
- Time spent breakdown.

### Phase 11 — Review & submit
- Read every line (you must defend it), remove dead code, run a secrets check.
- Open PR from feature branch into `main`, with a strong description (what/why/trade-offs/how to test).
- Email repo link within 3 days.
- Prep for interview: be ready to explain and make a small live change.

---

## 4. Assumptions to record (draft)

| Gap in requirements | Proposed assumption |
|---|---|
| "I have chosen 5 products" | Featured IDs configured via env/config file, not derived from ratings; fallback to top 5 by rating if unset |
| "Top rated" in category | Highest `rating.rate` (tie-break by `rating.count`); top 4 shown first, then the rest |
| Search matching | Case-insensitive match on title, description, category; done in backend; no fuzzy search |
| Search with no results | Friendly empty state |
| Enquiry fields | Name, email, optional phone, message; product auto-attached |
| Enquiry persistence | Not stored in PoC (email only); noted as next step (DB/queue) |
| Customer confirmation email | Not sent; only on-screen thank-you (per criteria) |
| Auth / cart / payments | Out of scope |
| Pagination | Fake Store is small (20 items); skipped but API shaped so it can be added |
| Currency/images | Display as given by Fake Store |

---

## 5. Cross-cutting rules while building
- Keep a running note of **AI mistakes you caught** (needed for `AI_USAGE.md`).
- Commit small and often, with meaningful messages — PR history is evidence of judgement.
- Prefer a small, clear solution over extra features; write down every cut and why.
- Never call Fake Store from the browser; never commit secrets.
