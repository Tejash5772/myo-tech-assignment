import { Routes } from '@angular/router';
import { categoriesResolver } from '../features/products/resolvers/categories.resolver';
import { ProductList } from '../features/products/pages/product-list/product-list';
import { dirtyCheckGuard } from '../core/guards/dirty-check.guard';
import { DynamicFormDemo } from '../features/dynamic-form/pages/dynamic-form-demo/dynamic-form-demo';
import { OrdersForm } from '../features/orders/pages/orders-form/orders-form';
import { OrdersList } from '../features/orders/pages/orders-list/orders-list';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'dynamic-form',
    component: DynamicFormDemo
  },
  {
    path: 'orders',
    component: OrdersList
  },
  {
    path: 'orders/new',
    component: OrdersForm
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