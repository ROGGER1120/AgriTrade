import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background bar (warm dark charcoal)
  doc.setFillColor(22, 21, 19);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Accent amber stripe
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 35, pageWidth, 2.5, 'F');

  // Company Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('AgriTrade', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 195, 185);
  doc.text('AGRICULTURAL E-BUSINESS & FARM ERP', 14, 25);
  doc.text('GSTIN: 33AABCA9012K1ZY | Support: +91 98401 22334', 14, 30);

  // Right Header: INVOICE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 220, 220);
  doc.text(`Invoice No: ${order.invoiceNumber || 'INV-2026-0001'}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Date: ${new Date(order.invoiceDate || order.createdAt).toLocaleDateString('en-IN')}`, pageWidth - 14, 30, { align: 'right' });

  // Bill To / Order Info section
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 85);
  doc.text('BILLED TO (FARMER / BUYER):', 14, 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(order.customerName || 'Walk-in Customer', 14, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 14, 61);
  doc.text(`Delivery Address: ${order.shippingAddress || 'Counter Pickup'}`, 14, 66);
  if (order.customerEmail) {
    doc.text(`Email: ${order.customerEmail}`, 14, 71);
  }

  // Right Side Order Details
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 85);
  doc.text('ORDER SUMMARY:', pageWidth - 80, 48);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Order Number:`, pageWidth - 80, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.orderNumber}`, pageWidth - 14, 55, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Channel:`, pageWidth - 80, 61);
  doc.text(`${order.channel === 'POS_COUNTER' ? 'POS Counter' : 'Online Store'}`, pageWidth - 14, 61, { align: 'right' });

  doc.text(`Payment Method:`, pageWidth - 80, 67);
  doc.text(`${order.paymentMethod || 'Cash on Delivery'}`, pageWidth - 14, 67, { align: 'right' });

  doc.text(`Payment Status:`, pageWidth - 80, 73);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(order.paymentStatus === 'Paid' ? 16 : 220, order.paymentStatus === 'Paid' ? 140 : 100, 16);
  doc.text(`${order.paymentStatus?.toUpperCase() || 'PENDING'}`, pageWidth - 14, 73, { align: 'right' });

  // Items Table
  const tableRows = order.items.map((item, index) => [
    index + 1,
    item.productName,
    item.sku || '-',
    `${item.quantity} ${item.unit || 'units'}`,
    `INR ${Number(item.unitPrice).toFixed(2)}`,
    `INR ${Number(item.total).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['#', 'Item Description', 'SKU', 'Quantity', 'Unit Price', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 21, 19],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [249, 248, 246],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Calculation Summary Box
  const summaryX = pageWidth - 85;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`INR ${Number(order.subtotal).toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });

  if (order.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Discount Applied:', summaryX, finalY + 6);
    doc.text(`- INR ${Number(order.discount).toFixed(2)}`, pageWidth - 14, finalY + 6, { align: 'right' });
  }

  if (order.tax > 0) {
    doc.setTextColor(80, 80, 80);
    doc.text('GST / Taxes (5%):', summaryX, finalY + 12);
    doc.text(`+ INR ${Number(order.tax).toFixed(2)}`, pageWidth - 14, finalY + 12, { align: 'right' });
  }

  // Grand Total Box
  doc.setFillColor(245, 158, 11);
  doc.rect(summaryX - 5, finalY + 18, 75, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 21, 19);
  doc.text('GRAND TOTAL:', summaryX, finalY + 26);
  doc.text(`INR ${Number(order.finalTotal).toFixed(2)}`, pageWidth - 14, finalY + 26, { align: 'right' });

  // Terms and Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  const termsY = finalY + 38;
  doc.text('Special Notes & Agricultural Warranty:', 14, termsY);
  doc.text('1. All certified seeds & bio-fertilizers must be stored in cool dry places away from direct sunlight.', 14, termsY + 5);
  doc.text('2. Stock automatically updated in warehouse management system upon generation of this receipt.', 14, termsY + 9);
  doc.text('3. For batch returns or quality claims, present this bill within 7 days of delivery.', 14, termsY + 13);

  // Authorized Signatory
  doc.text('Authorized AgriTrade Representative', pageWidth - 65, termsY + 15);
  doc.line(pageWidth - 65, termsY + 11, pageWidth - 14, termsY + 11);

  // Save the PDF
  doc.save(`${order.invoiceNumber || order.orderNumber}_AgriTrade_Invoice.pdf`);
};
