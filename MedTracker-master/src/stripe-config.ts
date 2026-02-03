export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
  currency?: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SGTL2wI8TSPe4d',
    priceId: 'price_1RLwPHF5yHKhCNjMquJFabff',
    name: 'Dozz Software',
    description: 'Logotipo empresarial',
    mode: 'payment',
    price: 100, // R$1.00 in cents
    currency: 'brl',
  },
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};