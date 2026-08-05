import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../shared/components/toast/toast';
import { LoadingSpinner } from '../shared/components/loading-spinner/loading-spinner';
import { ConfirmDialog } from '../shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
import { ThemeToggle } from '../shared/components/theme-toggle/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, LoadingSpinner, ConfirmDialog, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-assignment');
}
