import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    exportToCsv<T extends Record<string, unknown>>(
        fileName: string,
        data: T[]
    ): void {

        if (!data.length) {

            return;

        }

        const headers = Object.keys(data[0]);

        const csv = [

            headers.join(','),

            ...data.map(item =>

                headers
                    .map(header => {

                        const value = item[header];

                        return `"${String(value ?? '').replace(/"/g, '""')}"`;

                    })
                    .join(',')

            )

        ].join('\n');

        const blob = new Blob(

            [csv],

            {

                type: 'text/csv;charset=utf-8'

            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = `${fileName}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }

}