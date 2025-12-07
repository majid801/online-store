
export type Role = 'client' | 'freelancer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  created_at: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  featured: boolean;
  created_at?: string;
  profiles?: Profile; // Joined data
}

export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  freelancer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  street_address: string;
  city: string;
  zip_code: string;
  product_name: string;
  total_amount: number;
  payment_status: string;
  order_status: 'placed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}
