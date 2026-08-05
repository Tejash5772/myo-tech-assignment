import {
  Component,
  forwardRef,
  inject,
  NgZone,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUpload),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileUpload),
      multi: true
    }
  ]
})
export class FileUpload implements ControlValueAccessor, Validator {

  readonly preview = signal<string | null>(null);

  readonly dragging = signal(false);

  disabled = false;

  value: string | null = null;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  private readonly MIN_WIDTH = 300;

  private readonly MIN_HEIGHT = 300;

  private readonly ngZone = inject(NgZone);

  validationErrors: ValidationErrors | null = null;

  onChange: (value: string | null) => void = () => { };

  onTouched: () => void = () => { };

  writeValue(value: string | null): void {

    this.value = value;

    this.preview.set(value);

  }

  registerOnChange(fn: (value: string | null) => void): void {

    this.onChange = fn;

  }

  registerOnTouched(fn: () => void): void {

    this.onTouched = fn;

  }

  setDisabledState(isDisabled: boolean): void {

    this.disabled = isDisabled;

  }

  validate(_: AbstractControl): ValidationErrors | null {

    return this.validationErrors;

  }

  dragOver(event: DragEvent): void {

    event.preventDefault();

    this.dragging.set(true);

  }

  dragLeave(event: DragEvent): void {

    event.preventDefault();

    this.dragging.set(false);

  }

  drop(event: DragEvent): void {

    event.preventDefault();

    this.dragging.set(false);

    const file = event.dataTransfer?.files?.[0];

    if (file) {

      this.processFile(file);

    }

  }

  browse(event: Event): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (file) {

      this.processFile(file);

    }

  }

  private processFile(file: File): void {

    this.validationErrors = null;

    // Image type validation
    if (!file.type.startsWith('image/')) {

      this.resetControl();

      this.validationErrors = {

        invalidType: true

      };

      return;

    }

    // File size validation
    if (file.size > this.MAX_FILE_SIZE) {

      this.resetControl();

      this.validationErrors = {

        maxFileSize: true

      };

      return;

    }

    const reader = new FileReader();

    reader.onload = () => {

      const image = new Image();

      image.onload = () => {

        // Dimension validation
        if (
          image.width < this.MIN_WIDTH ||
          image.height < this.MIN_HEIGHT
        ) {

          this.resetControl();

          this.validationErrors = {

            invalidDimensions: true

          };

          return;

        }

        this.ngZone.run(() => {

          const base64 = reader.result as string;

          this.value = base64;

          this.preview.set(base64);

          this.onChange(base64);

          this.onTouched();

        });

      };

      image.src = reader.result as string;

    };

    reader.readAsDataURL(file);

  }

  private resetControl(): void {

    this.ngZone.run(() => {

      this.value = null;

      this.preview.set(null);

      this.onChange(null);

      this.onTouched();

    });

  }

}