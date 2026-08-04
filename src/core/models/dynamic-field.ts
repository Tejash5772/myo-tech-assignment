import { ValidatorFn } from '@angular/forms';

export interface DynamicField {
    type: 'text' | 'number' | 'select' | 'textarea';
    name: string;
    label: string;
    placeholder?: string;
    value?: any;
    validators?: ValidatorFn[];
    options?: DynamicOption[];
}

export interface DynamicOption {
    label: string;
    value: any;
}