import {
    HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';

import {
    finalize
} from 'rxjs';

import {
    inject
} from '@angular/core';

import {
    LoadingService
} from '../services/loading.service';

export function loadingInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) {

    const loadingService = inject(LoadingService);

    loadingService.show();

    return next(req).pipe(

        finalize(() => {

            loadingService.hide();

        })

    );

}