import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BusinessDocument, Client } from '../../types';

export async function generateDocumentPDF(
  elementId: string, 
  documentData: BusinessDocument, 
  client?: Client
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found for PDF generation.`);
  }

  // Hide action buttons or interactive canvas controls temporarily if any
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution crisp rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    windowWidth: 794 // A4 width in pixels at 96 DPI (210mm * 3.78 = 794px)
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  // Clean filename: ClientName_DocType_DocNumber.pdf
  const clientName = client ? client.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Client';
  const docTypeLabel = documentData.type.toUpperCase();
  const filename = `${clientName}_${docTypeLabel}_${documentData.number}.pdf`;

  pdf.save(filename);
}

export function printDocumentElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        ${styles}
        <style>
          body { background: white; margin: 0; padding: 0; }
          #document-a4-preview { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          @page { size: A4 portrait; margin: 15mm; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
