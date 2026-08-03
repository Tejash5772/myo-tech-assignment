import { Injectable, signal, computed } from "@angular/core";
import { Product } from "../../features/products/models/product";

@Injectable({
    providedIn: 'root'
})
export class AppStore {

    cart = signal<Product[]>([]);

    preferences = signal({

        theme: 'light',

        language: 'en'

    });

    cartCount = computed(() => this.cart().length);

}