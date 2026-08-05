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
  finalize
} from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '../../services/product.service';

import { Product } from '../../../../core/models/product';
import { Category } from '../../../../core/models/category';

import { GridColumn } from '../../../../core/models/grid-column';
import { GridSort } from '../../../../core/models/grid-sort';

import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { ProductForm } from '../product-form/product-form';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataGrid,
    ProductForm
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly totalRecords = signal(0);
  readonly search = signal('');

  readonly showModal = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly categories = signal<Category[]>([]);

  @ViewChild('actionTemplate', { static: true })
  actionTemplate!: TemplateRef<Product>;

  page = 1;
  pageSize = 10;

  sortField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: GridColumn[] = [];

  private readonly searchSubject = new Subject<string>();
  private deletedProduct: Product | null = null;
  private undoTimeout?: number;

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
        field: 'price',
        header: 'Price',
        sortable: true
      },
      {
        field: 'stock',
        header: 'Stock',
        sortable: true
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true
      },
      {
        field: 'actions',
        header: 'Actions',
        template: this.actionTemplate
      }

    ];

    this.categories.set(
      this.route.snapshot.data['categories'] ?? []
    );

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

    this.searchSubject
      .pipe(

        debounceTime(400),

        distinctUntilChanged(),

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

    this.page = 1;

    this.updateQueryParams();

    this.searchSubject.next(value);

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

  closeModal(): void {

    this.selectedProduct.set(null);

    this.showModal.set(false);

  }

  saveProduct(product: Partial<Product>): void {

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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: () => {

          this.closeModal();

          this.loadProducts();

        }

      });

  }

  deleteProduct(product: Product): void {

    const confirmed = confirm(

      `Delete "${product.name}"?`

    );

    if (!confirmed) {

      return;

    }

    this.loading.set(true);

    this.productService
      .delete(product.id)
      .subscribe({

        next: () => {

          this.loading.set(false);

          this.deletedProduct = product;

          this.loadProducts();

          if (this.undoTimeout) {

            clearTimeout(this.undoTimeout);

          }

          this.toastService.success(

            'Product deleted',

            {

              label: 'Undo',

              callback: () => {

                this.restoreDeletedProduct();

              }

            }

          );

          this.undoTimeout = window.setTimeout(() => {

            this.deletedProduct = null;

          }, 5000);

        },

        error: () => {

          this.loading.set(false);

        }

      });

  }

  private restoreDeletedProduct(): void {

    if (!this.deletedProduct) {

      return;

    }

    this.loading.set(true);

    this.productService
      .create(this.deletedProduct)
      .subscribe({

        next: () => {

          this.loading.set(false);

          this.loadProducts();

          this.deletedProduct = null;

          this.toastService.success(

            'Product restored'

          );

        },

        error: () => {

          this.loading.set(false);

        }

      });

  }

}