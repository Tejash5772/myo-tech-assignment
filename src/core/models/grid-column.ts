import { TemplateRef } from '@angular/core';

export interface GridColumn {
  field: string;
  header: string;
  width?: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
  pipe?: 'currency' | 'status' | 'timeAgo';
}