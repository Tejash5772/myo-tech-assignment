import {
    HttpInterceptorFn,
    HttpResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { of, tap } from 'rxjs';

interface CacheEntry {

    expiry: number;

    response: HttpResponse<unknown>;

}

const cache = new Map<string, CacheEntry>();

const TTL = 5 * 60 * 1000;

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {

    if (
        req.method !== 'GET' ||
        !req.url.includes('/categories')
    ) {
        return next(req);
    }

    const cached = cache.get(req.urlWithParams);

    if (
        cached &&
        cached.expiry > Date.now()
    ) {

        return of(cached.response.clone());

    }

    return next(req).pipe(

        tap(event => {

            if (event instanceof HttpResponse) {

                cache.set(req.urlWithParams, {

                    expiry: Date.now() + TTL,

                    response: event.clone()

                });

            }

        })

    );

};