import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },

  {
    path: 'products',
    loadComponent: () =>
      import('../features/products/pages/product-list/product-list')
        .then(m => m.ProductList)
  },

  {
    path: '**',
    redirectTo: 'products'
  }

];