import { inject } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseApiService<T> {

  protected readonly http = inject(HttpClient);

  protected abstract endpoint: string;

  protected get url(): string {
    return `${environment.apiUrl}/${this.endpoint}`;
  }

  getAll(params?: Record<string, any>): Observable<T[]> {

    let httpParams = new HttpParams();

    if (params) {

      Object.entries(params).forEach(([key, value]) => {

        if (value !== null && value !== undefined) {

          httpParams = httpParams.set(key, value);

        }

      });

    }

    return this.http.get<T[]>(this.url, {

      params: httpParams

    });

  }

  getById(id: number): Observable<T> {

    return this.http.get<T>(`${this.url}/${id}`);

  }

  create(payload: Partial<T>): Observable<T> {

    return this.http.post<T>(this.url, payload);

  }

  update(id: number, payload: Partial<T>): Observable<T> {

    return this.http.put<T>(`${this.url}/${id}`, payload);

  }

  delete(id: number): Observable<void> {

    return this.http.delete<void>(`${this.url}/${id}`);

  }

}