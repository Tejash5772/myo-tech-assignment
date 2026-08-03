import { Service } from '@angular/core';
import { BaseApiService } from '../../../core/api/base-api.service';
import { Product } from '../../../core/models/product';
import { Observable } from 'rxjs';

@Service()
export class ProductService extends BaseApiService<Product> {

  protected override endpoint = 'products';

  search(params: Record<string, any>): Observable<Product[]> {
    return this.getAll(params);
  }

}