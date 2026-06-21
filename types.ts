/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CafeUser {
  id: string;
  ownerName: string;
  email: string;
  password?: string; // Opt out of storing in UI state once loaded
  cafeName: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type TableStatus = 'Bo‘sh' | 'Band' | 'Hisoblangan';

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  orders: OrderItem[];
  totalPrice: number;
}

export type ProductCategory = 'Taom' | 'Ichimlik' | 'Shirinlik';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  available: boolean; // bor (true) / tugagan (false)
}

export interface IncomeRecord {
  id: string;
  tableId: string;
  tableName: string;
  amount: number;
  timestamp: string; // ISO string format
}

export interface CustomWidget {
  id: string;
  type: 'analytics' | 'recent_sales' | 'quick_stats' | 'cafe_info';
  title: string;
  w: number; // grid width (1-3)
}
