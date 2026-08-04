import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';

import {
    catchError,
    throwError
} from 'rxjs';

import {
    inject
} from '@angular/core';

import {
    ToastService
} from '../services/toast.service';

export function errorInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) {

    const toast = inject(ToastService);

    return next(req).pipe(

        catchError((error: HttpErrorResponse) => {

            let message = 'Something went wrong.';

            switch (error.status) {

                case 400:
                    message = 'Bad Request.';
                    break;

                case 401:
                    message = 'Unauthorized.';
                    break;

                case 403:
                    message = 'Access Denied.';
                    break;

                case 404:
                    message = 'Resource Not Found.';
                    break;

                case 500:
                    message = 'Internal Server Error.';
                    break;

            }

            toast.error(message);

            return throwError(() => error);

        })

    );

}