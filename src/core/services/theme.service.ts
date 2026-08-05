import {
    Injectable,
    effect,
    signal
} from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    readonly theme = signal<Theme>(

        (localStorage.getItem('theme') as Theme) ?? 'light'

    );

    constructor() {

        effect(() => {

            const currentTheme = this.theme();

            document.documentElement.setAttribute(

                'data-theme',

                currentTheme

            );

            localStorage.setItem(

                'theme',

                currentTheme

            );

        });

    }

    toggleTheme(): void {

        this.theme.update(theme =>

            theme === 'light'

                ? 'dark'

                : 'light'

        );

    }

}