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
    defaultValue?: unknown;
    disabled?: boolean;
    hidden?: (formValue: any) => boolean;
    validators?: ValidatorFn[];
    options?: DynamicFieldOption[];
}