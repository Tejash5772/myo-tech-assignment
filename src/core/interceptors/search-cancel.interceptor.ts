import {
    HttpContextToken,
    HttpInterceptorFn
} from '@angular/common/http';

import {
    Observable,
    Subject,
    takeUntil
} from 'rxjs';

export const CANCEL_SEARCH = new HttpContextToken<boolean>(
    () => false
);

let searchCancel$ = new Subject<void>();

export const searchCancelInterceptor: HttpInterceptorFn = (
    req,
    next
): Observable<any> => {

    if (!req.context.get(CANCEL_SEARCH)) {
        return next(req);
    }

    // Cancel the previous search request
    searchCancel$.next();

    return next(req).pipe(
        takeUntil(searchCancel$)
    );
};