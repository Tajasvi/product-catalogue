# Product Catalogue

A React + TypeScript product catalogue with an Express + TypeScript backend. Product data is fetched by the backend from Fake Store API, and enquiries are delivered through an SMTP adapter. The local Docker setup includes Mailpit as an account-free sales inbox.

## Run locally

Requirements: Docker Desktop or Docker Engine with Compose.

```sh
docker compose up --build
```

Open:

- Catalogue: <http://localhost:8080>
- Mailpit inbox: <http://localhost:8025>
- API health: <http://localhost:3000/health>

No environment file or external account is required. Optional overrides can be copied from `.env.example`.

### Open the catalogue on a mobile browser

1. Start the Docker services with `docker compose up --build` on your computer.
2. Connect your phone or tablet to the same Wi-Fi or local network as the computer.
3. Find the computer's local IPv4 address.
4. On the mobile device, open `http://<ipaddress>:8080`, replacing `<ipaddress>` with that address (for example, `http://192.168.1.25:8080`).

If the page does not load, allow inbound connections to port `8080` in the computer's firewall and check that the network does not isolate wireless clients. The web container proxies API requests, so the mobile browser does not need to access port `3000` directly.

## Verify an enquiry

1. Open a product and select **Enquire**.
2. Complete the form and submit it.
3. Open Mailpit at <http://localhost:8025> and inspect the new message.
4. The application shows **Thank you** only after SMTP accepts the message.

Mailpit is a local SMTP inbox simulator, not a production email provider. A production `EmailSender` implementation can use AWS SES or another provider without changing the enquiry service.

## Develop without Docker

Requirements: Node.js 22+ and npm.

```sh
npm ci
npm run dev --workspace @product-catalogue/api
npm run dev --workspace @product-catalogue/web
```

The API defaults to <http://localhost:3000> and Vite to <http://localhost:5173>. For development, use a local Mailpit process or otherwise configure `SMTP_HOST` and `SMTP_PORT`.

## Quality checks

```sh
npm run check
```

This runs strict type-checking, all backend/frontend tests, production builds, and the dependency audit.

## Technology and growth

- React + TypeScript client
- Express + TypeScript API
- `ProductProvider` isolates the product data source
- `EmailSender` isolates SMTP/Mailpit from enquiry behavior
- Design tokens and reusable components isolate the visual theme
- `DECISIONS.md` records assumptions, cuts, and follow-ups
- `AI_USAGE.md` records AI direction and review

See `ARCHITECTURE.md` for the HTTP contract and system boundaries.

