const { generateInvoicePdf } = require('./backend/utils/pdfGenerator');
const fs = require('fs');
const mockOrder = {
  orderId: 'ORD-12345',
  createdAt: new Date(),
  totalAmount: 1599,
  customerInfo: { firstName: 'Sudharsan', lastName: 'M', phone: '9566324568' },
  shippingAddress: { address: 'Door no - 123, Main Road', city: 'Chennai', state: 'Tamil Nadu', zip: '600001' },
  items: [{ name: 'Test Product', color: 'Natural', quantity: 1, price: 1599 }]
};
const pdfBuffer = generateInvoicePdf(mockOrder);
fs.writeFileSync('test_invoice.pdf', pdfBuffer);
console.log('PDF generated successfully!');
