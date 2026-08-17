import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  ShadingType
} from 'docx';
import type { BusinessDocument, Client, BusinessProfile, PaymentSettings } from '../../types';
import { formatCurrency, formatDate, amountToWords } from '../formatting/formatters';

export async function generateDocumentDOCX(
  documentData: BusinessDocument,
  client?: Client,
  profile?: BusinessProfile,
  paymentSettings?: PaymentSettings
): Promise<void> {
  const purplePrimary = '6D28D9';
  const purpleLight = 'F3EEFF';
  const textDark = '1F2937';
  const textMuted = '6B7280';
  const borderColor = 'E5E7EB';

  const docTitle = documentData.type.replace('_', ' ').toUpperCase();

  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' }
  };

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' }
  };

  const docParagraphs: (Paragraph | Table)[] = [];

  // Header Table: Logo/Business Info (Left) | Title & Document Metadata (Right)
  const leftRuns: TextRun[] = [
    new TextRun({ text: profile?.name || 'Business Name', bold: true, size: 24, color: purplePrimary }),
    new TextRun({ text: '\n' + (profile?.tagline || ''), size: 16, color: textMuted }),
    new TextRun({ text: '\n' + (profile?.address || ''), size: 16, color: textDark }),
    new TextRun({ text: `\n${profile?.city || ''} ${profile?.state || ''} ${profile?.pin || ''}`, size: 16, color: textDark }),
    new TextRun({ text: `\nPhone: ${profile?.phone || ''} | Email: ${profile?.email || ''}`, size: 16, color: textMuted })
  ];

  if (profile?.gstin && documentData.showGstin) {
    leftRuns.push(new TextRun({ text: `\nGSTIN: ${profile.gstin}`, bold: true, size: 16, color: textDark }));
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: noBorders,
            children: [new Paragraph({ children: leftRuns })]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: noBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: docTitle, bold: true, size: 32, color: purplePrimary }),
                  new TextRun({ text: `\nDoc #: ${documentData.number}`, bold: true, size: 18, color: textDark }),
                  new TextRun({ text: `\nDate: ${formatDate(documentData.issueDate)}`, size: 16, color: textMuted }),
                  ...(documentData.dueDate ? [new TextRun({ text: `\nDue Date: ${formatDate(documentData.dueDate)}`, size: 16, color: textMuted })] : []),
                  ...(documentData.validUntil ? [new TextRun({ text: `\nValid Until: ${formatDate(documentData.validUntil)}`, size: 16, color: textMuted })] : []),
                  new TextRun({ text: `\nStatus: ${documentData.status.toUpperCase()}`, bold: true, size: 16, color: purplePrimary })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  docParagraphs.push(headerTable);
  docParagraphs.push(new Paragraph({ text: '' })); // Spacer

  // Client Metadata Table (From / To)
  if (client) {
    const clientTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: purpleLight },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'BILLED TO / CLIENT DETAILS', bold: true, size: 16, color: purplePrimary }),
                    new TextRun({ text: `\n${client.name}`, bold: true, size: 18, color: textDark }),
                    ...(client.organization ? [new TextRun({ text: ` (${client.organization})`, size: 16, color: textMuted })] : []),
                    new TextRun({ text: `\nAddress: ${client.address}, ${client.city}, ${client.state} ${client.pinCode}`, size: 16, color: textDark }),
                    new TextRun({ text: `\nContact: ${client.email} | ${client.phone}`, size: 16, color: textMuted }),
                    ...(client.gstin ? [new TextRun({ text: ` | GSTIN: ${client.gstin}`, bold: true, size: 16, color: textDark })] : [])
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    docParagraphs.push(clientTable);
    docParagraphs.push(new Paragraph({ text: '' })); // Spacer
  }

  // Items Table Header
  const tableHeaderRow = new TableRow({
    children: [
      new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ children: [new TextRun({ text: 'Item & Description', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Qty', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Rate (₹)', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tax', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: purplePrimary }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Amount (₹)', bold: true, color: 'FFFFFF', size: 16 })] })] })
    ]
  });

  const tableRows: TableRow[] = [tableHeaderRow];

  documentData.items.forEach((item, idx) => {
    const itemAmount = (item.quantity * item.rate) - (item.discountType === 'percentage' ? (item.quantity * item.rate * item.discountValue / 100) : item.discountValue);
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ borders: cellBorders, children: [new Paragraph({ text: String(idx + 1) })] }),
          new TableCell({ 
            borders: cellBorders, 
            children: [
              new Paragraph({ children: [new TextRun({ text: item.name, bold: true, size: 16 })] }),
              ...(item.description ? [new Paragraph({ children: [new TextRun({ text: item.description, size: 14, color: textMuted })] })] : [])
            ] 
          }),
          new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: `${item.quantity} ${item.unit || ''}` })] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: formatCurrency(item.rate, '') })] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: item.taxRate ? `${item.taxRate}%` : '-' })] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.RIGHT, text: formatCurrency(itemAmount, '') })] })
        ]
      })
    );
  });

  docParagraphs.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }));
  docParagraphs.push(new Paragraph({ text: '' }));

  // Totals Summary Box Table
  const totalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ text: '' })] }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            shading: { fill: purpleLight },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Subtotal: ', bold: true }), new TextRun(formatCurrency(documentData.subtotal))] }),
              ...(documentData.itemDiscountTotal > 0 ? [new Paragraph({ children: [new TextRun({ text: 'Item Discounts: ', bold: true }), new TextRun(`-${formatCurrency(documentData.itemDiscountTotal)}`)] })] : []),
              ...(documentData.documentDiscountTotal > 0 ? [new Paragraph({ children: [new TextRun({ text: 'Document Discount: ', bold: true }), new TextRun(`-${formatCurrency(documentData.documentDiscountTotal)}`)] })] : []),
              new Paragraph({ children: [new TextRun({ text: 'Taxable Amount: ', bold: true }), new TextRun(formatCurrency(documentData.taxableAmount))] }),
              ...(documentData.cgst > 0 ? [new Paragraph({ children: [new TextRun({ text: 'CGST: ', bold: true }), new TextRun(formatCurrency(documentData.cgst))] })] : []),
              ...(documentData.sgst > 0 ? [new Paragraph({ children: [new TextRun({ text: 'SGST: ', bold: true }), new TextRun(formatCurrency(documentData.sgst))] })] : []),
              ...(documentData.igst > 0 ? [new Paragraph({ children: [new TextRun({ text: 'IGST: ', bold: true }), new TextRun(formatCurrency(documentData.igst))] })] : []),
              ...(documentData.roundOff !== 0 ? [new Paragraph({ children: [new TextRun({ text: 'Round Off: ', bold: true }), new TextRun(formatCurrency(documentData.roundOff))] })] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: 'GRAND TOTAL: ', bold: true, size: 20, color: purplePrimary }),
                  new TextRun({ text: formatCurrency(documentData.grandTotal), bold: true, size: 22, color: purplePrimary })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: amountToWords(documentData.grandTotal), italics: true, size: 14, color: textMuted })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  docParagraphs.push(totalsTable);
  docParagraphs.push(new Paragraph({ text: '' }));

  // Bank & Payment Information Section
  if (paymentSettings && documentData.showBankDetails) {
    const bankSection = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'BANK & PAYMENT DETAILS', bold: true, size: 16, color: purplePrimary }),
                    new TextRun({ text: `\nBank Name: ${paymentSettings.bankName || 'N/A'} | Account Name: ${paymentSettings.accountHolder || 'N/A'}` }),
                    new TextRun({ text: `\nAccount Number: ${paymentSettings.accountNumber || 'N/A'} | IFSC: ${paymentSettings.ifsc || 'N/A'}` }),
                    ...(paymentSettings.upiId ? [new TextRun({ text: `\nUPI ID: ${paymentSettings.upiId}`, bold: true })] : [])
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    docParagraphs.push(bankSection);
    docParagraphs.push(new Paragraph({ text: '' }));
  }

  // Terms & Conditions
  if (documentData.terms && documentData.showTerms) {
    docParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Terms & Conditions', bold: true, size: 18, color: purplePrimary })] }));
    docParagraphs.push(new Paragraph({ children: [new TextRun({ text: documentData.terms, size: 14, color: textDark })] }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);

  const clientName = client ? client.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Client';
  const filename = `${clientName}_${docTitle}_${documentData.number}.docx`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
