import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';

import { Router } from '@angular/router';

import {
  Subject,
  Subscription,
  finalize,
  takeUntil,
  timer
} from 'rxjs';

import { OrderService } from '../../services/order.service';
import { Order } from '../../../../core/models/order';

import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { GridColumn } from '../../../../core/models/grid-column';
import { GridSort } from '../../../../core/models/grid-sort';

import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast.service';


@Component({
  selector: 'app-orders-list',
  standalone: true,

  imports: [
    CommonModule,
    DataGrid
  ],

  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss'
})
export class OrdersList
  implements OnInit, OnDestroy {


  // =========================================================
  // SERVICES
  // =========================================================

  private readonly orderService =
    inject(OrderService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  private readonly toastService =
    inject(ToastService);


  // =========================================================
  // DESTROY
  // =========================================================

  private readonly destroy$ =
    new Subject<void>();


  // =========================================================
  // DATA
  // =========================================================

  private allOrders: Order[] = [];

  orders: Order[] = [];


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // PAGINATION
  // =========================================================

  page = 1;

  pageSize = 5;

  totalRecords = 0;


  // =========================================================
  // DELETE / UNDO
  // =========================================================

  private readonly pendingDeletes =
    new Map<
      number,
      {
        order: Order;
        index: number;
        timer: Subscription;
      }
    >();


  // =========================================================
  // ACTION TEMPLATE
  // =========================================================

  @ViewChild(
    'actionTemplate',
    { static: true }
  )
  actionTemplate!: TemplateRef<Order>;


  // =========================================================
  // GRID COLUMNS
  // =========================================================

  columns: GridColumn[] = [];


  sortState: GridSort | null = null;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.initializeColumns();

    this.loadOrders();

  }


  // =========================================================
  // GRID COLUMNS
  // =========================================================

  private initializeColumns(): void {

    this.columns = [

      {
        field: 'id',
        header: 'Order ID',
        sortable: true
      },

      {
        field: 'name',
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
      },

      {
        field: 'actions',
        header: 'Actions',
        template: this.actionTemplate
      }

    ];

  }


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  loadOrders(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.orderService
      .getAll()

      .pipe(

        takeUntil(this.destroy$),

        finalize(() => {

          this.loading = false;

          this.cdr.detectChanges();

        })

      )

      .subscribe({

        next: orders => {

          console.log(
            'Orders API response:',
            orders
          );


          this.allOrders =
            Array.isArray(orders)
              ? orders
              : [];


          this.totalRecords =
            this.allOrders.length;


          this.applySorting();

          this.applyPagination();


          console.log(
            'Orders loaded:',
            {
              totalRecords:
                this.totalRecords,

              page:
                this.page,

              pageSize:
                this.pageSize,

              visibleRecords:
                this.orders.length
            }
          );


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


  // =========================================================
  // PAGINATION
  // =========================================================

  private applyPagination(): void {

    const startIndex =
      (this.page - 1) *
      this.pageSize;


    const endIndex =
      startIndex +
      this.pageSize;


    this.orders =
      this.allOrders.slice(
        startIndex,
        endIndex
      );

  }


  // =========================================================
  // SORTING
  // =========================================================

  private applySorting(): void {

    if (!this.sortState) {

      return;

    }


    const {
      field,
      direction
    } = this.sortState;


    this.allOrders.sort(
      (a: any, b: any) => {

        const valueA =
          a[field];

        const valueB =
          b[field];


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

      }
    );

  }


  // =========================================================
  // PAGE CHANGE
  // =========================================================

  onPageChange(
    page: number
  ): void {

    this.page = page;

    this.applyPagination();

    this.cdr.detectChanges();

  }


  // =========================================================
  // PAGE SIZE CHANGE
  // =========================================================

  onPageSizeChange(
    size: number
  ): void {

    this.pageSize = size;

    this.page = 1;

    this.applyPagination();

    this.cdr.detectChanges();

  }


  // =========================================================
  // SORT CHANGE
  // =========================================================

  onSortChange(
    sort: GridSort
  ): void {

    this.sortState = sort;

    this.page = 1;

    this.applySorting();

    this.applyPagination();

    this.cdr.detectChanges();

  }


  // =========================================================
  // ROW CLICK
  // =========================================================

  onRowClick(
    order: Order
  ): void {

    console.log(
      'Selected order:',
      order
    );

  }


  // =========================================================
  // CREATE ORDER
  // =========================================================

  goToCreateOrder(): void {

    this.router.navigate([
      '/orders/new'
    ]);

  }


  // =========================================================
  // PRODUCTS
  // =========================================================

  goToProducts(): void {

    this.router.navigate([
      '/products'
    ]);

  }


  // =========================================================
  // DELETE ORDER
  // =========================================================

  async deleteOrder(
    order: Order
  ): Promise<void> {


    // -------------------------------------------------------
    // CONFIRM
    // -------------------------------------------------------

    const confirmed =
      await this.confirmDialog.confirm({

        title:
          'Delete Order',

        message:
          `Are you sure you want to delete order "${order.id}"?`,

        confirmText:
          'Delete',

        cancelText:
          'Cancel'

      });


    if (!confirmed) {

      return;

    }


    // -------------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------------

    const index =
      this.allOrders.findIndex(
        item =>
          item.id === order.id
      );


    if (index === -1) {

      return;

    }


    // -------------------------------------------------------
    // OPTIMISTIC DELETE
    // -------------------------------------------------------

    this.allOrders.splice(
      index,
      1
    );


    this.totalRecords =
      this.allOrders.length;


    this.applyPagination();


    this.cdr.detectChanges();


    // -------------------------------------------------------
    // WAIT 5 SECONDS
    // -------------------------------------------------------

    const deleteTimer =
      timer(5000).subscribe(() => {


        this.orderService
          .delete(order.id)

          .pipe(
            takeUntil(this.destroy$)
          )

          .subscribe({

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            next: () => {

              this.pendingDeletes.delete(
                order.id
              );


              this.toastService.success(
                'Order deleted successfully.'
              );

            },


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            error: () => {

              const restored =
                [...this.allOrders];


              restored.splice(
                index,
                0,
                order
              );


              this.allOrders =
                restored;


              this.totalRecords =
                this.allOrders.length;


              this.applySorting();

              this.applyPagination();


              this.pendingDeletes.delete(
                order.id
              );


              this.toastService.error(
                'Failed to delete order.'
              );


              this.cdr.detectChanges();

            }

          });

      });


    // -------------------------------------------------------
    // STORE PENDING DELETE
    // -------------------------------------------------------

    this.pendingDeletes.set(

      order.id,

      {
        order,
        index,
        timer: deleteTimer
      }

    );


    // -------------------------------------------------------
    // UNDO TOAST
    // -------------------------------------------------------

    this.toastService.warning(

      `Order "${order.id}" removed.`,

      {

        label:
          'Undo',


        callback: () => {

          const pending =
            this.pendingDeletes.get(
              order.id
            );


          if (!pending) {

            return;

          }


          // Cancel API timer
          pending.timer.unsubscribe();


          // Restore order
          const restored =
            [...this.allOrders];


          restored.splice(

            pending.index,

            0,

            pending.order

          );


          this.allOrders =
            restored;


          this.totalRecords =
            this.allOrders.length;


          this.applySorting();

          this.applyPagination();


          this.pendingDeletes.delete(
            order.id
          );


          this.toastService.info(
            'Delete cancelled.'
          );


          this.cdr.detectChanges();

        }

      }

    );

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    // Cancel pending delete timers
    this.pendingDeletes.forEach(
      pending =>
        pending.timer.unsubscribe()
    );


    this.pendingDeletes.clear();


    this.destroy$.next();

    this.destroy$.complete();

  }

}