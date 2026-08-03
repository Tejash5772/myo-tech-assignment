import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment.prod';


export abstract class BaseApiService<T> {

    protected http = inject(HttpClient);

    protected abstract endpoint: string;

    getAll(params = {}) {
        return this.http.get<T[]>(`${environment.apiUrl}/${this.endpoint}`, { params });
    }

    get(id: number) {
        return this.http.get<T>(`${environment.apiUrl}/${this.endpoint}/${id}`);
    }

    create(data: T) {
        return this.http.post<T>(`${environment.apiUrl}/${this.endpoint}`,data);
    }

    update(id: number, data: T) {
        return this.http.put<T>(`${environment.apiUrl}/${this.endpoint}/${id}`,data);
    }

    delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/${this.endpoint}/${id}`);
    }

}