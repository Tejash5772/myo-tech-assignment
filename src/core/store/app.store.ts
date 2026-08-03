import {
    Injectable,
    computed,
    signal
} from '@angular/core';

import { Product } from '../models/product';

@Injectable({
    providedIn: 'root'
})
export class AppStore {

    readonly cart = signal<Product[]>([]);

    readonly preferences = signal({

        language: 'en',

        theme: 'light'

    });

    readonly cartCount = computed(() =>

        this.cart().length

    );

    addToCart(product: Product): void {

        this.cart.update(items => [

            ...items,

            product

        ]);

    }

    removeFromCart(id: number): void {

        this.cart.update(items =>

            items.filter(item => item.id !== id)

        );

    }

    clearCart(): void {

        this.cart.set([]);

    }

}