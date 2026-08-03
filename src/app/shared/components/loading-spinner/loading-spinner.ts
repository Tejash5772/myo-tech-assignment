import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html'
})
export class LoadingSpinner {

  constructor(
    public loadingService: LoadingService
  ) {}

}