import {
    Directive,
    ElementRef,
    Input,
    Renderer2,
    inject
} from '@angular/core';

import { PermissionService } from '../../core/services/permission.service';

@Directive({
    selector: '[appPermission]',
    standalone: true
})
export class PermissionDirective {

    private readonly element = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly permissionService = inject(PermissionService);

    @Input()
    set appPermission(permission: string) {

        this.updateVisibility(permission);

    }

    private updateVisibility(permission: string): void {

        const hasPermission =
            this.permissionService.hasPermission(permission);

        if (hasPermission) {

            this.renderer.removeStyle(
                this.element.nativeElement,
                'display'
            );

        } else {

            this.renderer.setStyle(
                this.element.nativeElement,
                'display',
                'none'
            );

        }

    }

}