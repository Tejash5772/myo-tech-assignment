import {
    Directive,
    ElementRef,
    Input,
    OnInit
} from '@angular/core';

@Directive({
    selector: '[appPermission]',
    standalone: true
})
export class PermissionDirective implements OnInit {

    @Input()
    appPermission = '';

    constructor(
        private element: ElementRef<HTMLElement>
    ) { }

    ngOnInit(): void {

        // Example only.
        // Replace with your authentication/roles service later.
        const permissions = [

            'CREATE',

            'EDIT',

            'DELETE'

        ];

        if (

            !permissions.includes(this.appPermission)

        ) {

            this.element.nativeElement.remove();

        }

    }

}