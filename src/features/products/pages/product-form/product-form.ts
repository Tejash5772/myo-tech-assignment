import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Product } from '../../../../core/models/product';
import { Category } from '../../../../core/models/category';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
export class ProductForm implements OnInit, OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly draftKey = 'product-form-draft';

  @Input()
  product: Product | null = null;

  @Output()
  save = new EventEmitter<Partial<Product>>();

  @Output()
  cancel = new EventEmitter<void>();

  @Input({ required: true })
  categories: Category[] = [];

  readonly form = this.fb.nonNullable.group({

    name: ['', Validators.required],

    categoryId: [1, Validators.required],

    price: [0, [Validators.required, Validators.min(1)]],

    stock: [0, [Validators.required, Validators.min(0)]],

    status: ['Active', Validators.required]

  });

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['product']) {

      if (this.product) {

        this.form.patchValue({

          name: this.product.name,
          categoryId: this.product.categoryId,
          price: this.product.price,
          stock: this.product.stock,
          status: this.product.status

        });

        localStorage.removeItem(this.draftKey);

      } else {

        const draft = localStorage.getItem(this.draftKey);

        if (draft) {

          this.form.patchValue(

            JSON.parse(draft)

          );

        }

      }

    }

  }

  ngOnInit(): void {

    this.form.valueChanges
      .pipe(

        debounceTime(500),

        distinctUntilChanged()

      )
      .subscribe(value => {

        if (!this.product) {

          localStorage.setItem(

            this.draftKey,

            JSON.stringify(value)

          );

        }

      });

  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    localStorage.removeItem(

      this.draftKey

    );

    this.save.emit(

      this.form.getRawValue()

    );

  }

  cancelForm(): void {

    localStorage.removeItem(this.draftKey);

    this.cancel.emit();

  }

}