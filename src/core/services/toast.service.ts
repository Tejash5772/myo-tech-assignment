import { Injectable, signal } from '@angular/core';

export type ToastType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info';

export interface ToastMessage {

    message: string;

    type: ToastType;

}

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    readonly toast = signal<ToastMessage | null>(null);

    private readonly duration = 3000;

    show(
        message: string,
        type: ToastType = 'info'
    ): void {

        this.toast.set({

            message,

            type

        });

        setTimeout(() => {

            this.clear();

        }, this.duration);

    }

    success(message: string): void {

        this.show(

            message,

            'success'

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

        this.toast.set(null);

    }

}