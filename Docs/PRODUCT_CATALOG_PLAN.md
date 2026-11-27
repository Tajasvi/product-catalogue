# Code Challenge: AI-Native Engineer — Phased Plan

Goal: a small but **production-shaped** product catalogue (not a throwaway POC), submitted within 3 days, deliberately time-boxed to 2–3 hours, with every decision defensible in the follow-up interview.

The plan deliberately prioritizes the acceptance-criteria critical path and a few high-value extension boundaries. If the work exceeds the target, record the actual time honestly rather than dropping an acceptance criterion.

---

## 1. About the application

### What it is
A **product catalogue website with an enquiry form**: an online showroom where customers browse products and, if interested, contact the business. It is a **lead-generation tool, not an e-commerce store**: no cart, no payments, no customer accounts.

### What it is used for
The entrepreneur gets:
- **A showroom:** products presented clearly, with the best items highlighted.
- **A sales funnel:** interested customers reach the sales team by email.
- **A foundation:** the first version of a product that will later get real product data, a final design, a proper email service and more features.

### Who uses it
**Customer (visitor):**
1. Lands on the home page and sees the five curated featured products.
2. Opens a category and sees the highest-rated product(s) first, then the rest.
3. Searches by term and sees only matching products.
4. Opens a product tile to see its details.
5. Clicks **Enquire**, submits name, email and message, and sees a "Thank you" message.

**Sales team / entrepreneur:**
- Receives an email in the local PoC sales inbox for every enquiry (who, which product, how to reach them) and replies directly in a real deployment.
- Chooses the 5 featured products (via configuration in the PoC).

### How it works

```
Customer's browser          Your backend               External
┌────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React website │ ───► │  API server      │ ───► │ Fake Store API  │  (product data)
│  (what people  │      │  - fetches/cleans│      └─────────────────┘
│   see and click)│ ◄─── │    product data  │
└────────────────┘      │  - search logic  │      ┌─────────────────┐
                        │  - validates     │ ───► │ Email service   │  (to sales inbox)
                        │    enquiries     │      └─────────────────┘
                        └──────────────────┘
```

- **Frontend:** what the customer sees; talks **only** to our backend.
- **Backend:** owns the logic (featured selection, category ordering, search, validation, and sending email).
- **External services:** Fake Store API (placeholder product data, to be replaced later) and email (Mailpit, a local SMTP inbox simulator, now; a real provider such as AWS SES later).

Because the backend sits in the middle, the data source, look and feel, and email provider can each be swapped without rewriting the rest. That is what makes this a foundation rather than a throwaway.

### What it deliberately is not (yet)
No payments or cart, no user login, no admin dashboard (featured products set by config), no database of enquiries (email only). These go into `DECISIONS.md` as scope cuts and next steps.

---

## 2. Repository and structure

### Repo name
**`product-catalogue`** (recommended). Clear and descriptive. Alternatives: `showroom`, `catalogue-enquiry-platform`, `catalogue-foundation`, `enquiry-catalogue`. Avoid "test", "poc", "challenge" or "assessment" in the name; it undercuts the "foundation" message.

### One repo (monorepo), not two
**Decision: single repository containing `apps/api` and `apps/web`.**

Why:
- The brief asks for **one repo link and one PR** whose description is assessed.
- "Run in under 10 minutes" is simplest with one clone and one `docker compose up`.
- Frontend and backend share one API contract, so endpoint and UI changes ship in the same commit and cannot drift.
- One git history shows judgement across the whole solution; one set of `README`, `DECISIONS.md`, `AI_USAGE.md`, `CLAUDE.md`.
- Two repos would add cross-repo overhead (two PRs, versioning, duplicated config) inside a 2-3 hour time-box.

Clean separation comes from structure, not repo count: each app has its own `package.json`, tests, Dockerfile and dependencies; the frontend talks to the backend only over HTTP; neither imports the other's code.

Line for `DECISIONS.md`: *"Monorepo for atomic changes and simple setup; apps are independently buildable, so splitting later is cheap."*

When two repos would make sense (not applicable here): separate teams and release cycles, different access/security rules, independent deployment pipelines at scale.

### Target layout
```
product-catalogue/
├── apps/
│   ├── api/          # Node + TypeScript backend
│   └── web/          # React + TypeScript frontend
├── docker-compose.yml
├── .env.example
├── README.md
├── DECISIONS.md
├── AI_USAGE.md
└── CLAUDE.md
```
Optional later: `packages/contracts/` for shared types (skipped in the PoC; listed as a next step).

---

## 3. Requirements at a glance

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
- Product data behind a small interface (adapter pattern) — Fake Store is just one implementation.
- Email behind an interface — local SMTP catcher now, SES/SendGrid later.
- UI themeable and componentised (design tokens, no hard-coded styling everywhere).
- Clear frontend / backend / data-source boundaries.

Keep these extension points shallow. Avoid adding repository, unit-of-work, mapper, generalized dependency-injection, or multi-service abstractions for a 20-product MVP.

### Deliverables
Repo + feature branch + **open PR into main** (PR description is assessed), source + tests, README, `DECISIONS.md`, `AI_USAGE.md` (+ committed agent files like `CLAUDE.md`), time spent breakdown.

### Scoring areas
Solution design · Decisions & assumptions · Implementation quality · Testing · AI engineering practice.

---

## 4. Proposed stack (to confirm in Phase 0)

- **Client:** React + TypeScript (Vite), React Router, and a small shared fetch client
- **Backend:** Node.js + TypeScript (Express with Supertest, or Fastify with its built-in `inject` API), Zod for validation
- **Email (dev):** Mailpit via SMTP (free, local, shows the "sales inbox"); `nodemailer` behind an `EmailSender` interface
- **Tests:** Vitest (unit/integration), Supertest/inject for API, React Testing Library for key UI flows
- **Run:** `docker compose up` (client + api + mailpit)
- **Structure:** single monorepo `product-catalogue` (`apps/web`, `apps/api`); see section 2

Choose Express or Fastify once in Phase 0 and use its corresponding test approach consistently. Do **not** add both.

TanStack Query, client-side caching libraries, a database, distributed caching, a queue, and CI are not required for the initial submission. Keep normal loading/error/empty states in simple shared UI components.

### Minimum architecture

```text
CatalogueService
  -> ProductProvider
       -> FakeStoreProvider

EnquiryService
  -> ProductProvider
  -> EmailSender
       -> SmtpEmailSender
```

These are the important extension boundaries. The frontend talks only to the backend over HTTP.

### Initial time budget

Use this as an early warning against scope growth:

| Activity | Target |
|---|---:|
| Planning and decisions | 15 minutes |
| Backend catalogue and enquiry flows | 55 minutes |
| Frontend flows | 45 minutes |
| Docker and zero/low-config setup | 20 minutes |
| Focused automated tests | 20 minutes |
| Review and documentation | 25 minutes |

This totals approximately 3 hours. Stop adding non-critical features when a budget category is used. Record actual planning, building, testing, and review time separately in the final submission.

---

## 5. Phases

### Phase 0 — Decisions & setup
- Confirm the single backend framework and write the reasons (goes into README/DECISIONS).
- Write down assumptions up front (see section 6).
- Record the starting budget and begin the time log.
- Create the `product-catalogue` repo (monorepo with `apps/api` and `apps/web`), feature branch, `CLAUDE.md` / agent instruction file, empty `DECISIONS.md` and `AI_USAGE.md`.
- **Done when:** repo skeleton + conventions committed.

### Phase 1 — Architecture & contracts
- Define domain types: `Product`, `Category`, `Enquiry`.
- Define interfaces: `ProductProvider`, `EmailSender`.
- Define a small API contract (endpoints, response shapes, and error format).
- Config design (env-driven SMTP and provider settings, plus featured product configuration).
- Prefer a committed `featured-products.json` for the five stable PoC selections; validate the file at startup rather than silently substituting products.
- **Done when:** a short architecture diagram/notes + typed contracts exist.

### Phase 2 — Backend foundation ✅
- Project scaffold, config loader with validation, basic logging, central error handler, health endpoint, and CORS.
- `FakeStoreProvider` adapter with a bounded timeout and explicit upstream error mapping.
- Do not add caching in the initial MVP; the upstream contains only 20 products and caching would complicate invalidation and startup behavior.
- **Done when:** provider returns normalised products; unit tests pass with mocked HTTP.

### Phase 3 — Backend catalogue API ✅
- `GET /api/products/featured` (5 configured products)
- `GET /api/categories`
- `GET /api/categories/:category/products` (a top-rated section plus remaining products)
- `GET /api/products?q=` (search)
- `GET /api/products/:id`
- Input validation, 404/400 handling, tests for each.
- **Done when:** all read endpoints covered by tests and manually verifiable with curl.

### Phase 4 — Backend enquiry flow ✅
- `POST /api/enquiries` with Zod validation (name, email, phone optional, message, productId).
- Verify the product exists, build a plain-text email, and send via `EmailSender` (SMTP → Mailpit).
- Validate exact field lengths, email format, IDs, and required values. Do not use a vague "sanitisation" middleware; render data normally in React and never treat submitted content as HTML.
- Do not log customer PII.
- Treat public-host rate limiting and a honeypot as deployment follow-ups, not PoC requirements. If simple safeguards take no meaningful time, record them; do not let them delay the critical path.
- **Done when:** a valid enquiry appears in Mailpit, invalid enquiries are rejected, and an SMTP failure returns an explicit API error rather than false success.

### Phase 5 — Frontend foundation ✅
- Vite + React + TS, routing, one API client layer (the only frontend module that talks to the backend), design tokens/theme, and a layout shell with search bar and category navigation.
- Shared states: loading, error, empty.
- **Done when:** the shell renders and fetches categories from the API.

### Phase 6 — Frontend features ✅
- Home (the five configured featured products), category page (top-rated item/section plus remaining products), search results, and product details page.
- Reusable `ProductCard` / `ProductGrid`.
- Products used in a category's top-rated section must not also appear in its additional-products section.
- Accessibility basics (semantic HTML, alt text, labels, keyboard nav).
- **Done when:** all browse/search flows work end to end.

### Phase 7 — Enquiry UI ✅
- Enquire button → form (modal or page) with client-side validation, submit state, explicit error display, and "Thank you" confirmation.
- Only show the thank-you state after the backend confirms SMTP acceptance; on mail failure, keep the form and show an actionable error.
- Use the submitted product and customer data in a plain-text email: product name/ID, customer name, email, optional phone, and message.
- **Done when:** submit from UI → email visible in Mailpit → thank-you shown; mail failures are visibly unsuccessful.

### Phase 8 — Testing & quality ✅
- Backend minimum suite:
  - exactly five configured featured products are returned;
  - featured configuration fails clearly when invalid;
  - category products are ordered and partitioned without duplicates;
  - search is case-insensitive across the agreed fields;
  - invalid enquiries are rejected;
  - a valid enquiry sends expected product/customer content;
  - mail-provider failure produces an API error.
- Frontend minimum suite:
  - search submits the term and renders only matching results;
  - the enquiry interaction validates input, submits successfully, and renders the thank-you state;
  - an enquiry failure keeps the form and shows an error.
- Use lint, typecheck, and format scripts if they are cheap to configure. CI is a next step, not required for this MVP.
- **Done when:** one `npm test` runs everything green.

### Phase 9 — Dockerise & run-in-10-minutes ✅
- Dockerfiles, `docker-compose.yml`, `.env.example`, and committed defaults so the reviewer needs zero secrets or external accounts.
- The README must explicitly explain that Mailpit simulates the local sales inbox and requires no paid service/account; the reviewer verifies receipt in its local UI.
- Test from a clean clone, following README only.
- **Done when:** `docker compose up` gives working app + Mailpit UI.

### Phase 10 — Documentation & AI usage notes
- README (setup, choices, how to run tests, how to swap provider/email).
- `DECISIONS.md`: assumptions, dropped/simplified items, growth path, next steps with another day.
- Explain where Mailpit delivery stops (local SMTP simulation) and that real delivery requires an `EmailSender` implementation/configuration for SES or another provider.
- `AI_USAGE.md`: tools/models, agent files, plan/spec, 3–5 key prompts, **where AI was wrong and how you caught it** (keep notes as you go!).
- Time spent breakdown.

### Phase 11 — Review & submit
- Read every line (you must defend it), remove dead code, run a secrets check.
- Open PR from feature branch into `main`, with a strong description (what/why/trade-offs/how to test).
- Email repo link within 3 days.
- Prep for interview: be ready to explain and make a small live change.

---

## 6. Assumptions to record (draft)

| Gap in requirements | Proposed assumption |
|---|---|
| "I have chosen 5 products" | The business curates exactly five featured product IDs in a committed config file. They are not calculated from ratings. Validate all IDs at startup; fail clearly instead of silently selecting substitutes. |
| "Top rated" in category | Sort by `rating.rate`, tie-break by `rating.count`, and show the highest-rated product (or all tied highest-rated products) in a top-rated section. Show every remaining product below exactly once. |
| Search matching | Case-insensitive match on title, description, and category; performed in the backend; no fuzzy search |
| Search with no results | Friendly empty state |
| Enquiry fields | Name, email, optional phone, message; product auto-attached |
| Enquiry persistence | Not stored in PoC (email only); noted as next step (DB/queue) |
| Customer confirmation email | Not sent; only on-screen thank-you (per criteria) |
| Sales inbox | Mailpit is the reviewer-visible local sales inbox. An SMTP accepted result means local delivery succeeded; production delivery is intentionally replaceable. |
| Mail failure | Show an error and do not show the thank-you state until the backend reports success |
| Auth / cart / payments | Out of scope |
| Pagination | Fake Store is small (20 items); skipped but API shaped so it can be added |
| Currency/images | Display as given by Fake Store |

---

## 7. Cross-cutting rules while building
- Keep a running note of **AI mistakes you caught** (needed for `AI_USAGE.md`).
- Commit small and often, with meaningful messages — PR history is evidence of judgement.
- Prefer a small, clear solution over extra features; write down every cut and why.
- Never call Fake Store from the browser; never commit secrets.
- Treat the critical path as non-negotiable: browse, search, product detail, enquiry email, thank-you, and reviewer setup.
- Prioritize correctness and clear errors over optional production features. Do not show success when upstream data or email delivery failed.
- Keep generated abstractions shallow and review every line.
- Record time and scope cuts as they happen, not from memory at the end.

---

## 8. Intentional simplifications and follow-ups

### Initial submission cuts

| Cut | Why | Follow-up |
|---|---|---|
| No TanStack Query | A small shared fetch client is enough for five flows and reduces setup/review surface | Add a data-fetching cache if repeated requests or invalidation become meaningful |
| No product/HTTP cache | Fake Store has 20 products; explicit upstream behavior is easier to reason about | Add bounded caching/invalidation or a real catalogue service |
| No database or queue for enquiries | Acceptance criteria require email only; persistence would add configuration and failure modes | Add an enquiry outbox/database and retryable worker |
| No public rate limiter or honeypot | Security middleware would be partially implemented without a production threat model/deployment | Add deployment-level abuse controls, observability, and CAPTCHA/turnstile if abuse warrants it |
| No pagination | Only 20 products in the source | Add stable cursor/page contracts before connecting a larger catalogue |
| No CI workflow | Local tests and typechecking are sufficient within the time-box | Add CI only after the local commands are reliable |

### Next steps with another day

1. Add a production `EmailSender` implementation for AWS SES and deployment-compatible configuration.
2. Persist enquiries in a database with an outbox/retry worker so transient mail failures do not lose leads.
3. Add a stronger product administration/configuration workflow.
4. Replace Fake Store with the real catalogue source and add contract tests around both providers.
5. Add pagination and richer search once the real data shape and volume are known.
6. Improve accessibility, visual design tokens, responsive states, and design-level test coverage.
7. Add deployment and CI only after documenting operational ownership, monitoring, and failure alerts.

### Mailpit delivery explanation for README

The submitted application uses an `EmailSender` interface. Its local implementation sends via SMTP to Mailpit, which is included in Docker Compose and exposes a local inbox UI. No paid account is required. This satisfies the PoC review flow, while a production implementation can replace SMTP/Mailpit with AWS SES or another provider without changing the enquiry business logic.

---

## 9. Final review checklist

Before opening the PR:

- [ ] All five acceptance flows work end to end against the backend.
- [ ] The browser never calls Fake Store API directly.
- [ ] Exactly five valid featured products are configured, with clear startup validation.
- [ ] Category top-rated products and additional products do not duplicate.
- [ ] Search behavior matches the documented fields and case rules.
- [ ] Enquiry email content includes all required customer/product details.
- [ ] A valid enquiry appears in Mailpit and only then shows "Thank you."
- [ ] Invalid enquiry and mail failure paths show explicit errors.
- [ ] No PII is written to logs and no secrets are committed.
- [ ] Fresh setup works with the README and `docker compose up` in under 10 minutes.
- [ ] Focused tests, lint, and typecheck pass.
- [ ] `DECISIONS.md`, `AI_USAGE.md`, and actual time spent are complete.
- [ ] AI-generated code and documentation have been read and understood.
- [ ] The PR is open against `main`, and its description explains what, why, trade-offs, and how to test.
