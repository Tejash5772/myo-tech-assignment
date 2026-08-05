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

        const text = this.appHighlightMatch;

        if (!this.searchTerm.trim()) {

            this.renderer.setProperty(
                this.element.nativeElement,
                'innerHTML',
                text
            );

            return;

        }

        const regex = new RegExp(

            `(${this.searchTerm})`,

            'gi'

        );

        const highlighted = text.replace(

            regex,

            '<mark>$1</mark>'

        );

        this.renderer.setProperty(

            this.element.nativeElement,

            'innerHTML',

            highlighted

        );

    }

}