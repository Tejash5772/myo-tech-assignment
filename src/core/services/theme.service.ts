import {
    Injectable,
    effect,
    signal
} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    readonly theme = signal<'light' | 'dark'>('light');

    constructor() {

        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'light' || savedTheme === 'dark') {

            this.theme.set(savedTheme);

        }

        effect(() => {

            document.documentElement.setAttribute(

                'data-theme',

                this.theme()

            );

            localStorage.setItem(

                'theme',

                this.theme()

            );

        });

    }

    toggle(): void {

        this.theme.update(theme =>

            theme === 'light'

                ? 'dark'

                : 'light'

        );

    }

}