import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';

import { OrderService } from '../../services/order.service';
import { Order } from '../../../../core/models/order';

import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { GridColumn } from '../../../../core/models/grid-column';
import { GridSort } from '../../../../core/models/grid-sort';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    DataGrid
  ],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList implements OnInit, OnDestroy {

  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  private allOrders: Order[] = [];

  orders: Order[] = [];

  loading = false;
  errorMessage = '';

  page = 1;
  pageSize = 5;
  totalRecords = 0;

  columns: GridColumn[] = [
    {
      field: 'id',
      header: 'Order ID',
      sortable: true
    },
    {
      field: 'customerName',
      header: 'Customer',
      sortable: true
    },
    {
      field: 'orderDate',
      header: 'Date',
      sortable: true,
      pipe: 'timeAgo'
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      pipe: 'status'
    },
    {
      field: 'totalAmount',
      header: 'Total',
      sortable: true,
      pipe: 'currency'
    }
  ];

  sortState: GridSort | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {

    this.loading = true;
    this.errorMessage = '';

    // Immediately update the UI to show skeleton
    this.cdr.detectChanges();

    this.orderService
      .getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {

          this.loading = false;

          // IMPORTANT:
          // Tell Angular to update DataGrid
          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: orders => {

          console.log(
            'Orders API response:',
            orders
          );

          this.allOrders = Array.isArray(orders)
            ? orders
            : [];

          this.totalRecords =
            this.allOrders.length;

          this.applySorting();
          this.applyPagination();

          console.log(
            'Orders loaded:',
            {
              totalRecords: this.totalRecords,
              page: this.page,
              pageSize: this.pageSize,
              visibleRecords: this.orders.length,
              loading: this.loading
            }
          );

          // Update parent + DataGrid immediately
          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'Failed to load orders:',
            error
          );

          this.allOrders = [];
          this.orders = [];

          this.totalRecords = 0;

          this.errorMessage =
            'Unable to load orders.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }

  private applyPagination(): void {

    const startIndex =
      (this.page - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    this.orders =
      this.allOrders.slice(
        startIndex,
        endIndex
      );
  }

  private applySorting(): void {

    if (!this.sortState) {
      return;
    }

    const {
      field,
      direction
    } = this.sortState;

    this.allOrders.sort((a: any, b: any) => {

      const valueA = a[field];
      const valueB = b[field];

      if (valueA == null) {
        return 1;
      }

      if (valueB == null) {
        return -1;
      }

      let comparison = 0;

      if (valueA > valueB) {
        comparison = 1;
      }

      if (valueA < valueB) {
        comparison = -1;
      }

      return direction === 'asc'
        ? comparison
        : -comparison;
    });
  }

  onPageChange(page: number): void {

    this.page = page;

    this.applyPagination();

    this.cdr.detectChanges();
  }

  onPageSizeChange(size: number): void {

    this.pageSize = size;
    this.page = 1;

    this.applyPagination();

    this.cdr.detectChanges();
  }

  onSortChange(sort: GridSort): void {

    this.sortState = sort;
    this.page = 1;

    this.applySorting();
    this.applyPagination();

    this.cdr.detectChanges();
  }

  onRowClick(order: Order): void {

    console.log(
      'Selected order:',
      order
    );
  }

  goToCreateOrder(): void {

    this.router.navigate([
      '/orders/new'
    ]);
  }

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }
}