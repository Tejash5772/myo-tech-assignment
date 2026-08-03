import { ApplicationConfig } from '@angular/core';
import {
  provideRouter
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { routes } from './app.routes';
import { cacheInterceptor } from '../core/interceptors/cache.interceptor';
import { errorInterceptor } from '../core/interceptors/error.interceptor';
import { loadingInterceptor } from '../core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loadingInterceptor,cacheInterceptor,errorInterceptor])
    )
  ]
};