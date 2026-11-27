import type { ApiConfig } from "../config.js";
import type { Enquiry, EnquiryInput, EnquiryReceipt } from "../domain/enquiry.js";
import { AppError } from "../errors/app-error.js";
import type { EmailSender } from "../ports/email-sender.js";
import type { ProductProvider } from "../ports/product-provider.js";

export class EnquiryService {
  constructor(
    private readonly products: ProductProvider,
    private readonly email: EmailSender,
    private readonly emailConfig: ApiConfig["email"],
  ) {}

  async submit(input: EnquiryInput): Promise<EnquiryReceipt> {
    const product = await this.products.getProduct(input.productId);
    if (!product) {
      throw new AppError(400, "VALIDATION_ERROR", "The selected product does not exist.", [
        { field: "productId", message: "Choose an existing product." },
      ]);
    }

    const enquiry: Enquiry = {
      customer: {
        name: input.name,
        email: input.email,
        ...(input.phone === undefined ? {} : { phone: input.phone }),
      },
      product,
      message: input.message,
    };

    try {
      await this.email.send({
        from: this.emailConfig.from,
        to: this.emailConfig.salesInbox,
        replyTo: enquiry.customer.email,
        subject: `Product enquiry: ${enquiry.product.title} (#${enquiry.product.id})`,
        text: buildEnquiryEmail(enquiry),
      });
    } catch (cause) {
      throw new AppError(
        503,
        "EMAIL_DELIVERY_FAILED",
        "We could not send your enquiry. Please try again.",
        undefined,
        { cause },
      );
    }

    return {
      message: "Thank you. The sales team has received your enquiry.",
    };
  }
}

function buildEnquiryEmail(enquiry: Enquiry): string {
  const lines = [
    "New product enquiry",
    "",
    `Product: ${enquiry.product.title} (#${enquiry.product.id})`,
    `Price: ${enquiry.product.price}`,
    "",
    `Name: ${enquiry.customer.name}`,
    `Email: ${enquiry.customer.email}`,
  ];
  if (enquiry.customer.phone !== undefined) {
    lines.push(`Phone: ${enquiry.customer.phone}`);
  }
  lines.push("", "Message:", enquiry.message);
  return lines.join("\n");
}

