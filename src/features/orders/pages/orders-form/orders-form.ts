import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from '../../../products/services/product.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-form.html',
  styleUrl: './orders-form.scss'
})
export class OrdersForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  products: any[] = [];

  saving = false;
  submitted = false;

  orderForm = this.fb.group({
    customer: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    }),

    items: this.fb.array([]),

    taxes: this.fb.array([]),

    discounts: this.fb.array([]),

    shipping: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadProducts();

    this.addItem();
    this.addTax();
    this.addDiscount();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get taxes(): FormArray {
    return this.orderForm.get('taxes') as FormArray;
  }

  get discounts(): FormArray {
    return this.orderForm.get('discounts') as FormArray;
  }

  private loadProducts(): void {
    this.productService.getAll().subscribe({
      next: products => {
        this.products = products;
      },
      error: error => {
        console.error('Failed to load products', error);
      }
    });
  }

  addItem(): void {

    const item = this.fb.group({
      productId: new FormControl<number | null>(
        null,
        Validators.required
      ),

      quantity: new FormControl<number | null>(
        1,
        {
          validators: [
            Validators.required,
            Validators.min(1)
          ],
          asyncValidators: [
            this.stockValidator()
          ],
          updateOn: 'blur'
        }
      ),

      price: new FormControl<number | null>(
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      )
    });

    item.get('productId')!.valueChanges.subscribe(productId => {

      const product = this.products.find(
        p => Number(p.id) === Number(productId)
      );

      if (product) {
        item.get('price')!.setValue(
          Number(product.price ?? 0)
        );
      }

    });

    this.items.push(item);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  addTax(): void {
    this.taxes.push(
      this.fb.group({
        name: [''],
        rate: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      })
    );
  }

  removeTax(index: number): void {
    this.taxes.removeAt(index);
  }

  addDiscount(): void {
    this.discounts.push(
      this.fb.group({
        name: [''],
        amount: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      })
    );
  }

  removeDiscount(index: number): void {
    this.discounts.removeAt(index);
  }

  getItemSubtotal(item: AbstractControl): number {

    const quantity =
      Number(item.get('quantity')?.value ?? 0);

    const price =
      Number(item.get('price')?.value ?? 0);

    return quantity * price;
  }

  get subtotal(): number {

    return this.items.controls.reduce(
      (total, item) =>
        total + this.getItemSubtotal(item),
      0
    );
  }

  get taxTotal(): number {

    return this.taxes.controls.reduce(
      (total, tax) => {

        const rate =
          Number(tax.get('rate')?.value ?? 0);

        return total +
          (this.subtotal * rate / 100);

      },
      0
    );
  }

  get discountTotal(): number {

    return this.discounts.controls.reduce(
      (total, discount) => {

        return total +
          Number(
            discount.get('amount')?.value ?? 0
          );

      },
      0
    );
  }

  get shipping(): number {

    return Number(
      this.orderForm.get('shipping')?.value ?? 0
    );
  }

  get grandTotal(): number {

    return Math.max(
      0,
      this.subtotal +
      this.taxTotal +
      this.shipping -
      this.discountTotal
    );
  }

  private stockValidator(): AsyncValidatorFn {

    return (
      control: AbstractControl
    ): Observable<ValidationErrors | null> => {

      const quantity =
        Number(control.value);

      if (!quantity || quantity < 1) {
        return of(null);
      }

      const item = control.parent;

      if (!item) {
        return of(null);
      }

      const productId =
        item.get('productId')?.value;

      if (!productId) {
        return of(null);
      }

      return timer(300).pipe(

        map(() => {

          const product =
            this.products.find(
              p =>
                Number(p.id) === Number(productId)
            );

          if (!product) {
            return null;
          }

          const stock =
            Number(product.stock ?? 0);

          if (quantity > stock) {

            return {
              stockUnavailable: {
                available: stock,
                requested: quantity
              }
            };

          }

          return null;

        }),

        catchError(() => of(null))
      );
    };
  }

  save(): void {
    this.submitted = true;

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const formValue = this.orderForm.getRawValue();

    const items = formValue.items as Array<{
      productId: number | null;
      quantity: number | null;
      price: number | null;
    }>;

    const payload = {
      customerName: formValue.customer?.name ?? '',

      orderDate: new Date().toISOString(),

      status: 'Pending' as const,

      totalAmount: this.grandTotal,

      items: items.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    };

    this.orderService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.submitted = false;

        this.orderForm.markAsPristine();

        this.router.navigate(['/orders']);
      },

      error: error => {
        this.saving = false;
        console.error('Failed to save order', error);
      }
    });
  }
}