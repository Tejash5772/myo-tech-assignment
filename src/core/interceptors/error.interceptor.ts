import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';

import { catchError, throwError } from 'rxjs';

export function errorInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) {

    return next(req).pipe(

        catchError((error: HttpErrorResponse) => {

            alert(error.message);

            return throwError(() => error);

        })

    );

}