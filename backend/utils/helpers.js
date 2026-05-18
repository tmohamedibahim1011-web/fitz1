// Generate order ID: FZ1-001-YYYYMMDD format with global auto-increment
const generateOrderId = async (Order) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Get total order count for global increment
  const totalOrders = await Order.countDocuments();
  const orderNum = String(totalOrders + 1).padStart(3, '0');
  
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