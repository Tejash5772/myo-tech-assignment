import {
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';

import {
    Observable,
    of,
    tap
} from 'rxjs';

const cache = new Map<string, HttpResponse<unknown>>();

export function cacheInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {

    if (req.method !== 'GET') {

        return next(req);

    }

    const cachedResponse = cache.get(req.urlWithParams);

    if (cachedResponse) {

        return of(cachedResponse.clone());

    }

    return next(req).pipe(

        tap(event => {

            if (event instanceof HttpResponse) {

                cache.set(req.urlWithParams, event.clone());

            }

        })

    );

}