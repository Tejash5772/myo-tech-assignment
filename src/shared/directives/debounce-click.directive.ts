import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    Output
} from '@angular/core';

@Directive({
    selector: '[appDebounceClick]',
    standalone: true
})
export class DebounceClickDirective implements OnDestroy {

    @Input()
    debounceTime = 500;

    @Output()
    debounceClick = new EventEmitter<Event>();

    private timeoutId?: ReturnType<typeof setTimeout>;

    @HostListener('click', ['$event'])
    click(event: Event): void {

        event.preventDefault();
        event.stopPropagation();

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {

            this.debounceClick.emit(event);

        }, this.debounceTime);

    }

    ngOnDestroy(): void {

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

    }

}