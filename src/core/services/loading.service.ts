import {
    Injectable,
    computed,
    signal
} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private readonly loadingCount = signal(0);

    readonly isLoading = computed(
        () => this.loadingCount() > 0
    );

    show(): void {

        this.loadingCount.update(
            value => value + 1
        );

    }

    hide(): void {

        this.loadingCount.update(
            value => Math.max(0, value - 1)
        );

    }

    reset(): void {

        this.loadingCount.set(0);

    }

}