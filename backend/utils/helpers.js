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

const calculateOrderDates = (orderDate, state, items = []) => {
  const date = new Date(orderDate);
  
  // Check if any item in the order is "Coloured Parallettes" (case-insensitive check for 'coloured' or 'colored')
  const hasColouredParallettes = items.some(item => {
    const name = (item.name || '').toLowerCase();
    return name.includes('coloured') || name.includes('colored');
  });

  const dispatchDays = hasColouredParallettes ? 7 : 4;
  const dispatchDate = new Date(date.getTime() + dispatchDays * 24 * 60 * 60 * 1000);
  
  const normalizedState = state ? state.toLowerCase().trim() : '';
  const isTamilNadu = normalizedState === 'tamil nadu' || normalizedState === 'tamilnadu' || normalizedState === 'tn';
  
  // Standard expected delivery was: Tamil Nadu = 6 days, Others = 8 days
  // User wants to add 2 days to expected delivery: Tamil Nadu = 8 days, Others = 10 days
  // If dispatch is pushed by 3 extra days (for Coloured Parallettes), we shift expected delivery accordingly.
  const extraDaysForColoured = dispatchDays - 4; // 3 days for Coloured, 0 for standard
  const deliveryDays = (isTamilNadu ? 8 : 10) + extraDaysForColoured;
  const expectedDeliveryDate = new Date(date.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
  
  return { dispatchDate, expectedDeliveryDate };
};

const calculateExpectedDeliveryDate = (orderDate, state) => {
  return calculateOrderDates(orderDate, state, []).expectedDeliveryDate;
};

module.exports = {
  generateOrderId,
  formatDate,
  calculateExpectedDeliveryDate,
  calculateOrderDates
};