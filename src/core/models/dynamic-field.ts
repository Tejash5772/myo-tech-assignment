import { ValidatorFn } from '@angular/forms';

export type DynamicFieldType =
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'date';

export interface DynamicFieldOption {
    label: string;
    value: string | number | boolean;
}

export interface DynamicField {
    type: DynamicFieldType;
    name: string;
    label: string;
    placeholder?: string;
    value?: unknown;
    disabled?: boolean;
    validators?: ValidatorFn[];
    options?: DynamicFieldOption[];
    hidden?: (formValue: Record<string, unknown>) => boolean;
}