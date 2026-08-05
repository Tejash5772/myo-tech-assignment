import { ResolveFn } from '@angular/router';

import { inject } from '@angular/core';
import { CategoryService } from '../../categories/services/category';
import { Category } from '../../../core/models/category';


export const categoriesResolver: ResolveFn<Category[]> = () => {

    return inject(CategoryService).getAll();

};