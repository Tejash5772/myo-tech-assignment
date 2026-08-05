import { Routes } from '@angular/router';
import { categoriesResolver } from '../features/products/resolvers/categories.resolver';
import { ProductList } from '../features/products/pages/product-list/product-list';
import { dirtyCheckGuard } from '../core/guards/dirty-check.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    component: ProductList,
    canDeactivate: [
      dirtyCheckGuard
    ],
    resolve: {
      categories: categoriesResolver
    }
  },
  {
    path: '**',
    redirectTo: 'products'
  }

];