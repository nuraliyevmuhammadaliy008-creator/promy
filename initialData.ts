/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Table } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Osh (Milliy)', price: 40000, category: 'Taom', available: true },
  { id: 'p2', name: 'Qozon Kabob', price: 55000, category: 'Taom', available: true },
  { id: 'p3', name: 'Shashlik (Mol go‘shti)', price: 18000, category: 'Taom', available: true },
  { id: 'p4', name: 'Somsa (Tandir)', price: 9000, category: 'Taom', available: true },
  { id: 'p5', name: 'Lag‘mon (Uyg‘ur)', price: 32000, category: 'Taom', available: true },
  
  { id: 'p6', name: 'Ko‘k Choy (Choynak)', price: 6000, category: 'Ichimlik', available: true },
  { id: 'p7', name: 'Limon Choy (Asal bilan)', price: 12000, category: 'Ichimlik', available: true },
  { id: 'p8', name: 'Coca-Cola 1.5L', price: 15000, category: 'Ichimlik', available: true },
  { id: 'p9', name: 'Tabiiy Sharbat (1L)', price: 20000, category: 'Ichimlik', available: true },
  { id: 'p10', name: 'Kofe (Cappuccino)', price: 18000, category: 'Ichimlik', available: true },
  
  { id: 'p11', name: 'Paxlava (Turkcha)', price: 25000, category: 'Shirinlik', available: true },
  { id: 'p12', name: 'Medovik (Asalli tort)', price: 22000, category: 'Shirinlik', available: true },
  { id: 'p13', name: 'Meva Assorti', price: 35000, category: 'Shirinlik', available: true }
];

export const DEFAULT_TABLES: Table[] = [
  { id: 't1', name: '1-Stol (Oyna oldi)', status: 'Bo‘sh', orders: [], totalPrice: 0 },
  { id: 't2', name: '2-Stol', status: 'Bo‘sh', orders: [], totalPrice: 0 },
  { id: 't3', name: '3-Stol (Oilaviy)', status: 'Bo‘sh', orders: [], totalPrice: 0 },
  { id: 't4', name: '4-Stol', status: 'Bo‘sh', orders: [], totalPrice: 0 },
  { id: 't5', name: 'VIP Xona (Kaminli)', status: 'Bo‘sh', orders: [], totalPrice: 0 }
];
