const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

/**
 * Converts a number to Indian Rupees in words
 */
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  
  return convert(Math.floor(num)) + ' Rupees only';
};

/**
 * Generates a clean PDF invoice using jsPDF
 * @param {object} order - The MongoDB order document
 * @returns {Buffer} - PDF as a Buffer
 */
const generateInvoicePdf = (order) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  // 1. Draw Page Outer Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // 2. Company Info (Left)
  doc.setTextColor(0, 0, 0);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Fitz1', 15, 20);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('5/1293 THAI NAGAR Thoothukudi', 15, 26);
  doc.text('Phone no.: 8072210156', 15, 31);
  doc.text('Email: fitz1business@gmail.com', 15, 36);
  doc.text('GSTIN: 33AAKFF3665N1Z0', 15, 41);
  doc.text('State: 33-Tamil Nadu', 15, 46);

  // 3. Logo (Right)
  const logoPath = path.join(__dirname, '../assets/fitz1.png');
  if (fs.existsSync(logoPath)) {
    try {
      const imgData = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
      doc.addImage(imgData, 'PNG', 160, 20, 25, 15);
    } catch (err) {
      console.error('PDF Logo render failed:', err.message);
    }
  }

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(10, 50, 200, 50);

  // 4. Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(160, 160, 160); // light grey
  doc.text('Tax Invoice', 105, 57, { align: 'center' });

  // 5. Bill To (Left) & Invoice Details (Right)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text('Bill To', 15, 70);
  doc.text('Invoice Details', 195, 70, { align: 'right' });

  doc.setFontSize(10);
  const name = `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim();
  doc.text(name, 15, 76);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Invoice No.: ${order.orderId || 'N/A'}`, 195, 76, { align: 'right' });

  doc.text(`Contact No.: ${order.customerInfo?.phone || ''}`, 15, 82);
  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '';
  doc.text(`Date: ${invoiceDate}`, 195, 82, { align: 'right' });

  // 6. Table Headers & Items
  let currentY = 95;
  
  // Grey Bar for Total (Right side)
  doc.setFillColor(169, 169, 169); // Dark grey
  doc.rect(105, currentY, 95, 7, 'F');
  
  // Header text
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Description', 15, currentY + 5);
  
  doc.setTextColor(255, 255, 255); // White text inside grey bar
  doc.text('Total', 107, currentY + 5);
  
  // Format total as 1,599.00
  const formattedTotal = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.totalAmount || 0);
  doc.text(`Rs. ${formattedTotal}`, 195, currentY + 5, { align: 'right' });

  currentY += 12;
  
  doc.setTextColor(0, 0, 0); // Back to black
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  
  // Items (Left side)
  let itemsEndY = currentY;
  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      const descText = `${item.name} ${item.color || 'Standard'} Finish`;
      doc.text(descText, 15, itemsEndY);
      itemsEndY += 6;
    });
  } else {
    itemsEndY += 6;
  }
  
  // Right side below grey bar
  doc.text('Received', 107, currentY);
  doc.text(`Rs. ${formattedTotal}`, 195, currentY, { align: 'right' });
  
  currentY += 6;
  doc.text('Balance', 107, currentY);
  doc.text(`Rs. 0.00`, 195, currentY, { align: 'right' });
  
  currentY += 3;
  // Line under balance (only on right side)
  doc.setDrawColor(150, 150, 150);
  doc.line(105, currentY, 200, currentY);
  
  // Move currentY down past the items
  currentY = Math.max(currentY + 10, itemsEndY + 5);

  // 7. Invoice amount in words
  doc.setFont('Helvetica', 'bold');
  doc.text('Invoice Amount In Words', 15, currentY);
  currentY += 6;
  doc.setFont('Helvetica', 'normal');
  const words = numberToWords(order.totalAmount || 0);
  doc.text(words, 15, currentY);

  // 8. Signature section (Right)
  currentY += 10;
  doc.text('For: Fitz1', 150, currentY, { align: 'center' });
  
  currentY += 2;
  const signPath = path.join(__dirname, '../assets/sign.png');
  if (fs.existsSync(signPath)) {
    try {
      const signData = 'data:image/png;base64,' + fs.readFileSync(signPath).toString('base64');
      doc.addImage(signData, 'PNG', 135, currentY, 30, 15);
    } catch (err) {
      console.error('PDF Signature render failed:', err.message);
    }
  }
  
  currentY += 20;
  doc.setFont('Helvetica', 'bold');
  doc.text('Authorized Signatory', 150, currentY, { align: 'center' });

  // Convert arraybuffer to Node Buffer
  return Buffer.from(doc.output('arraybuffer'));
};

module.exports = { generateInvoicePdf };

