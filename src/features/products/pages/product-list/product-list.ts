import { Component, OnInit } from '@angular/core';
import { GridColumn } from '../../../../shared/models/grid-column';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { DataGrid } from '../../../../shared/components/data-grid/data-grid';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DataGrid],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {

  products: Product[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  columns: GridColumn<Product>[] = [
    {
      field: 'name',
      header: 'Product'
    },
    {
      field: 'price',
      header: 'Price',
      sortable: true
    },
    {
      field: 'stock',
      header: 'Stock',
      sortable: true
    },
    {
      field: 'status',
      header: 'Status'
    }
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.page = Number(params['page'] || 1);
      this.pageSize = Number(params['pageSize'] || 10);
      this.loadProducts();
    });

  }

  loadProducts() {
    this.productService.getAll({
      _page: this.page,
      _limit: this.pageSize
    }).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page
      },
      queryParamsHandling: 'merge'
    });
  }

  sort(event: any) {
    console.log(event);
  }
}