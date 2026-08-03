import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { retry, catchError, throwError } from "rxjs";
import { ToastService } from "../services/toast.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

    const toast = inject(ToastService);

    return next(req).pipe(

        retry(2),

        catchError(error => {

            toast.show(
                'error',
                error.message
            );

            return throwError(() => error);

        })

    );

};