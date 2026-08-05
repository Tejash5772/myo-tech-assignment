import { Injectable, signal } from '@angular/core';

export type ToastType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info';

export interface ToastAction {

    label: string;

    callback: () => void;

}

export interface Toast {

    message: string;

    type: ToastType;

    action?: ToastAction;

}

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    readonly toast = signal<Toast | null>(null);

    private timeoutId?: number;

    show(
        message: string,
        type: ToastType = 'info',
        action?: ToastAction,
        duration = 5000
    ): void {

        if (this.timeoutId) {

            clearTimeout(this.timeoutId);

        }

        this.toast.set({

            message,

            type,

            action

        });

        this.timeoutId = window.setTimeout(() => {

            this.clear();

        }, duration);

    }

    success(
        message: string,
        action?: ToastAction
    ): void {

        this.show(

            message,

            'success',

            action

        );

    }

    error(message: string): void {

        this.show(

            message,

            'error'

        );

    }

    warning(message: string): void {

        this.show(

            message,

            'warning'

        );

    }

    info(message: string): void {

        this.show(

            message,

            'info'

        );

    }

    clear(): void {

        if (this.timeoutId) {

            clearTimeout(this.timeoutId);

        }

        this.toast.set(null);

    }

}