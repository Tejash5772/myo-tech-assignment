import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {

    title: string;

    message: string;

    confirmText?: string;

    cancelText?: string;

}

@Injectable({
    providedIn: 'root'
})
export class ConfirmDialogService {

    readonly isOpen = signal(false);

    readonly options = signal<ConfirmDialogOptions | null>(null);

    private resolver?: (result: boolean) => void;

    confirm(
        options: ConfirmDialogOptions
    ): Promise<boolean> {

        this.options.set({

            confirmText: 'Confirm',

            cancelText: 'Cancel',

            ...options

        });

        this.isOpen.set(true);

        return new Promise<boolean>(resolve => {

            this.resolver = resolve;

        });

    }

    confirmAction(): void {

        this.close(true);

    }

    cancelAction(): void {

        this.close(false);

    }

    private close(result: boolean): void {

        this.isOpen.set(false);

        this.options.set(null);

        this.resolver?.(result);

        this.resolver = undefined;

    }

}