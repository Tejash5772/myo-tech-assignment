import {
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
    response: HttpResponse<unknown>;
    expiry: number;
}

const cache = new Map<string, CacheEntry>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    if (req.method !== 'GET') {
        return next(req);
    }

    const key = req.urlWithParams;
    const cached = cache.get(key);

    if (cached && cached.expiry > Date.now()) {
        return of(cached.response.clone());
    }

    if (cached && cached.expiry <= Date.now()) {
        cache.delete(key);
    }

    return next(req).pipe(

        tap(event => {

            if (event instanceof HttpResponse) {

                cache.set(key, {

                    response: event.clone(),

                    expiry: Date.now() + CACHE_TTL

                });

            }

        })

    );

};