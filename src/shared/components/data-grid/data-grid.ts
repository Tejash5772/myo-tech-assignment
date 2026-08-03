import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { GridColumn } from '../../../core/models/grid-column';
import { GridSort } from '../../../core/models/grid-sort';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss'
})
export class DataGrid {

  @Input({ required: true })
  rows: unknown[] = [];

  @Input({ required: true })
  columns: GridColumn[] = [];

  @Input()
  loading = false;

  @Input()
  page = 1;

  @Input()
  pageSize = 10;

  @Input()
  totalRecords = 0;

  @Output()
  pageChange = new EventEmitter<number>();

  @Output()
  sortChange = new EventEmitter<GridSort>();

  sortField = '';

  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: GridColumn): void {

    if (!column.sortable) {

      return;

    }

    const field = column.field.toString();

    if (this.sortField === field) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortField = field;

      this.sortDirection = 'asc';

    }

    this.sortChange.emit({

      field,

      direction: this.sortDirection

    });

  }

  previousPage(): void {

    if (this.page > 1) {

      this.pageChange.emit(this.page - 1);

    }

  }

  nextPage(): void {

    const totalPages = Math.ceil(
      this.totalRecords / this.pageSize
    );

    if (this.page < totalPages) {

      this.pageChange.emit(this.page + 1);

    }

  }

}