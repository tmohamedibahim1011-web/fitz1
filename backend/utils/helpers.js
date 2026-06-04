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

const calculateExpectedDeliveryDate = (orderDate, state) => {
  const date = new Date(orderDate);
  const normalizedState = state ? state.toLowerCase().trim() : '';
  const isTamilNadu = normalizedState === 'tamil nadu' || normalizedState === 'tamilnadu' || normalizedState === 'tn';
  const daysToAdd = isTamilNadu ? 7 : 9;
  return new Date(date.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
};

const calculateOrderDates = (orderDate, state) => {
  const date = new Date(orderDate);
  const dispatchDate = new Date(date.getTime() + 4 * 24 * 60 * 60 * 1000);
  
  const normalizedState = state ? state.toLowerCase().trim() : '';
  const isTamilNadu = normalizedState === 'tamil nadu' || normalizedState === 'tamilnadu' || normalizedState === 'tn';
  const deliveryDays = isTamilNadu ? 6 : 8; // 6 days (7 days inclusive) for Tamil Nadu, 8 days (9 days inclusive) for others
  const expectedDeliveryDate = new Date(date.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
  
  return { dispatchDate, expectedDeliveryDate };
};

module.exports = {
  generateOrderId,
  formatDate,
  calculateExpectedDeliveryDate,
  calculateOrderDates
};