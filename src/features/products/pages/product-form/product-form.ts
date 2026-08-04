import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Product } from '../../../../core/models/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnChanges {

  private readonly fb = inject(FormBuilder);

  @Input()
  product: Product | null = null;

  @Output()
  save = new EventEmitter<Partial<Product>>();

  @Output()
  cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({

    name: ['', Validators.required],

    categoryId: [1, Validators.required],

    price: [0, [Validators.required, Validators.min(1)]],

    stock: [0, [Validators.required, Validators.min(0)]],

    status: ['Active', Validators.required]

  });

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['product'] && this.product) {

      this.form.patchValue({

        name: this.product.name,
        categoryId: this.product.categoryId,
        price: this.product.price,
        stock: this.product.stock,
        status: this.product.status

      });

    }

  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.save.emit(this.form.getRawValue());

  }

}