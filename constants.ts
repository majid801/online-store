// Supabase Configuration
export const SUPABASE_PROJECT_URL = "https://rnukjeiobpvqvjwquroe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5wfcDIyD-_GK9WwmVf821Q_u0Xlmfkm";
export const SUPABASE_TABLE_NAME = "orders";

// Mock Data for the Checkout
export const INITIAL_CART = [
  {
    id: "prod_1",
    name: "Premium Leather Satchel",
    price: 195.00,
    image: "https://picsum.photos/200/200?random=1",
    quantity: 1
  },
  {
    id: "prod_2",
    name: "Wireless Noise-Canceling Headphones",
    price: 249.99,
    image: "https://picsum.photos/200/200?random=2",
    quantity: 1
  }
];
