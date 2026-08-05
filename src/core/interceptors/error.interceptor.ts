import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
    catchError,
    retry,
    throwError
} from 'rxjs';

import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (

    req: HttpRequest<unknown>,

    next: HttpHandlerFn

) => {

    const toast = inject(ToastService);

    return next(req).pipe(

        retry(2),

        catchError((error: HttpErrorResponse) => {

            let message = 'Something went wrong.';

            switch (error.status) {

                case 0:

                    message = 'Unable to connect to server.';

                    break;

                case 400:

                    message = 'Bad Request.';

                    break;

                case 401:

                    message = 'Unauthorized.';

                    break;

                case 403:

                    message = 'Access denied.';

                    break;

                case 404:

                    message = 'Resource not found.';

                    break;

                case 500:

                    message = 'Internal Server Error.';

                    break;

            }

            toast.error(message);

            return throwError(() => error);

        })

    );

};