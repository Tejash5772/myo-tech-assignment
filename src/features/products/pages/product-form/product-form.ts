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
import { CanComponentDeactivate } from '../../../../core/models/can-component-deactivate';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { FileUpload } from '../../../../shared/components/file-upload/file-upload/file-upload';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUpload
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit, OnChanges, CanComponentDeactivate {

  private readonly fb = inject(FormBuilder);
  private readonly draftKey = 'product-form-draft';
  private readonly confirmDialog = inject(
    ConfirmDialogService
  );

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

    status: ['Active', Validators.required],

    image: [null as string | null]

  });

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['product']) {

      if (this.product) {

        this.form.patchValue({

          name: this.product.name,
          categoryId: this.product.categoryId,
          price: this.product.price,
          stock: this.product.stock,
          status: this.product.status,
          image: this.product.image ?? null


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

    this.form.markAsPristine();

  }

  cancelForm(): void {

    localStorage.removeItem(this.draftKey);

    this.cancel.emit();

  }

  async canDeactivate(): Promise<boolean> {

    if (!this.form.dirty) {

      return true;

    }

    return this.confirmDialog.confirm({

      title: 'Unsaved Changes',

      message: 'You have unsaved changes. Do you really want to leave this page?',

      confirmText: 'Leave',

      cancelText: 'Stay'

    });

  }

}