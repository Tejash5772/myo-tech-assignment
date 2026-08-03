import { Injectable, signal, computed } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AppStore {

    cart = signal<any[]>([]);

    preferences = signal({

        theme: 'light',

        language: 'en'

    });

    cartCount = computed(() => this.cart().length);

}