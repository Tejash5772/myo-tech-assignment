import { TemplateRef } from '@angular/core';

export interface GridColumn<T = any> {
    field: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    template?: TemplateRef<any>;
}