import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { DynamicField } from '../../../core/models/dynamic-field';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss'
})
export class DynamicForm implements OnChanges {

  private readonly fb = inject(FormBuilder);

  @Input({ required: true })
  fields: DynamicField[] = [];

  @Input()
  value: Record<string, unknown> | null = null;

  @Output()
  submitForm = new EventEmitter<Record<string, unknown>>();

  form: FormGroup = this.fb.group({});

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fields']) {

      this.buildForm();

    }

    if (changes['value'] && this.value) {

      this.form.patchValue(this.value);

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

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.submitForm.emit(this.form.getRawValue());

  }

}