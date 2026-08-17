import type { BusinessDocument, ClientTaxType, DocumentCalculations, Milestone } from '../../types';

export function calculateDocument(
  doc: Partial<BusinessDocument>,
  clientTaxType: ClientTaxType = 'GST_INTRA'
): DocumentCalculations {
  const items = doc.items || [];
  const taxBehavior = doc.taxBehavior || 'exclusive';

  let subtotal = 0;
  let itemDiscountTotal = 0;
  let totalTax = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const base = qty * rate;
    subtotal += base;

    // Item discount
    let disc = 0;
    if (item.discountType === 'percentage') {
      disc = base * ((Number(item.discountValue) || 0) / 100);
    } else {
      disc = Number(item.discountValue) || 0;
    }
    disc = Math.min(base, disc);
    itemDiscountTotal += disc;

    const itemTaxable = base - disc;
    const taxRate = Number(item.taxRate) || 0;

    if (item.taxType !== 'none' && taxRate > 0) {
      if (taxBehavior === 'inclusive') {
        const itemTax = itemTaxable - (itemTaxable / (1 + taxRate / 100));
        totalTax += itemTax;
      } else {
        const itemTax = itemTaxable * (taxRate / 100);
        totalTax += itemTax;
      }
    }
  });

  // Document-level discount
  const taxableBeforeDocDisc = Math.max(0, subtotal - itemDiscountTotal);
  let documentDiscountTotal = 0;
  if (doc.documentDiscountType === 'percentage') {
    documentDiscountTotal = taxableBeforeDocDisc * ((Number(doc.documentDiscountValue) || 0) / 100);
  } else {
    documentDiscountTotal = Number(doc.documentDiscountValue) || 0;
  }
  documentDiscountTotal = Math.min(taxableBeforeDocDisc, documentDiscountTotal);

  const taxableAmount = Math.max(0, taxableBeforeDocDisc - documentDiscountTotal);

  // Recalculate tax proportion if document discount exists
  if (taxableBeforeDocDisc > 0 && documentDiscountTotal > 0) {
    const ratio = taxableAmount / taxableBeforeDocDisc;
    totalTax = totalTax * ratio;
  }

  // Tax Breakdown based on Client Tax Type
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let customTax = 0;

  if (clientTaxType === 'EXEMPT') {
    totalTax = 0;
  } else if (clientTaxType === 'GST_INTER') {
    igst = totalTax;
  } else if (clientTaxType === 'GST_INTRA') {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  } else {
    customTax = totalTax;
  }

  // Grand Total calculation
  const rawGrandTotal = taxBehavior === 'exclusive' ? taxableAmount + totalTax : taxableAmount;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

  const amountPaid = Number(doc.amountPaid) || 0;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    itemDiscountTotal: Number(itemDiscountTotal.toFixed(2)),
    documentDiscountTotal: Number(documentDiscountTotal.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    customTax: Number(customTax.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue
  };
}

export function updateMilestoneAmounts(milestones: Milestone[], grandTotal: number): Milestone[] {
  return milestones.map(m => {
    const percentage = Number(m.percentage) || 0;
    const amount = Math.round((grandTotal * percentage) / 100);
    return {
      ...m,
      amount
    };
  });
}
