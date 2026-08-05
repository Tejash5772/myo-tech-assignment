import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterCondition, FilterGroup, FilterOperator } from '../../../../core/models/predicate-filter';

export interface FilterField {
  field: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: {
    label: string;
    value: any;
  }[];
}

@Component({
  selector: 'app-predicate-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './predicate-filter.html',
  styleUrl: './predicate-filter.scss'
})
export class PredicateFilter {

  @Input()
  fields: FilterField[] = [];

  @Output()
  apply = new EventEmitter<FilterGroup>();

  @Output()
  clear = new EventEmitter<void>();

  readonly operators: {
    value: FilterOperator;
    label: string;
  }[] = [
      {
        value: 'equals',
        label: 'Equals'
      },
      {
        value: 'notEquals',
        label: 'Not Equals'
      },
      {
        value: 'contains',
        label: 'Contains'
      },
      {
        value: 'startsWith',
        label: 'Starts With'
      },
      {
        value: 'endsWith',
        label: 'Ends With'
      },
      {
        value: 'greaterThan',
        label: 'Greater Than'
      },
      {
        value: 'greaterThanOrEqual',
        label: 'Greater Than or Equal'
      },
      {
        value: 'lessThan',
        label: 'Less Than'
      },
      {
        value: 'lessThanOrEqual',
        label: 'Less Than or Equal'
      }
    ];

  filter: FilterGroup = this.createGroup();

  private createGroup(): FilterGroup {

    return {
      logic: 'AND',
      conditions: [],
      groups: []
    };
  }

  addCondition(
    group: FilterGroup = this.filter
  ): void {

    group.conditions.push({
      field: this.fields[0]?.field ?? '',
      operator: 'equals',
      value: ''
    });
  }

  removeCondition(
    group: FilterGroup,
    index: number
  ): void {

    group.conditions.splice(index, 1);
  }

  addGroup(
    parent: FilterGroup = this.filter
  ): void {

    parent.groups.push(
      this.createGroup()
    );
  }

  removeGroup(
    parent: FilterGroup,
    index: number
  ): void {

    parent.groups.splice(index, 1);
  }

  changeField(
    condition: FilterCondition
  ): void {

    const field = this.fields.find(
      item => item.field === condition.field
    );

    if (field?.type === 'number') {
      condition.value = null;
      return;
    }

    condition.value = '';
  }

  getField(
    fieldName: string
  ): FilterField | undefined {

    return this.fields.find(
      field => field.field === fieldName
    );
  }

  applyFilters(): void {

    this.apply.emit(
      this.cloneGroup(this.filter)
    );
  }

  clearFilters(): void {

    this.filter = this.createGroup();

    this.clear.emit();
  }

  private cloneGroup(
    group: FilterGroup
  ): FilterGroup {

    return {
      logic: group.logic,

      conditions: group.conditions.map(
        condition => ({
          ...condition
        })
      ),

      groups: group.groups.map(
        child => this.cloneGroup(child)
      )
    };
  }
}