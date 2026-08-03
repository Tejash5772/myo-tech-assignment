import { Injectable, signal } from '@angular/core';

export interface Toast {

    type: 'success' | 'error' | 'warning';

    message: string;

}

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    toast = signal<Toast | null>(null);

    show(type: Toast['type'], message: string) {

        this.toast.set({ type, message });

        setTimeout(() => {
            this.toast.set(null);
        }, 5000);

    }

}