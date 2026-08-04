import { ResolveFn } from '@angular/router';

import { inject } from '@angular/core';
import { CategoryService } from '../../categories/services/category';


export const categoriesResolver: ResolveFn<any> = () => {

    return inject(CategoryService).getAll();

};