// types/index.ts
export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  category?: Category;
}

export interface Table {
  id: number;
  table_number: number;
  qr_code: string;
  seating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  menu_item?: MenuItem;
  name?: string;
}

export interface Order {
  id: number;
  table_id: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  table?: Table;
  items?: OrderItem[];
  total?: number;
  qr_code?: string;
}

export interface CartItem extends Omit<OrderItem, 'id' | 'order_id'> {
  tempId: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: string;
  reference?: string;
  paid_at: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'wallet';
export type OrderStatus = 'open' | 'closed';