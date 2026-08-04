import { Injectable } from '@angular/core';

import { BaseApiService } from '../../../core/api/base-api.service';

import { Category } from '../../../core/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseApiService<Category> {

  protected override endpoint = 'categories';

}