import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { DynamicField, DynamicSchemaField, DynamicSchemaControl } from '../models/dynamic-field';

@Injectable({ providedIn: 'root' })
export class DynamicSchemaService {
  private readonly http = inject(HttpClient);

  getSchema(): Observable<DynamicField[]> {
    return this.http.get<DynamicSchemaField[]>(`${environment.apiUrl}/dynamic-schema`).pipe(
      map(fields => fields.map(field => this.toDynamicField(field)))
    );
  }

  private toDynamicField(field: DynamicSchemaField): DynamicField {
    const validators = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.min !== undefined) {
      validators.push(Validators.min(field.min));
    }

    return {
      type: this.mapControl(field.control),
      name: field.key,
      label: field.label,
      placeholder: field.placeholder,
      value: field.value,
      validators,
      optionsApi: field.api,
      dependsOn: field.dependsOn,

      // For dropdowns without dependsOn, e.g. Status
      options: field.dependentOptions?.[''] ?? [],

      // For dependent dropdowns, e.g. Sub Category
      dependentOptions: field.dependentOptions,

      hidden: field.hiddenWhen
        ? value => value[field.hiddenWhen!.field] === field.hiddenWhen!.equals
        : undefined,

      requiredWhen: field.requiredWhen
        ? value => value[field.requiredWhen!.field] === field.requiredWhen!.equals
        : undefined
    };
  }

  private mapControl(control: DynamicSchemaControl): DynamicField['type'] {
    if (control === 'textbox') {
      return 'text';
    }

    if (control === 'dropdown') {
      return 'select';
    }

    return control;
  }
}
