export interface ApiConfig {
  port: number;
  webOrigin: string;
  productProvider: {
    baseUrl: string;
    timeoutMs: number;
  };
  featuredProductsFile: string;
  email: {
    host: string;
    port: number;
    secure: boolean;
    from: string;
    salesInbox: string;
  };
}

export interface FeaturedProductsConfig {
  productIds: number[];
}

