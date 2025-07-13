// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080/api/v1';

// Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

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

export interface Order {
  id: number;
  table_id: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  table?: Table;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  total: number;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: string;
  reference?: string;
  paid_at: string;
  order?: Order;
}

export interface DailyRevenue {
  date: string;
  total_revenue: number;
  total_orders: number;
  // order_details: {
  //   cash: number;
  //   credit_card: number;
  //   wallet: number;
  // };
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  total_revenue: number;
  daily_breakdown: DailyRevenue[];
}

// API Client Class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`);
  }

  async getCategoryByName(name: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/search?name=${encodeURIComponent(name)}`);
  }

  // Menu Items
  async getMenuItems(limit = 10, offset = 0): Promise<ApiResponse<{
    items: MenuItem[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/menu-items?limit=${limit}&offset=${offset}`);
  }

  async getMenuItem(id: number): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>(`/menu-items/${id}`);
  }

  async getMenuItemsByCategory(categoryId: number, limit = 10, offset = 0): Promise<ApiResponse<{
    items: MenuItem[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/menu-items/category/${categoryId}?limit=${limit}&offset=${offset}`);
  }

  async searchMenuItems(query: string, limit = 10, offset = 0): Promise<ApiResponse<{
    items: MenuItem[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/menu-items/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
  }

  // Tables
  async getTables(): Promise<ApiResponse<{ tables: Table[]; total: number }>> {
    return this.request<{ tables: Table[]; total: number }>('/tables');
  }

  async getTable(id: number): Promise<ApiResponse<Table>> {
    return this.request<Table>(`/tables/${id}`);
  }

  async getTableByNumber(number: number): Promise<ApiResponse<Table>> {
    return this.request<Table>(`/tables/number/${number}`);
  }

  async scanQRCode(qrCode: string): Promise<ApiResponse<{
    table_id: number;
    table: Table;
    has_open_order: boolean;
    open_order?: Order;
  }>> {
    return this.request(`/tables/scan?qr_code=${encodeURIComponent(qrCode)}`);
  }

  async createOrderFromQRCode(qrCode: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/tables/scan/order?qr_code=${encodeURIComponent(qrCode)}`, {
      method: 'POST',
    });
  }

  // Orders
  async createOrder(tableId: number): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId }),
    });
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  async getOrderWithItems(id: number): Promise<ApiResponse<OrderWithItems>> {
    return this.request<OrderWithItems>(`/orders/${id}/items`);
  }

  async updateOrder(id: number, status: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async closeOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/close`, {
      method: 'PUT',
    });
  }

  async getOrders(limit = 10, offset = 0): Promise<ApiResponse<{
    orders: Order[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/orders?limit=${limit}&offset=${offset}`);
  }

  async getOrdersByTable(tableId: number, limit = 10, offset = 0): Promise<ApiResponse<{
    orders: Order[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/orders/table/${tableId}?limit=${limit}&offset=${offset}`);
  }

  async getOpenOrderByTable(tableId: number): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/table/${tableId}/open`);
  }

  async getOrdersByStatus(status: string, limit = 10, offset = 0): Promise<ApiResponse<{
    orders: Order[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/orders/search?status=${status}&limit=${limit}&offset=${offset}`);
  }

  // Order Items
  async addOrderItem(orderItem: {
    order_id: number;
    item_id: number;
    quantity: number;
    notes?: string;
  }): Promise<ApiResponse<OrderItem>> {
    return this.request<OrderItem>('/orders/items', {
      method: 'POST',
      body: JSON.stringify(orderItem),
    });
  }

  async updateOrderItem(id: number, data: {
    quantity: number;
    notes?: string;
  }): Promise<ApiResponse<OrderItem>> {
    return this.request<OrderItem>(`/orders/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeOrderItem(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`/orders/items/${id}`, {
      method: 'DELETE',
    });
  }

  async getOrderItems(orderId: number): Promise<ApiResponse<OrderItem[]>> {
    return this.request<OrderItem[]>(`/orders/${orderId}/items`);
  }

  async calculateOrderTotal(orderId: number): Promise<ApiResponse<{
    order_id: number;
    items: OrderItem[];
    total: number;
    item_count: number;
  }>> {
    return this.request(`/orders/${orderId}/total`);
  }

  // Payments
  async processPayment(payment: {
    order_id: number;
    amount: number;
    method: string;
  }): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async getPayment(id: number): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${id}`);
  }

  async getPaymentByOrder(orderId: number): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/order/${orderId}`);
  }

  async getPayments(limit = 10, offset = 0): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    limit: number;
    offset: number;
  }>> {
    return this.request(`/payments?limit=${limit}&offset=${offset}`);
  }

  // Revenue
  async getDailyRevenue(date: string): Promise<ApiResponse<DailyRevenue>> {
    return this.request<DailyRevenue>(`/revenue/daily?date=${date}`);
  }

  async getMonthlyRevenue(year: number, month: number): Promise<ApiResponse<MonthlyRevenue>> {
    return this.request<MonthlyRevenue>(`/revenue/monthly?year=${year}&month=${month}`);
  }

  async getDailyRevenueRange(startDate: string, endDate: string): Promise<ApiResponse<DailyRevenue[]>> {
    return this.request<DailyRevenue[]>(`/revenue/daily/range?start_date=${startDate}&end_date=${endDate}`);
  }

  async getMonthlyRevenueRange(startDate: string, endDate: string): Promise<ApiResponse<MonthlyRevenue[]>> {
    return this.request<MonthlyRevenue[]>(`/revenue/monthly/range?start_date=${startDate}&end_date=${endDate}`);
  }

  async getTotalRevenue(startDate: string, endDate: string): Promise<ApiResponse<{
    start_date: string;
    end_date: string;
    total_revenue: number;
    total_orders: number;
  }>> {
    return this.request(`/revenue/total?start_date=${startDate}&end_date=${endDate}`);
  }
}

export const apiClient = new ApiClient();