import {
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  finalize,
  Subscription,
  timer,
  map
} from 'rxjs';

import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { ProductService } from '../../services/product.service';

import { Product } from '../../../../core/models/product';
import { Category } from '../../../../core/models/category';

import { GridColumn } from '../../../../core/models/grid-column';
import { GridSort } from '../../../../core/models/grid-sort';

import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { ProductForm } from '../product-form/product-form';
import { ToastService } from '../../../../core/services/toast.service';
import { ExportService } from '../../../../shared/services/export.service';
import { PdfExportService } from '../../../../shared/services/pdf-export.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { CanComponentDeactivate } from '../../../../core/models/can-component-deactivate';
import { DebounceClickDirective } from '../../../../shared/directives/debounce-click.directive';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';
import { FilterField, PredicateFilter } from '../../../../shared/components/predicate-filter/predicate-filter/predicate-filter';
import { PredicateFilterService } from '../../../../core/services/predicate-filter.service';
import { FilterCondition, FilterGroup } from '../../../../core/models/predicate-filter';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataGrid,
    ProductForm,
    DebounceClickDirective,
    PermissionDirective,
    PredicateFilter
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, CanComponentDeactivate {

  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly exportService = inject(ExportService);
  private readonly pdfExportService = inject(PdfExportService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly predicateFilterService = inject(PredicateFilterService);
  private readonly pendingDeletes = new Map<
    number,
    {
      product: Product;
      index: number;
      timer: Subscription;
    }
  >();

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly totalRecords = signal(0);
  readonly search = signal('');

  readonly showModal = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly categories = toSignal(
    this.route.data.pipe(
      map(data => data['categories'] as Category[] ?? [])
    ),
    {
      initialValue: [] as Category[]
    }
  );

  @ViewChild('actionTemplate', { static: true })
  actionTemplate!: TemplateRef<Product>;

  @ViewChild(ProductForm)
  productForm?: ProductForm;

  @ViewChild('imageTemplate', { static: true })
  imageTemplate!: TemplateRef<Product>;

  page = 1;
  pageSize = 5;

  sortField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: GridColumn[] = [];

  readonly search$ = toObservable(this.search);
  readonly filter = signal<FilterGroup | null>(null);

  filterFields: FilterField[] = [];

  ngOnInit(): void {

    this.columns = [

      {
        field: 'id',
        header: 'ID',
        sortable: true
      },
      {
        field: 'name',
        header: 'Product',
        sortable: true
      },
      {
        field: 'image',
        header: 'Image',
        template: this.imageTemplate
      },
      {
        field: 'price',
        header: 'Price',
        sortable: true,
        pipe: 'currency'
      },
      {
        field: 'stock',
        header: 'Stock',
        sortable: true
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        pipe: 'status'
      },
      {
        field: 'actions',
        header: 'Actions',
        template: this.actionTemplate
      },
      {
        field: 'createdAt',
        header: 'Created',
        sortable: true,
        pipe: 'timeAgo'
      },

    ];

    this.filterFields = [
      {
        field: 'name',
        label: 'Product',
        type: 'text'
      },
      {
        field: 'categoryId',
        label: 'Category',
        type: 'select',
        options: this.categories().map(category => ({
          label: category.name,
          value: category.id
        }))
      },
      {
        field: 'price',
        label: 'Price',
        type: 'number'
      },
      {
        field: 'stock',
        label: 'Stock',
        type: 'number'
      },
      {
        field: 'status',
        label: 'Status',
        type: 'select',
        options: [
          {
            label: 'Active',
            value: 'Active'
          },
          {
            label: 'Inactive',
            value: 'Inactive'
          }
        ]
      }
    ];

    this.route.queryParams
      .pipe(

        tap(params => {

          this.page = +(params['page'] ?? 1);

          this.pageSize = +(params['pageSize'] ?? 10);

          this.sortField = params['sortField'] ?? 'id';

          this.sortDirection = params['sortDirection'] ?? 'asc';

          this.search.set(params['search'] ?? '');

        }),

        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe(() => {

        this.loadProducts();

      });

    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {

          this.page = 1;

          this.updateQueryParams();

        }),
        switchMap(() => this.fetchProducts()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

  }

  private fetchProducts() {

    this.loading.set(true);

    return this.productService.search({

      _page: this.page,
      _limit: this.pageSize,
      _sort: this.sortField,
      _order: this.sortDirection,
      q: this.search()

    }).pipe(

      tap(result => {

        this.products.set(result.items);

        this.totalRecords.set(result.total);

      }),

      finalize(() => {

        this.loading.set(false);

      })

    );

  }

  loadProducts(): void {

    this.fetchProducts()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

  }

  onSearch(value: string): void {

    this.search.set(value);

  }

  onPageChange(page: number): void {

    this.page = page;

    if (this.filter()) {

      this.applyPredicateFilter();

      return;

    }

    this.updateQueryParams();

  }

  onPageSizeChange(pageSize: number): void {

    this.pageSize = pageSize;

    this.page = 1;

    if (this.filter()) {

      this.applyPredicateFilter();

      return;

    }

    this.updateQueryParams();

  }

  onSortChange(sort: GridSort): void {

    this.sortField = sort.field;

    this.sortDirection = sort.direction;

    this.page = 1;

    if (this.filter()) {

      this.applyPredicateFilter();

      return;

    }

    this.updateQueryParams();

  }

  private updateQueryParams(): void {

    this.router.navigate([], {

      relativeTo: this.route,

      queryParams: {

        page: this.page,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        search: this.search()

      },

      queryParamsHandling: 'merge'

    });

  }

  openAddProduct(): void {

    this.selectedProduct.set(null);

    this.showModal.set(true);

  }

  openEditProduct(product: Product): void {

    this.selectedProduct.set(product);

    this.showModal.set(true);

  }

  async closeModal(): Promise<void> {

    if (!this.selectedProduct()) {

      this.showModal.set(false);

      return;

    }

    const canClose = await (this.productForm?.canDeactivate() ?? true);

    if (!canClose) {

      return;

    }

    this.selectedProduct.set(null);

    this.showModal.set(false);

  }

  saveProduct(product: Partial<Product>): void {

    this.loading.set(true);

    const request = this.selectedProduct()
      ? this.productService.update(
        this.selectedProduct()!.id,
        product
      )
      : this.productService.create({
        ...product,
        createdAt: new Date().toISOString()
      });

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: () => {

          const isEdit = !!this.selectedProduct();

          // Close modal
          this.selectedProduct.set(null);
          this.showModal.set(false);

          this.toastService.success(
            isEdit
              ? 'Product updated successfully.'
              : 'Product created successfully.'
          );

          // IMPORTANT:
          // Reload the current paginated data.
          // Do NOT push the new product into `products`.
          this.loadProducts();
        },

        error: () => {

          this.loading.set(false);

          this.toastService.error(
            'Failed to save product.'
          );

        }

      });
  }

  async deleteProduct(product: Product): Promise<void> {

    const confirmed = await this.confirmDialog.confirm({

      title: 'Delete Product',

      message: `Are you sure you want to delete "${product.name}"?`,

      confirmText: 'Delete',

      cancelText: 'Cancel'

    });

    if (!confirmed) {

      return;

    }

    const currentProducts = [...this.products()];

    const index = currentProducts.findIndex(
      p => p.id === product.id
    );

    if (index === -1) {
      return;
    }

    // Optimistic UI
    currentProducts.splice(index, 1);

    this.products.set(currentProducts);

    // Delay actual delete
    const deleteTimer = timer(5000).subscribe(() => {

      this.productService
        .delete(product.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({

          next: () => {

            this.pendingDeletes.delete(product.id);

            this.toastService.success(
              'Product deleted successfully.'
            );

          },

          error: () => {

            const restored = [...this.products()];

            restored.splice(index, 0, product);

            this.products.set(restored);

            this.pendingDeletes.delete(product.id);

            this.toastService.error(
              'Failed to delete product.'
            );

          }

        });

    });

    this.pendingDeletes.set(product.id, {
      product,
      index,
      timer: deleteTimer
    });

    this.toastService.warning(
      `"${product.name}" removed.`,
      {
        label: 'Undo',
        callback: () => {

          const pending = this.pendingDeletes.get(product.id);

          if (!pending) {
            return;
          }

          pending.timer.unsubscribe();

          const restored = [...this.products()];

          restored.splice(
            pending.index,
            0,
            pending.product
          );

          this.products.set(restored);

          this.pendingDeletes.delete(product.id);

          this.toastService.info(
            'Delete cancelled.'
          );

        }
      }
    );

  }

  private getExportData(products: Product[]): Array<{
    ID: number;
    Name: string;
    Category: string;
    Price: number;
    Stock: number;
    Status: string;
    CreatedAt: string;
  }> {

    return products.map(product => ({
      ID: product.id,

      Name: product.name,

      Category: this.categories()
        .find(category => category.id === product.categoryId)
        ?.name ?? '',

      Price: product.price,

      Stock: product.stock,

      Status: product.status,

      CreatedAt: product.createdAt
    }));

  }

  exportProducts(): void {

    this.productService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: allProducts => {

          const exportData =
            this.getExportData(allProducts);

          this.exportService.exportToCsv(
            'products',
            exportData
          );

        },

        error: () => {

          this.toastService.error(
            'Failed to export products.'
          );

        }

      });

  }

  exportProductsPdf(): void {

    this.productService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: allProducts => {

          const exportData =
            this.getExportData(allProducts);

          this.pdfExportService.exportToPdf(
            'products',
            'Products Report',
            exportData
          );

        },

        error: () => {

          this.toastService.error(
            'Failed to export products.'
          );

        }

      });

  }

  canDeactivate(): boolean | Promise<boolean> {

    if (!this.showModal()) {

      return true;

    }

    return this.productForm?.canDeactivate() ?? true;

  }

  onFilterApply(filter: FilterGroup): void {

    this.filter.set(filter);

    this.page = 1;

    this.applyPredicateFilter();

  }

  onFilterClear(): void {

    this.filter.set(null);

    this.page = 1;

    this.loadProducts();

  }

  private applyPredicateFilter(): void {

    const activeFilter = this.filter();

    if (!activeFilter) {
      this.loadProducts();
      return;
    }

    this.loading.set(true);

    this.productService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({

        next: allProducts => {

          let result = [...allProducts];

          // Apply normal search first
          const searchValue =
            this.search()
              .trim()
              .toLowerCase();

          if (searchValue) {

            result = result.filter(product =>
              product.name
                .toLowerCase()
                .includes(searchValue)
            );

          }

          // Apply predicate filter
          result = result.filter(product =>
            this.evaluateFilterGroup(
              product,
              activeFilter
            )
          );

          // Sorting
          result.sort((a: any, b: any) => {

            const valueA = a[this.sortField];
            const valueB = b[this.sortField];

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

            return this.sortDirection === 'asc'
              ? comparison
              : -comparison;

          });

          // Total after filtering
          this.totalRecords.set(
            result.length
          );

          // Pagination
          const start =
            (this.page - 1) * this.pageSize;

          const end =
            start + this.pageSize;

          this.products.set(
            result.slice(start, end)
          );

        },

        error: () => {

          this.products.set([]);

          this.totalRecords.set(0);

          this.toastService.error(
            'Failed to apply filters.'
          );

        }

      });

  }

  private evaluateFilterGroup(
    product: Product,
    group: FilterGroup
  ): boolean {

    const conditionResults =
      group.conditions.map(condition =>
        this.evaluateCondition(
          product,
          condition
        )
      );

    const groupResults =
      group.groups.map(childGroup =>
        this.evaluateFilterGroup(
          product,
          childGroup
        )
      );

    const results = [
      ...conditionResults,
      ...groupResults
    ];

    // Empty group = don't filter anything
    if (results.length === 0) {
      return true;
    }

    if (group.logic === 'AND') {
      return results.every(Boolean);
    }

    return results.some(Boolean);

  }

  private evaluateCondition(
    product: Product,
    condition: FilterCondition
  ): boolean {

    const actualValue =
      (product as any)[condition.field];

    const expectedValue =
      condition.value;

    if (
      actualValue === null ||
      actualValue === undefined
    ) {
      return false;
    }

    const actual =
      String(actualValue).toLowerCase();

    const expected =
      String(expectedValue ?? '').toLowerCase();

    switch (condition.operator) {

      case 'equals':

        return actual === expected;


      case 'notEquals':

        return actual !== expected;


      case 'contains':

        return actual.includes(expected);


      case 'startsWith':

        return actual.startsWith(expected);


      case 'endsWith':

        return actual.endsWith(expected);


      case 'greaterThan':

        return Number(actualValue) >
          Number(expectedValue);


      case 'greaterThanOrEqual':

        return Number(actualValue) >=
          Number(expectedValue);


      case 'lessThan':

        return Number(actualValue) <
          Number(expectedValue);


      case 'lessThanOrEqual':

        return Number(actualValue) <=
          Number(expectedValue);


      default:

        return false;

    }

  }

}