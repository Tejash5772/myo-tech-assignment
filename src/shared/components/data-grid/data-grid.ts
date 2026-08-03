import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { GridColumn } from '../../../core/models/grid-column';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.html',
  styleUrls: ['./data-grid.scss']
})
export class DataGrid {

  @Input() columns: GridColumn[] = [];

  @Input() data: any[] = [];

  @Input() total = 0;

  @Input() page = 1;

  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();

  @Output() sortChange =
    new EventEmitter<{ field: string, order: 'asc' | 'desc' }>();

  sortField = '';

  sortOrder: 'asc' | 'desc' = 'asc';

  onSort(field: string) {

    if (this.sortField === field) {

      this.sortOrder =
        this.sortOrder === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortField = field;

      this.sortOrder = 'asc';

    }

    this.sortChange.emit({

      field,

      order: this.sortOrder

    });

  }

}