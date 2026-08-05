import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customCurrency',
    standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {

    transform(
        value: number | null | undefined,
        currency = '₹'
    ): string {

        if (value === null || value === undefined) {
            return '-';
        }

        return `${currency}${value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    }

}