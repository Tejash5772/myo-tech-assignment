import { Injectable } from '@angular/core';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class PdfExportService {

    exportToPdf<T extends Record<string, unknown>>(
        fileName: string,
        title: string,
        data: T[]
    ): void {

        if (!data.length) {

            return;

        }

        const document = new jsPDF();

        document.setFontSize(18);

        document.text(title, 14, 20);

        const headers = [

            Object.keys(data[0])

        ];

        const rows = data.map(item =>

            Object.values(item).map(value =>

                String(value ?? '')

            )

        );

        autoTable(document, {

            head: headers,

            body: rows,

            startY: 30,

            theme: 'striped',

            headStyles: {

                fillColor: [13, 110, 253]

            }

        });

        document.save(`${fileName}.pdf`);

    }

}