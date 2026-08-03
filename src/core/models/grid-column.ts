import { TemplateRef } from '@angular/core';

export interface GridColumn<T = unknown> {
    field: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    template?: TemplateRef<unknown>;
}