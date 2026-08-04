import { OrderItem } from './order-item';

export interface Order {
    id: number;
    customerName: string;
    orderDate: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    totalAmount: number;
    items: OrderItem[];
}