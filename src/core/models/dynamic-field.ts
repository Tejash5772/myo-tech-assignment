import { ValidatorFn } from '@angular/forms';

export type DynamicFieldType =
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'date'
    | 'group'
    | 'array'
    | 'file'

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
    optionsApi?: string;

    dependsOn?: string;

    dependentOptions?: Record<
        string,
        DynamicFieldOption[]
    >;

    hidden?: (
        formValue: Record<string, unknown>
    ) => boolean;

    requiredWhen?: (
        formValue: Record<string, unknown>
    ) => boolean;

    // Nested dynamic fields
    children?: DynamicField[];
}

export type DynamicSchemaControl =
    | DynamicFieldType
    | 'textbox'
    | 'dropdown'
    | 'group'
    | 'array';

export interface DynamicSchemaField {
    key: string;
    control: DynamicSchemaControl;
    label: string;

    placeholder?: string;
    value?: unknown;

    required?: boolean;
    min?: number;

    api?: string;

    dependsOn?: string;

    dependentOptions?: Record<
        string,
        DynamicFieldOption[]
    >;

    hiddenWhen?: {
        field: string;
        equals: string | number | boolean | null;
    };

    requiredWhen?: {
        field: string;
        equals: string | number | boolean | null;
    };

    /**
     * Child fields for nested groups / arrays.
     */
    children?: DynamicSchemaField[];
}