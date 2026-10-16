import type { OrderStatus } from "../orders/order.types";

export interface DashboardOverview {
totalSales: number;
totalOrders: number;
totalCustomers: number;
totalProducts: number;
pendingOrders: number;
processingOrders: number;
}

export interface DashboardRecentOrder {
id: string;
orderNumber: string;
customerName: string;
total: number;
status: OrderStatus;
createdAt: string;
}

export interface DashboardLowStockItem {
variantId: string;
productName: string;
sku: string;
color: string | null;
size: string | null;
quantity: number;
reservedQuantity: number;
availableQuantity: number;
lowStockThreshold: number;
}

export interface DashboardData {
overview: DashboardOverview;
recentOrders: DashboardRecentOrder[];
lowStock: DashboardLowStockItem[];
}

export interface DashboardResponse {
success: boolean;
data: DashboardData;
}