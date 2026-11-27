# Decisions and Assumptions

## Submission summary

This is a production-shaped React web catalogue, not an e-commerce site. The MVP covers five featured products, category browsing, search, product details, and customer enquiries delivered to Mailpit for local review.

The implementation deliberately favors a small, reviewable critical path and a few extension boundaries over broad production infrastructure.

## Technology choices

### React + TypeScript client

React + TypeScript matches the permitted client stack and supports a componentized UI without coupling the visual design to the backend. Vite keeps local feedback fast. A small fetch client is preferred over TanStack Query for the catalogue's five initial flows.

The client is a responsive web application, including product and enquiry layouts tested at phone widths. The challenge's native iOS/Android requirement applies only when the mobile client option is chosen. A Swift/Kotlin application is therefore intentionally out of scope. A real phone can access the Docker-hosted web client on the same Wi-Fi network; iOS Simulator uses localhost and Android Emulator uses `10.0.2.2`.

### Express + TypeScript backend

Express is selected over Fastify because it is familiar, widely understood, easy to review, and integrates directly with Supertest. The backend is the only layer that accesses Fake Store API and the email provider.

### Monorepo

The frontend and backend live in one repository for one-command local setup, one PR, and atomic API/UI changes. They remain independently buildable workspaces and communicate only over HTTP.

### Local email

Mailpit provides an account-free local SMTP inbox. The API only reports success after SMTP acceptance. Production delivery will use another `EmailSender` implementation, such as AWS SES, without changing the enquiry service.

Mail delivery is plain text. The message contains the product, price, customer name, reply email, optional phone, and enquiry message. No customer PII is logged.

### Runtime packaging

The web and API have multi-stage Dockerfiles. Nginx serves the production React bundle and proxies `/api` to the API container. Compose waits for health checks before bringing dependent services online and includes Mailpit, so a reviewer needs one command and no paid accounts or secrets.

## Recorded assumptions

- Exactly five featured product IDs are curated in `apps/api/config/featured-products.json`.
- Featured products are not calculated from ratings.
- Invalid or missing featured IDs are a startup/configuration error; no silent fallback is used.
- Category products are ordered by `rating.rate`, then `rating.count`.
- The highest-rated product, including any exact first-place ties, forms the top-rated section. Remaining products are additional products and are not duplicated.
- Search is case-insensitive across title, description, and category. It is exact substring matching, not fuzzy search.
- Enquiries contain name, email, optional phone, message, and product ID.
- Enquiries are emailed but not persisted in the MVP.
- No confirmation email is sent to the customer; only an on-screen thank-you is shown.
- The thank-you state is shown only after `EmailSender.send` resolves. SMTP/provider failure leaves the form open and shows an explicit error.
- Images, currency values, and ratings are displayed as supplied by Fake Store.
- Pagination is omitted because the source contains only 20 products.
- Search and category matching are performed by the backend, not directly in the browser.
- Cart, payments, authentication, and administration are out of scope.
- Mailpit is the PoC sales inbox simulator. Real external inbox delivery is a provider/deployment decision, not represented as already implemented.

## Growth boundaries

The important replaceable ports are:

- `ProductProvider`: allows Fake Store to be replaced by a real catalogue without changing services or routes.
- `EmailSender`: allows Mailpit SMTP to be replaced by AWS SES or another production provider.
- Backend HTTP API: keeps data-provider details out of the React client.
- React components and design tokens: allow visual design to change independently.

The domain is intentionally shallow; no repository, unit-of-work, generalized dependency-injection, or mapper frameworks are added.

## UX decisions

- The enquiry form is a native accessible dialog rather than an inline panel, with a close button, Escape-key handling, backdrop dismissal, and scroll locking.
- The mobile dialog is vertically centered, constrained to the viewport, and internally scrollable on short screens.
- Form controls use a 16px font size on phones to avoid iOS input zoom.
- Product, form, dialog, and grid children have explicit minimum-width and wrapping rules to prevent horizontal clipping at 320px, 375px, and 430px.
- Loading, empty, upstream-error, validation, submit, and mail-failure states remain visible and explicit.

## Intentional simplifications

The first submission excludes TanStack Query, caching, a database, an enquiry queue, CI, pagination, production rate limiting, and a honeypot. These do not affect the acceptance-criteria critical path and would increase setup and review cost inside the 2–3 hour target.

Generated `node_modules`, `dist`, coverage, local environment files, and TypeScript build-info files are not committed. Docker and `npm ci` reproduce dependencies and build output from source plus the lockfile.

## Requirements kept

- The browser never calls Fake Store API directly.
- React and Express communicate only through the HTTP API.
- The reviewer can start the complete application with `docker compose up --build`.
- No paid service, reviewer account, or committed secret is required.
- Enquiry delivery is verified against Mailpit.
- The main catalogue/enquiry paths are covered by automated tests.
- The application remains independently buildable and deployable on AWS-compatible containers.

## Next with another day

- Add a production AWS SES `EmailSender`.
- Persist enquiries with an outbox and retries.
- Add pagination and richer search after the real catalogue size is known.
- Replace Fake Store and verify the adapter with contract tests.
- Add deployment observability, abuse controls, and CI.
- Add real catalogue administration for featured-product selection.
- Run broader automated accessibility testing and tune the final visual design with the entrepreneur.

## Time log

Approximate active time was 3 hours 35 minutes, exceeding the suggested time-box because mobile UX, live SMTP, and clean-clone packaging were explicitly verified:

| Activity | Approximate time |
|---|---:|
| Planning, requirements, and architecture | 20 minutes |
| Backend catalogue and enquiry flows | 55 minutes |
| React catalogue UI and interaction flows | 55 minutes |
| Tests, dependency remediation, and review | 30 minutes |
| Docker, Mailpit, and end-to-end verification | 35 minutes |
| Mobile modal refinements and final documentation | 20 minutes |

## Verification performed

- 26 tests pass across API and web workspaces.
- Strict TypeScript checks pass.
- Production API and web builds pass.
- `npm audit` reports no known vulnerabilities.
- Docker Compose configuration is valid.
- A live Compose smoke test served the production frontend, returned five featured products, accepted an enquiry, and confirmed the email in Mailpit.
- Browser checks covered product detail, search, enquiry opening/closing, desktop, and phone widths from 320px to 430px.

