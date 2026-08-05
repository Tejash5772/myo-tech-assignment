export interface Product {
    id: number;
    name: string;
    categoryId: number;
    price: number;
    stock: number;
    status: string;
    createdAt: string;
    image?: string | null;
}