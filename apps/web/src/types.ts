export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

export interface Category {
  name: string;
  slug: string;
}

export interface CategoryProducts {
  category: Category;
  topRated: Product[];
  additional: Product[];
}

export interface EnquiryInput {
  productId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ApiValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiValidationDetail[];
  };
}

