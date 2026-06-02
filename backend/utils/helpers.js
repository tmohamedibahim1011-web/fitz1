// Generate order ID: FZ1-001-YYYYMMDD format with global auto-increment
const generateOrderId = async (Order) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Find the most recently created order to get the highest sequence number
  const lastOrder = await Order.findOne({ orderId: /^FZ1-/ }).sort({ createdAt: -1 });
  
  let nextNum = 1;
  if (lastOrder && lastOrder.orderId) {
    const match = lastOrder.orderId.match(/^FZ1-(\d+)-/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  
  const orderNum = String(nextNum).padStart(3, '0');
  
  return `FZ1-${orderNum}-${dateStr}`;
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

module.exports = {
  generateOrderId,
  formatDate
};