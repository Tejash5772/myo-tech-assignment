import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastAction, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {

  readonly toastService = inject(ToastService);

  onAction(action: ToastAction, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    action.callback();

    // Close after callback completes
    setTimeout(() => {
      this.toastService.clear();
    });
  }
}