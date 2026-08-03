import { Service } from '@angular/core';
import { BaseApiService } from '../../../core/api/base-api.service';
import { Product } from '../models/product';

@Service()
export class ProductService extends BaseApiService<Product>{
    protected endpoint='products';
}
