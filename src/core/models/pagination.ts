export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface PagedResponse<T> {
    items: T[];
    pagination: Pagination;
}