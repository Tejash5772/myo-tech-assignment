import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    Renderer2,
    SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[appHighlightMatch]',
    standalone: true
})
export class HighlightMatchDirective implements OnChanges {

    @Input()
    appHighlightMatch = '';

    @Input()
    searchTerm = '';

    constructor(
        private element: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnChanges(changes: SimpleChanges): void {

        const text = this.appHighlightMatch ?? '';
        const search = this.searchTerm?.trim() ?? '';

        const element =
            this.element.nativeElement as HTMLElement;

        if (!search) {

            this.renderer.setProperty(
                element,
                'textContent',
                text
            );

            return;

        }

        // Escape regex special characters
        const escapedSearch =
            search.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

        const regex =
            new RegExp(
                `(${escapedSearch})`,
                'gi'
            );

        const parts =
            text.split(regex);

        // Clear existing content
        this.renderer.setProperty(
            element,
            'textContent',
            ''
        );

        for (const part of parts) {

            if (
                part.toLowerCase() ===
                search.toLowerCase()
            ) {

                const mark =
                    this.renderer.createElement('mark');

                this.renderer.appendChild(
                    mark,
                    this.renderer.createText(part)
                );

                this.renderer.appendChild(
                    element,
                    mark
                );

            } else {

                this.renderer.appendChild(
                    element,
                    this.renderer.createText(part)
                );

            }

        }

    }

}