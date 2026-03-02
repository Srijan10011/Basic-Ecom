export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category_id: number;
    is_featured: boolean;
    badge?: string;
    badge_color?: string;
    stock?: number;
    created_at: string;
    updated_at: string;
    categories?: {
        id: number;
        name: string;
    };
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

export interface Order {
    id: string;
    order_number: string;
    user_id?: string | null;
    total_amount: string;
    status: OrderStatus;
    order_date: string;
    created_at: string;
    updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Review {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    comment: string;
    image_url?: string;
    owner_reply?: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}