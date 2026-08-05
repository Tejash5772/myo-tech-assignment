import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusBadge',
    standalone: true
})
export class StatusBadgePipe implements PipeTransform {

    transform(status: string): string {

        switch (status?.toLowerCase()) {

            case 'active':
                return '🟢 Active';

            case 'inactive':
                return '🔴 Inactive';

            case 'pending':
                return '🟡 Pending';

            default:
                return status;

        }

    }

}