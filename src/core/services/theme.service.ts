import { Injectable, effect, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    theme = signal<'light' | 'dark'>('light');

    constructor() {

        const saved = localStorage.getItem('theme');

        if (saved) {
            this.theme.set(saved as any);
        }

        effect(() => {

            document.body.setAttribute(
                'data-theme',
                this.theme()
            );

            localStorage.setItem(
                'theme',
                this.theme()
            );

        });

    }

    toggle() {

        this.theme.update(theme =>
            theme === 'light'
                ? 'dark'
                : 'light'
        );

    }

}