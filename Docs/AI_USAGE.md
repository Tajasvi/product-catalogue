# AI Usage Notes

## Tools and models

- GitHub Copilot SDK in VS Code was used for planning, code generation, refactoring, documentation, command execution, and browser verification.
- The model name/version was selected by the Copilot environment and is not exposed in a persistent workspace setting; no model choice was represented as a project dependency.
- AI work was constrained by the committed `CLAUDE.md` instructions, `PRODUCT_CATALOG_PLAN.md`, and the challenge document.

## Plan and specifications

- `PRODUCT_CATALOG_PLAN.md`: phased implementation plan and acceptance-criteria mapping.
- `Code Challenge-AI-Native Engineer.md`: original requirements and assessment criteria.
- `CLAUDE.md`: committed repository rules, fixed technology decisions, and quality constraints.
- `ARCHITECTURE.md`: typed system boundaries and HTTP contract.

## Five key prompts or moments

1. **Review the challenge and plan:** ask Copilot to compare the proposed solution with the stated scoring criteria and the 2–3 hour target.
2. **Trim and formalize the plan:** direct Copilot to remove non-critical infrastructure while retaining replaceable product and email boundaries.
3. **Implement backend Phases 2–4:** require strict types, Express routes, Zod validation, provider error mapping, and tests for invalid input and email failure.
4. **Implement frontend Phases 5–7:** require a single API client, all acceptance flows, accessible shared states, and a tested enquiry journey.
5. **Complete quality and review packaging:** require one-command checks, Docker Compose, Nginx, Mailpit, mobile checks, and a real end-to-end enquiry verification.

## AI review and corrections

- An early plan was judged too broad for the 2–3 hour target. The implementation scope was trimmed before source work by removing TanStack Query, caching, queues, CI, and generalized infrastructure.
- "Featured" and "top rated" were initially conflated. The plan was corrected to distinguish five curated featured products from rating-based category ordering.
- Mailpit was clarified as a local SMTP inbox simulator, not as proof of production inbox delivery.
- Strict TypeScript found incompatibilities with an initial Zod parsing option and optional enquiry fields; those were corrected rather than weakened with casts.
- A live compiled-API smoke test caught a workspace-current-directory bug in the featured configuration path. The default was changed to resolve relative to the API package.
- Dependency audit found advisories in the initially installed Nodemailer, Zod, and Vitest releases. They were upgraded and the suite/audit rerun.
- React Router and Vite later showed advisories in the initially resolved ranges. Compatible patched versions were installed and all web tests/builds were rerun.
- Strict TypeScript caught optional-property issues in async state and server field-error mapping. The code was corrected without weakening the project settings.
- Browser smoke testing verified five live featured products, a real search response, product detail/enquiry rendering, and no horizontal overflow at a 390px viewport.
- The Docker review path was tested end to end: Nginx served the production frontend, its API proxy returned five products, an enquiry was accepted, and the resulting email appeared in Mailpit.
- The first enquiry modal layout rendered correctly on desktop but did not provide a good mobile fit. AI suggestions were iteratively reviewed with measured browser rectangles at 320px, 375px, and 430px widths, then corrected with minimum-width, wrapping, viewport, and overflow rules.
- Browser testing exposed inconsistent Escape-key closing. A document-level handler and a regression test were added rather than accepting browser-specific native dialog behavior.

## How AI output was reviewed

- Generated TypeScript was checked with `strict` compiler settings rather than casts.
- Every phase ended with focused tests, production builds, and `npm audit`.
- The API and web were exercised against real browser requests, Fake Store data, and Mailpit.
- Docker was built from the same source and lockfile a reviewer will receive; generated `dist` and `node_modules` directories were not treated as submission source.
- Git diffs, commit history, dependency lock changes, error states, and mobile measurements were inspected before commits.
- Generated documentation was edited to distinguish implemented behavior from future work and to record actual time honestly.

## Prompt pattern used

The most useful prompts supplied:

- the original acceptance criteria and explicit non-goals;
- the required time-box and reviewer setup constraint;
- the relevant current files and existing decisions;
- a concrete done condition and validation method;
- permission to implement, but not to weaken strict typing or hide failures.

AI output was treated as a first implementation, not as authoritative. Incorrect or incomplete output was corrected, retested, and committed only after verification.

## Ownership

All generated code, configuration, tests, and documentation were reviewed before being committed. The submission author remains responsible for every line, dependency, decision, and trade-off, including decisions originally suggested by AI.

## Verification summary

- 26 automated tests pass.
- Strict type-check and production builds pass.
- `npm audit` reports zero known vulnerabilities.
- Docker Compose serves the production app and locally delivers a test enquiry to Mailpit.

