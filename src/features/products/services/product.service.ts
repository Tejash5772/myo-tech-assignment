import { Injectable } from '@angular/core';

import {
  HttpResponse
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { BaseApiService } from '../../../core/api/base-api.service';
import { Product } from '../../../core/models/product';

export interface ProductSearchResult {

  items: Product[];

  total: number;

}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService<Product> {

  protected override endpoint = 'products';

  search(params?: Record<string, any>): Observable<ProductSearchResult> {

    return this.http.get<Product[]>(this.url, {

      params: this.buildParams(params),

      observe: 'response'

    }).pipe(

      map((response: HttpResponse<Product[]>) => ({

        items: response.body ?? [],

        total: Number(
          response.headers.get('X-Total-Count') ?? response.body?.length ?? 0
        )

      }))

    );

  }
  

}