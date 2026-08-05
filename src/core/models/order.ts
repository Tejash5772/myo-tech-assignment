import { OrderItem } from './order-item';

export interface OrderCustomer {
    name: string;
    email: string;
    phone: string;
}

export interface OrderTax {
    name: string;
    rate: number;
}

export interface OrderDiscount {
    name: string;
    amount: number;
}

export interface Order {
    id: number;

    customer: OrderCustomer;

    orderDate: string;

    status: 'Pending' | 'Completed' | 'Cancelled';

    items: OrderItem[];

    taxes: OrderTax[];

    discounts: OrderDiscount[];

    shipping: number;

    totalAmount: number;
}