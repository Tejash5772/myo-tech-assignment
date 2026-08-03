import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../layouts/main-layout/main-layout')
                .then(m => m.MainLayout)
    },
    {
        path: 'products',
        loadComponent: () =>
            import('../features/products/pages/product-list/product-list')
                .then(m => m.ProductList)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
