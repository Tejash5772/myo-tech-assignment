import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  DynamicField,
  DynamicFieldOption
} from '../../../core/models/dynamic-field';

import {
  CategoryService
} from '../../../features/categories/services/category';
import { FileUpload } from '../file-upload/file-upload/file-upload';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUpload
  ],

  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss'
})
export class DynamicForm
  implements OnChanges, OnDestroy {

  private readonly fb =
    inject(FormBuilder);

  private readonly categoryService =
    inject(CategoryService);

  private readonly destroy$ =
    new Subject<void>();

  private readonly dependencyDestroy$ =
    new Subject<void>();

  @Input({ required: true })
  fields: DynamicField[] = [];

  @Input()
  value: Record<string, unknown> | null = null;

  @Output()
  submitForm =
    new EventEmitter<Record<string, unknown>>();

  form: FormGroup =
    this.fb.group({});

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (changes['fields']) {

      this.dependencyDestroy$.next();

      this.buildForm();

      this.loadApiOptions();

      this.setupDependencies();

    }

    if (
      changes['value'] &&
      this.value
    ) {

      this.patchValue(
        this.form,
        this.value
      );

      this.refreshDependentFields(
        this.form.getRawValue()
      );

    }

  }

  // --------------------------------------------------
  // FORM BUILDING
  // --------------------------------------------------

  private buildForm(): void {

    const controls: Record<
      string,
      AbstractControl
    > = {};

    this.fields.forEach(field => {

      controls[field.name] =
        this.createControl(field);

    });

    this.form =
      this.fb.group(controls);

  }

  private createControl(
    field: DynamicField
  ): AbstractControl {

    if (field.type === 'array') {
      return this.createFormArray(field);
    }

    if (field.children?.length) {

      return this.createFormGroup(
        field.children
      );

    }

    return new FormControl(

      {
        value:
          field.value ?? null,

        disabled:
          field.disabled ?? false
      },

      field.validators ?? []

    );

  }

  private createFormGroup(
    fields: DynamicField[]
  ): FormGroup {

    const controls: Record<
      string,
      AbstractControl
    > = {};

    fields.forEach(field => {

      controls[field.name] =
        this.createControl(field);

    });

    return this.fb.group(controls);

  }

  private createFormArray(
    field: DynamicField,
    values: unknown[] = []
  ): FormArray<FormGroup> {

    const array = this.fb.array<FormGroup>([]);

    if (values.length) {
      values.forEach(value => {
        array.push(
          this.createArrayItem(
            field,
            value
          )
        );
      });
    } else {
      array.push(
        this.createArrayItem(field)
      );
    }

    return array;
  }

  private createArrayItem(
    field: DynamicField,
    value?: unknown
  ): FormGroup {

    const controls: Record<string, any> = {};

    const itemValue =
      value && typeof value === 'object'
        ? value as Record<string, unknown>
        : {};

    field.children?.forEach(child => {

      if (child.type === 'array') {

        const childValues =
          Array.isArray(itemValue[child.name])
            ? itemValue[child.name] as unknown[]
            : [];

        controls[child.name] =
          this.createFormArray(
            child,
            childValues
          );

        return;
      }

      controls[child.name] =
        new FormControl(
          {
            value:
              itemValue[child.name]
              ?? child.value
              ?? null,

            disabled:
              child.disabled
              ?? false
          },
          child.validators ?? []
        );
    });

    return this.fb.group(controls);
  }

  // --------------------------------------------------
  // ARRAY HELPERS
  // --------------------------------------------------

  getArray(
    control: AbstractControl
  ): FormArray {

    return control as FormArray;

  }

  addArrayItem(
    field: DynamicField
  ): void {

    const array =
      this.form.get(field.name) as FormArray;

    if (!array) {
      return;
    }

    array.push(
      this.createArrayItem(field)
    );

  }

  removeArrayItem(
    field: DynamicField,
    index: number
  ): void {

    const array =
      this.form.get(field.name) as FormArray;

    if (!array) {
      return;
    }

    if (array.length <= 1) {
      return;
    }

    array.removeAt(index);

  }

  // --------------------------------------------------
  // DEPENDENCIES
  // --------------------------------------------------

  private setupDependencies(): void {

    this.fields
      .filter(field => field.dependsOn)
      .forEach(field => {

        const parent =
          this.form.get(
            field.dependsOn!
          );

        if (!parent) {
          return;
        }

        parent.valueChanges
          .pipe(
            takeUntil(this.destroy$),
            takeUntil(
              this.dependencyDestroy$
            )
          )
          .subscribe(() => {

            this.refreshDependentFields(
              this.form.getRawValue()
            );

          });

      });

    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(
          this.dependencyDestroy$
        )
      )
      .subscribe(value => {

        this.refreshConditionalValidation(
          value
        );

      });

    this.refreshDependentFields(
      this.form.getRawValue()
    );

    this.refreshConditionalValidation(
      this.form.getRawValue()
    );

  }

  private loadApiOptions(): void {

    this.fields
      .filter(
        field =>
          field.optionsApi ===
          '/api/categories'
      )
      .forEach(field => {

        this.categoryService
          .getAll()
          .pipe(
            takeUntil(this.destroy$),
            takeUntil(
              this.dependencyDestroy$
            )
          )
          .subscribe(categories => {

            field.options =
              categories.map(
                category => ({

                  label:
                    category.name,

                  value:
                    category.id

                })
              );

          });

      });

  }

  private refreshDependentFields(
    value: Record<string, unknown>
  ): void {

    this.fields
      .filter(field => field.dependsOn)
      .forEach(field => {

        const control =
          this.form.get(field.name);

        if (!control) {
          return;
        }

        const parentValue =
          String(
            value[field.dependsOn!] ?? ''
          );

        const options =
          field.dependentOptions?.[
          parentValue
          ] ?? [];

        this.setOptions(
          field,
          options
        );

        /*
         * Only clear the current value
         * when it is no longer valid.
         */
        const currentValue =
          control.value;

        const exists =
          options.some(
            option =>
              String(option.value) ===
              String(currentValue)
          );

        if (
          currentValue !== null &&
          currentValue !== undefined &&
          currentValue !== '' &&
          !exists
        ) {

          control.setValue(
            null,
            {
              emitEvent: false
            }
          );

        }

      });

  }

  private setOptions(
    field: DynamicField,
    options: DynamicFieldOption[]
  ): void {

    field.options = options;

  }

  // --------------------------------------------------
  // CONDITIONAL VALIDATION
  // --------------------------------------------------

  private refreshConditionalValidation(
    value: Record<string, unknown>
  ): void {

    this.fields.forEach(field => {

      const control =
        this.form.get(field.name);

      if (!control) {
        return;
      }

      const shouldBeRequired =
        field.requiredWhen?.(value) ??
        false;

      const validators =
        [
          ...(field.validators ?? [])
        ].filter(
          validator =>
            validator !==
            Validators.required
        );

      if (shouldBeRequired) {

        validators.push(
          Validators.required
        );

      }

      control.setValidators(
        validators
      );

      control.updateValueAndValidity({
        emitEvent: false
      });

    });

  }

  // --------------------------------------------------
  // PATCH VALUE
  // --------------------------------------------------

  private patchValue(
    form: FormGroup,
    value: Record<string, unknown>
  ): void {

    Object.entries(value).forEach(
      ([key, fieldValue]) => {

        const control =
          form.get(key);

        if (!control) {
          return;
        }

        if (
          control instanceof FormArray &&
          Array.isArray(fieldValue)
        ) {

          control.clear();

          const field =
            this.fields.find(
              item =>
                item.name === key
            );

          if (!field) {
            return;
          }

          fieldValue.forEach(item => {

            control.push(
              this.createArrayItem(
                field,
                item
              )
            );

          });

          return;

        }

        if (
          control instanceof FormGroup &&
          fieldValue &&
          typeof fieldValue === 'object'
        ) {

          this.patchValue(
            control,
            fieldValue as Record<
              string,
              unknown
            >
          );

          return;

        }

        control.setValue(
          fieldValue,
          {
            emitEvent: false
          }
        );

      }
    );

  }

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.submitForm.emit(
      this.form.getRawValue()
    );

  }

  onFileSelected(
    event: Event,
    fieldName: string
  ): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0] ?? null;

    this.form.get(fieldName)?.setValue(file);

    this.form.get(fieldName)?.markAsTouched();
  }

  // --------------------------------------------------
  // DESTROY
  // --------------------------------------------------

  ngOnDestroy(): void {

    this.dependencyDestroy$.next();
    this.dependencyDestroy$.complete();

    this.destroy$.next();
    this.destroy$.complete();

  }

}