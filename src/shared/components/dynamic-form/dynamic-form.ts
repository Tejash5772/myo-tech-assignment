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

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DynamicField, DynamicFieldOption } from '../../../core/models/dynamic-field';
import { CategoryService } from '../../../features/categories/services/category';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss'
})
export class DynamicForm implements OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly destroy$ = new Subject<void>();
  private readonly dependencyDestroy$ = new Subject<void>();

  @Input({ required: true })
  fields: DynamicField[] = [];

  @Input()
  value: Record<string, unknown> | null = null;

  @Output()
  submitForm = new EventEmitter<Record<string, unknown>>();

  form: FormGroup = this.fb.group({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.dependencyDestroy$.next();
      this.buildForm();
      this.loadApiOptions();
      this.setupDependencies();
    }

    if (changes['value'] && this.value) {
      this.form.patchValue(this.value, { emitEvent: false });
      this.refreshDependentFields(this.form.getRawValue());
    }
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};

    this.fields.forEach(field => {
      controls[field.name] = new FormControl(
        {
          value: field.value ?? null,
          disabled: field.disabled ?? false
        },
        field.validators ?? []
      );
    });

    this.form = this.fb.group(controls);
  }

  private setupDependencies(): void {
    this.fields
      .filter(field => field.dependsOn)
      .forEach(field => {
        const parent = this.form.get(field.dependsOn!);
        if (!parent) {
          return;
        }

        parent.valueChanges
          .pipe(takeUntil(this.destroy$), takeUntil(this.dependencyDestroy$))
          .subscribe(() => this.refreshDependentFields(this.form.getRawValue()));
      });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), takeUntil(this.dependencyDestroy$))
      .subscribe(value => this.refreshConditionalValidation(value));

    this.refreshDependentFields(this.form.getRawValue());
    this.refreshConditionalValidation(this.form.getRawValue());
  }

  private loadApiOptions(): void {
    this.fields
      .filter(field => field.optionsApi === '/api/categories')
      .forEach(field => {
        this.categoryService.getAll()
          .pipe(takeUntil(this.destroy$), takeUntil(this.dependencyDestroy$))
          .subscribe(categories => {
            field.options = categories.map(category => ({
              label: category.name,
              value: category.id
            }));
          });
      });
  }

  private refreshDependentFields(value: Record<string, unknown>): void {
    this.fields
      .filter(field => field.dependsOn)
      .forEach(field => {
        const control = this.form.get(field.name);
        if (!control) {
          return;
        }

        const parentValue = String(value[field.dependsOn!] ?? '');
        const options = field.dependentOptions?.[parentValue] ?? [];

        control.setValue(null, { emitEvent: false });
        this.setOptions(field, options);
      });
  }

  private setOptions(field: DynamicField, options: DynamicFieldOption[]): void {
    field.options = options;
  }

  private refreshConditionalValidation(value: Record<string, unknown>): void {
    this.fields.forEach(field => {
      const control = this.form.get(field.name);
      if (!control) {
        return;
      }

      const shouldBeRequired = field.requiredWhen?.(value) ?? false;
      const validators = [...(field.validators ?? [])].filter(validator => validator !== Validators.required);

      if (shouldBeRequired) {
        validators.push(Validators.required);
      }

      control.setValidators(validators);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitForm.emit(this.form.getRawValue());
  }

  ngOnDestroy(): void {
    this.dependencyDestroy$.next();
    this.dependencyDestroy$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
