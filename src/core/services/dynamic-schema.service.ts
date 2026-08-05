import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Validators } from '@angular/forms';

import { environment } from '../../environments/environment';

import {
  DynamicField,
  DynamicSchemaField,
  DynamicSchemaControl
} from '../models/dynamic-field';

@Injectable({
  providedIn: 'root'
})
export class DynamicSchemaService {

  private readonly http = inject(HttpClient);

  getSchema(): Observable<DynamicField[]> {
    return this.http
      .get<DynamicSchemaField[]>(
        `${environment.apiUrl}/dynamic-schema`
      )
      .pipe(
        map(fields =>
          fields.map(field =>
            this.toDynamicField(field)
          )
        )
      );
  }

  /**
   * Converts a schema field into a DynamicField.
   *
   * This conversion is recursive so nested
   * groups / arrays can contain their own children.
   */
  private toDynamicField(
    field: DynamicSchemaField
  ): DynamicField {

    const validators = [];

    if (field.required) {
      validators.push(
        Validators.required
      );
    }

    if (field.min !== undefined) {
      validators.push(
        Validators.min(field.min)
      );
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

      /**
       * Normal dropdown options.
       *
       * Example:
       * Status -> dependentOptions[""]
       */
      options:
        field.dependentOptions?.[''] ?? [],

      /**
       * Dependent dropdown options.
       *
       * Example:
       *
       * category = 1
       * -> Ultrabook
       * -> Gaming Laptop
       */
      dependentOptions:
        field.dependentOptions,

      /**
       * Conditional visibility.
       */
      hidden:
        field.hiddenWhen
          ? value =>
            value[field.hiddenWhen!.field] ===
            field.hiddenWhen!.equals
          : undefined,

      /**
       * Conditional required validation.
       */
      requiredWhen:
        field.requiredWhen
          ? value =>
            value[field.requiredWhen!.field] ===
            field.requiredWhen!.equals
          : undefined,

      /**
       * Recursive nested fields.
       *
       * This is the important addition for
       * nested groups / arrays.
       */
      children:
        field.children?.map(child =>
          this.toDynamicField(child)
        )
    };
  }

  /**
   * Converts schema control names into
   * DynamicField types.
   */
  private mapControl(
    control: DynamicSchemaControl
  ): DynamicField['type'] {

    if (control === 'textbox') {
      return 'text';
    }

    if (control === 'dropdown') {
      return 'select';
    }

    /**
     * Arrays are supported by DynamicFieldType.
     */
    if (control === 'array') {
      return 'array';
    }

    /**
     * `group` is not currently part of DynamicFieldType.
     *
     * The DynamicField model currently supports
     * children, but does not define a `group` type.
     *
     * We therefore keep the value through a type assertion
     * until group support is added to DynamicFieldType.
     */
    if (control === 'group') {
      return 'group' as DynamicField['type'];
    }

    return control;
  }
}