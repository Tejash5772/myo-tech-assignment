import { Component, OnInit, inject, signal } from '@angular/core';
import { DynamicForm } from '../../../../shared/components/dynamic-form/dynamic-form';
import { DynamicField } from '../../../../core/models/dynamic-field';
import { DynamicSchemaService } from '../../../../core/services/dynamic-schema.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-dynamic-form-demo',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  templateUrl: './dynamic-form-demo.html',
  styleUrl: './dynamic-form-demo.scss'
})
export class DynamicFormDemo implements OnInit {
  private readonly schemaService = inject(DynamicSchemaService);

  readonly fields = signal<DynamicField[]>([]);
  readonly submitted = signal<Record<string, unknown> | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.schemaService.getSchema().subscribe({
      next: fields => {
        this.fields.set(fields);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(value: Record<string, unknown>): void {
    this.submitted.set(value);
  }
}
