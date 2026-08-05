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
  pageSize = 10;

  sortField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: GridColumn[] = [];

  readonly search$ = toObservable(this.search);

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

    this.updateQueryParams();

  }

  onPageSizeChange(pageSize: number): void {

    this.pageSize = pageSize;

    this.page = 1;

    this.updateQueryParams();

  }

  onSortChange(sort: GridSort): void {

    this.sortField = sort.field;

    this.sortDirection = sort.direction;

    this.page = 1;

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

        createdAt: new Date()
          .toISOString()
          .split('T')[0]

      });

    request
      .pipe(

        finalize(() => {

          this.loading.set(false);

        }),

        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe({

        next: (savedProduct: Product) => {

          if (this.selectedProduct()) {

            // Update existing product
            this.products.update(products =>
              products.map(product =>
                product.id === savedProduct.id
                  ? savedProduct
                  : product
              )
            );

          } else {

            // Add new product
            this.products.update(products => [
              savedProduct,
              ...products
            ]);

            this.totalRecords.update(total => total + 1);

          }

          const isEdit = !!this.selectedProduct();

          this.selectedProduct.set(null);

          this.showModal.set(false);

          this.toastService.success(
            isEdit
              ? 'Product updated successfully.'
              : 'Product created successfully.'
          );

        },

        error: () => {

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

  private getExportData(): Array<{
    ID: number;
    Name: string;
    Category: string;
    Price: number;
    Stock: number;
    Status: string;
    CreatedAt: string;
  }> {

    return this.products().map(product => ({

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

    this.exportService.exportToCsv(

      'products',

      this.getExportData()

    );

  }

  exportProductsPdf(): void {

    this.pdfExportService.exportToPdf(

      'products',

      'Products Report',

      this.getExportData()

    );

  }

  canDeactivate(): boolean | Promise<boolean> {

    if (!this.showModal()) {

      return true;

    }

    return this.productForm?.canDeactivate() ?? true;

  }

}