import type { Product } from "./catalogue.js";

export interface EnquiryInput {
  productId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface Enquiry {
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  product: Product;
  message: string;
}

export interface EnquiryReceipt {
  message: "Thank you. The sales team has received your enquiry.";
}

