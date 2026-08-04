import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
export class DynamicForm implements OnInit {

  private readonly fb = inject(FormBuilder);

  @Input({ required: true })

  fields: DynamicField[] = [];

  @Output()

  submitForm = new EventEmitter<any>();

  form!: FormGroup;

  ngOnInit(): void {

    const controls: Record<string, FormControl> = {};

    this.fields.forEach(field => {

      controls[field.name] = new FormControl(

        field.value ?? null,

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