import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Product } from '../../../../core/models/product';
import { Category } from '../../../../core/models/category';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
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

  readonly showInactiveReason = signal(false);

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

    image: [null as string | null],

    inactiveReason: ['']

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
          image: this.product.image ?? null,
          inactiveReason: (this.product as any).inactiveReason ?? ''

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

    this.form.controls.status.valueChanges
      .pipe(
        startWith(this.form.controls.status.value)
      )
      .subscribe(status => {

        const reason = this.form.controls.inactiveReason;

        if (status === 'Inactive') {

          this.showInactiveReason.set(true);

          reason.setValidators([
            Validators.required,
            Validators.minLength(5)
          ]);

        } else {

          this.showInactiveReason.set(false);

          reason.clearValidators();

          reason.setValue('');

        }

        reason.updateValueAndValidity();

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

    const product = this.form.getRawValue();

    if (product.status !== 'Inactive') {

      product.inactiveReason = '';

    }

    this.save.emit(product);

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