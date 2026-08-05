import { Injectable } from '@angular/core';

import { BaseApiService } from '../../../core/api/base-api.service';
import { Order } from '../../../core/models/order';

@Injectable({
    providedIn: 'root'
})
export class OrderService extends BaseApiService<Order> {

    protected override endpoint = 'orders';

}