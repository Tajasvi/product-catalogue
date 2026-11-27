# Product Catalogue Agent Instructions

## Goal

Build the challenge's five acceptance-criteria flows as a small, production-shaped React and Node.js catalogue. Prefer clear, reviewable code over breadth.

## Fixed decisions

- Use one monorepo with `apps/api` and `apps/web`.
- Use React + TypeScript for the client and Express + TypeScript for the backend.
- The browser must never call Fake Store API or contain its URL.
- Keep product access behind `ProductProvider` and email delivery behind `EmailSender`.
- Use five configured featured product IDs; fail clearly if the configuration is invalid.
- Use Mailpit locally. No paid account or secret is required to review the project.
- Do not add a database, enquiry queue, cache, authentication, cart, checkout, or CI during the MVP unless the plan is explicitly updated.
- Do not log customer PII.

## Engineering rules

- Keep changes small and aligned with `PRODUCT_CATALOG_PLAN.md`.
- Validate external input at the API boundary.
- Return explicit loading, empty, validation, upstream, and email-failure states.
- Never report enquiry success before SMTP accepts the message.
- Add focused tests for changed behavior.
- Update `DECISIONS.md`, `AI_USAGE.md`, and the time log when decisions or implementation time materially change.
- Review generated code before considering a phase complete.

