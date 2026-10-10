export type ProductKind = 'cfg' | 'lua';

export type PaymentMethod = 'funpay' | 'discord';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  status: OrderStatus;
  amount: number;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
};