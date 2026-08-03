import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import {
    catchError,
    retry,
    throwError
} from 'rxjs';

import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

    const toastService = inject(ToastService);

    return next(req).pipe(

        retry(2),

        catchError(error => {

            switch (error.status) {

                case 401:

                    toastService.show(
                        'error',
                        'Unauthorized access.'
                    );

                    break;

                case 404:

                    toastService.show(
                        'warning',
                        'Requested resource not found.'
                    );

                    break;

                case 500:

                    toastService.show(
                        'error',
                        'Internal server error.'
                    );

                    break;

                default:

                    toastService.show(
                        'error',
                        'Something went wrong.'
                    );

            }

            return throwError(() => error);

        })

    );

};