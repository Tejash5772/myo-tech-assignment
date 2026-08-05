import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss'
})
export class SkeletonLoader {

  @Input()
  rows = 5;

  @Input()
  columns = 5;

  readonly rowIndexes = Array.from({ length: 10 }, (_, i) => i);

  readonly columnIndexes = Array.from({ length: 10 }, (_, i) => i);

}