import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap
} from 'rxjs';

import { Product } from '../../../../core/models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductList implements OnInit {

  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);

  readonly loading = signal(false);

  readonly search = signal('');

  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {

    this.loadProducts();

    this.searchSubject.pipe(

      debounceTime(300),

      distinctUntilChanged(),

      switchMap(search => {

        this.loading.set(true);

        return this.productService.search({

          q: search

        });

      })

    ).subscribe({

      next: products => {

        this.products.set(products);

        this.loading.set(false);

      },

      error: () => {

        this.loading.set(false);

      }

    });

  }

  loadProducts(): void {

    this.loading.set(true);

    this.productService.getAll()

      .subscribe({

        next: products => {

          this.products.set(products);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        }

      });

  }

  onSearch(value: string): void {

    this.search.set(value);

    this.searchSubject.next(value);

  }

}