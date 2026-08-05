import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../shared/components/toast/toast';
import { LoadingSpinner } from '../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../shared/components/confirm-dialog/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, LoadingSpinner, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-assignment');
}
