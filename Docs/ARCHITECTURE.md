# Architecture and API Contract

## Boundaries

```text
React client
  -> HTTP API
       -> CatalogueService
            -> ProductProvider
                 -> FakeStoreProvider
       -> EnquiryService
            -> ProductProvider
            -> EmailSender
                 -> SmtpEmailSender
```

The React client never accesses Fake Store. Product retrieval and email delivery are replaceable at their narrow provider boundaries.

## Configuration

Configuration is read and validated when the API starts.

| Name | Purpose |
|---|---|
| `API_PORT` | API listener port |
| `WEB_ORIGIN` | Allowed browser origin |
| `FAKE_STORE_API_URL` | Product provider base URL |
| `FAKE_STORE_TIMEOUT_MS` | Bounded upstream request timeout |
| `FEATURED_PRODUCTS_FILE` | Five curated product IDs |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP connection for local Mailpit |
| `SMTP_FROM` | Sender address |
| `SALES_INBOX` | Destination inbox |

No credentials are required for the local Mailpit flow.

## Endpoints

All JSON responses use a `data` envelope. Expected errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "details": [
      {
        "field": "email",
        "message": "Enter a valid email address."
      }
    ]
  }
}
```

`details` is optional.

| Method | Path | Response |
|---|---|---|
| `GET` | `/api/products/featured` | `ApiEnvelope<Product[]>`; exactly five configured products |
| `GET` | `/api/categories` | `ApiEnvelope<Category[]>` |
| `GET` | `/api/categories/:slug/products` | `ApiEnvelope<CategoryProducts>` |
| `GET` | `/api/products?q=:term` | `ApiEnvelope<Product[]>` plus the matching `term` as metadata |
| `GET` | `/api/products/:id` | `ApiEnvelope<Product>` |
| `POST` | `/api/enquiries` | `EnquiryReceipt` after successful SMTP acceptance |
| `GET` | `/health` | `{ "status": "ok" }` |

Expected status codes:

- `200`: catalogue request or successful enquiry
- `400`: invalid path, query, or request body
- `404`: unknown product/category
- `502`: invalid response or failure from Fake Store
- `503`: the email provider cannot deliver the enquiry

## Category ordering

Products are sorted by descending `rating.rate`, then descending `rating.count`, and finally ascending product ID for stable output. The first product and exact ties with it are `topRated`; every other product appears in `additional`.

## Enquiry success

The enquiry route verifies the referenced product, sends a plain-text message, and returns success only after `EmailSender.send` resolves. On provider failure, it returns `EMAIL_DELIVERY_FAILED`; the client must retain the form and must not show "Thank you."

