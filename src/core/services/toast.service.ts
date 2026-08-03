import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {

    id: number;

    type: ToastType;

    message: string;

    duration?: number;

}

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    readonly toasts = signal<Toast[]>([]);

    show(
        type: ToastType,
        message: string,
        duration = 5000
    ): void {

        const toast: Toast = {

            id: Date.now(),

            type,

            message,

            duration

        };

        this.toasts.update(value => [...value, toast]);

        setTimeout(() => {

            this.remove(toast.id);

        }, duration);

    }

    remove(id: number): void {

        this.toasts.update(value =>

            value.filter(x => x.id !== id)

        );

    }

    clear(): void {

        this.toasts.set([]);

    }

}