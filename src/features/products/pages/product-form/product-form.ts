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

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Product
} from '../../../../core/models/product';

import {
  Category
} from '../../../../core/models/category';

import {
  debounceTime,
  distinctUntilChanged,
  startWith
} from 'rxjs';

import {
  CanComponentDeactivate
} from '../../../../core/models/can-component-deactivate';

import {
  ConfirmDialogService
} from '../../../../core/services/confirm-dialog.service';

import {
  FileUpload
} from '../../../../shared/components/file-upload/file-upload/file-upload';

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
export class ProductForm
  implements OnInit, OnChanges, CanComponentDeactivate {

  private readonly fb = inject(FormBuilder);

  private readonly draftKey =
    'product-form-draft';

  private readonly confirmDialog =
    inject(ConfirmDialogService);

  readonly showInactiveReason =
    signal(false);

    readonly showDraftPrompt = signal(false);

readonly pendingDraft =
  signal<Partial<Product> | null>(null);

  @Input()
  product: Product | null = null;

  @Output()
  save =
    new EventEmitter<Partial<Product>>();

  @Output()
  cancel =
    new EventEmitter<void>();

  @Input({ required: true })
  categories: Category[] = [];

  readonly form =
    this.fb.nonNullable.group({

      name: [
        '',
        Validators.required
      ],

      categoryId: [
        1,
        Validators.required
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      stock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      status: [
        'Active',
        Validators.required
      ],

      image: [
        null as string | null
      ],

      inactiveReason: [
        ''
      ]

    });

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (!changes['product']) {
      return;
    }

    // --------------------------------------------------
    // EDIT EXISTING PRODUCT
    // --------------------------------------------------

    if (this.product) {

      this.form.patchValue({

        name:
          this.product.name,

        categoryId:
          this.product.categoryId,

        price:
          this.product.price,

        stock:
          this.product.stock,

        status:
          this.product.status,

        image:
          this.product.image ?? null,

        inactiveReason:
          (this.product as any)
            .inactiveReason ?? ''

      });

      // Existing product should never
      // restore an Add Product draft.
      localStorage.removeItem(
        this.draftKey
      );

      this.form.markAsPristine();

      return;
    }

    // --------------------------------------------------
    // NEW PRODUCT
    // --------------------------------------------------

    this.restoreDraftIfAvailable();

  }

  ngOnInit(): void {

    // --------------------------------------------------
    // AUTO SAVE DRAFT
    // --------------------------------------------------

    this.form.valueChanges
      .pipe(

        debounceTime(500),

        distinctUntilChanged()

      )
      .subscribe(value => {

        // Only save drafts for
        // new products.
        if (!this.product) {

          localStorage.setItem(

            this.draftKey,

            JSON.stringify(value)

          );

        }

      });


    // --------------------------------------------------
    // INACTIVE REASON
    // --------------------------------------------------

    this.form.controls.status.valueChanges
      .pipe(

        startWith(
          this.form.controls.status.value
        )

      )
      .subscribe(status => {

        const reason =
          this.form.controls.inactiveReason;

        if (status === 'Inactive') {

          this.showInactiveReason.set(
            true
          );

          reason.setValidators([

            Validators.required,

            Validators.minLength(5)

          ]);

        } else {

          this.showInactiveReason.set(
            false
          );

          reason.clearValidators();

          reason.setValue('');

        }

        reason.updateValueAndValidity();

      });

  }

  // --------------------------------------------------
  // RESTORE / DISCARD DRAFT
  // --------------------------------------------------

  private restoreDraftIfAvailable(): void {

  const draft = localStorage.getItem(this.draftKey);

  if (!draft) {
    return;
  }

  try {

    const draftData = JSON.parse(draft);

    this.pendingDraft.set(draftData);

    this.showDraftPrompt.set(true);

  } catch {

    localStorage.removeItem(this.draftKey);

  }

}

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    // Draft is no longer needed
    // after successful submission.
    localStorage.removeItem(
      this.draftKey
    );

    const product =
      this.form.getRawValue();

    if (
      product.status !== 'Inactive'
    ) {

      product.inactiveReason = '';

    }

    this.save.emit(
      product
    );

    this.form.markAsPristine();

  }

  // --------------------------------------------------
  // CANCEL
  // --------------------------------------------------

  cancelForm(): void {

    // Remove saved draft
    localStorage.removeItem(this.draftKey);

    // Reset draft state
    this.pendingDraft.set(null);
    this.showDraftPrompt.set(false);

    // Notify parent
    this.cancel.emit();

  }

  // --------------------------------------------------
  // UNSAVED CHANGES
  // --------------------------------------------------

  async canDeactivate(): Promise<boolean> {

    if (!this.form.dirty) {

      return true;

    }

    return this.confirmDialog.confirm({

      title:
        'Unsaved Changes',

      message:
        'You have unsaved changes. Do you really want to leave this page?',

      confirmText:
        'Leave',

      cancelText:
        'Stay'

    });

  }

  restoreDraft(): void {

  const draft = this.pendingDraft();

  if (!draft) {
    return;
  }

  this.form.patchValue(draft);

  this.form.markAsDirty();

  this.pendingDraft.set(null);

  this.showDraftPrompt.set(false);

}

discardDraft(): void {

  localStorage.removeItem(this.draftKey);

  this.pendingDraft.set(null);

  this.showDraftPrompt.set(false);

}

}