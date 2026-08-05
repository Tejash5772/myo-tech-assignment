import { Component, OnInit, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { DynamicForm } from '../../../../shared/components/dynamic-form/dynamic-form';
import { DynamicField } from '../../../../core/models/dynamic-field';
import { DynamicSchemaService } from '../../../../core/services/dynamic-schema.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dynamic-form-demo',
  standalone: true,
  imports: [DynamicForm, JsonPipe],
  templateUrl: './dynamic-form-demo.html',
  styleUrl: './dynamic-form-demo.scss'
})
export class DynamicFormDemo implements OnInit {

  private readonly schemaService = inject(DynamicSchemaService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly fields = signal<DynamicField[]>([]);
  readonly submitted = signal<Record<string, unknown> | null>(null);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.schemaService.getSchema().subscribe({
      next: fields => {
        this.fields.set(fields);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.errorMessage.set(
          'Unable to load dynamic schema.'
        );
      }
    });
  }

  onSubmit(value: Record<string, unknown>): void {

    this.submitted.set(value);

    this.successMessage.set('');
    this.errorMessage.set('');

    this.saving.set(true);

    const product = {
      name: value['productName'],
      categoryId: Number(value['category']),
      subCategory: value['subCategory'] ?? null,
      price: Number(value['price']),
      stock: Number(value['stock']),
      status: value['status'],
      inactiveReason: value['inactiveReason'] ?? null,
      image: value['image'] ?? null,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.http
      .post(
        `${environment.apiUrl}/products`,
        product
      )
      .subscribe({

        next: savedProduct => {

          this.submitted.set(
            savedProduct as Record<string, unknown>
          );

          this.successMessage.set(
            'Product created successfully.'
          );

          this.saving.set(false);

          // Redirect to Product List
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 1000);
        },

        error: () => {

          this.errorMessage.set(
            'Failed to create product.'
          );

          this.saving.set(false);
        }
      });
  }
}