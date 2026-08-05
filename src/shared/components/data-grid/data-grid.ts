import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';

import {
  CommonModule,
  NgTemplateOutlet
} from '@angular/common';

import { GridColumn } from '../../../core/models/grid-column';
import { GridSort } from '../../../core/models/grid-sort';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader';
import { DebounceClickDirective } from '../../directives/debounce-click.directive';
import { HighlightMatchDirective } from '../../directives/highlight-match.directive';
import { PermissionDirective } from '../../directives/permission.directive';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { StatusBadgePipe } from '../../pipes/status-badge.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonLoader,
    CustomCurrencyPipe,
    StatusBadgePipe,
    TimeAgoPipe,
    HighlightMatchDirective,
    NgTemplateOutlet
  ],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.scss'
})
export class DataGrid {

  @Input({ required: true })
  rows: any[] = [];

  @Input({ required: true })
  columns: GridColumn[] = [];

  @Input()
  loading = false;

  @Input()
  page = 1;

  @Input()
  pageSize = 5;

  @Input()
  totalRecords = 0;

  @Input()
searchTerm = '';

  @Output()
  pageChange = new EventEmitter<number>();

  @Output()
  pageSizeChange = new EventEmitter<number>();

  @Output()
  sortChange = new EventEmitter<GridSort>();

  @Output()
  rowClick = new EventEmitter<any>();

  readonly sortField = signal('');

  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.totalRecords / this.pageSize)
    );
  }

  sort(column: GridColumn): void {

    if (!column.sortable) {
      return;
    }

    const field = column.field.toString();

    if (this.sortField() === field) {
      this.sortDirection.update(value =>
        value === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      field,
      direction: this.sortDirection()
    });
  }

  previousPage(): void {

    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }

  }

  nextPage(): void {

    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }

  }

  changePageSize(size: number): void {

    this.pageSizeChange.emit(size);

  }

  onRowClick(row: any): void {

    this.rowClick.emit(row);

  }

}