import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Settings, 
  LogOut, Filter, FileSpreadsheet, FileText, ArrowUpRight, CheckSquare, Package, Plus, Pencil, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterProduct, setFilterProduct] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exactDate, setExactDate] = useState('');
  
  // Bulk Selection
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    material: '',
    image: '',
    hoverImage: '',
    badge: '',
    stock: '50',
    colors: [
      { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0 },
      { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100 }
    ]
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchOrders();
    fetchProducts();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      } else {
        toast.error('Failed to fetch orders. Ensure backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  // Product CRUD
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.basePrice?.toString() || '',
        material: product.material || '',
        image: product.image || '',
        hoverImage: product.hoverImage || '',
        badge: product.badge || '',
        stock: product.stock?.toString() || '50',
        colors: product.colors || [
          { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0 },
          { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100 }
        ]
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        material: '',
        image: '',
        hoverImage: '',
        badge: '',
        stock: '50',
        colors: [
          { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0 },
          { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100 }
        ]
      });
    }
    setShowProductModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const productData = {
        ...productForm,
        basePrice: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };
      delete productData.price;
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (editingProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingProduct._id}`, productData, { headers, withCredentials: true });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, productData, { headers, withCredentials: true });
        toast.success('Product created successfully');
      }
      
      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, { headers, withCredentials: true });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${id}/status`, { status: newStatus }, { headers, withCredentials: true });
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return toast.error('No orders selected');
    if (!bulkStatus) return toast.error('Select a status for bulk update');

    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Update only selected orders that match the filter
      const ordersToUpdate = orders.filter(o => selectedOrders.includes(o._id) && filteredOrders.some(f => f._id === o._id));
      
      if (ordersToUpdate.length === 0) {
        toast.error('No filtered orders selected');
        return;
      }
      
      await Promise.all(ordersToUpdate.map(o => 
        axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${o._id}/status`, { status: bulkStatus }, { headers, withCredentials: true })
      ));
      
      setOrders(orders.map(o => selectedOrders.includes(o._id) ? { ...o, status: bulkStatus } : o));
      setSelectedOrders([]);
      setBulkStatus('');
      toast.success(`Successfully updated ${ordersToUpdate.length} orders`);
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleDownloadExcel = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    
    // Create CSV content
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Total', 'Status'];
    const rows = filteredOrders.map(order => [
      order.orderId,
      new Date(order.createdAt).toLocaleDateString(),
      `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`,
      order.customerInfo?.phone || '',
      order.items.map(i => `${i.name} (${i.color}) x${i.quantity}`).join('; '),
      order.totalAmount,
      order.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredOrders.length} orders`);
  };

  const generateInvoiceHTML = (order) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; width: 380px; margin: 0 auto; background: white; color: black; }
    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
    .company { font-size: 24px; font-weight: bold; font-family: 'Arial Black', sans-serif; text-transform: uppercase; letter-spacing: 2px; }
    .receipt-title { font-size: 14px; font-weight: bold; margin-top: 5px; }
    .row-flex { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
    .section { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
    .bold { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th { border-bottom: 1px solid #000; text-align: left; padding: 4px 0; }
    td { padding: 4px 0; border-bottom: 1px dotted #ccc; }
    .text-right { text-align: right; }
    .totals { margin-top: 10px; font-size: 12px; }
    .totals .row-flex { margin-bottom: 3px; }
    .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    .footer { text-align: center; font-size: 10px; margin-top: 20px; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">FITZONE.</div>
    <div class="receipt-title">SHIPPING SLIP / RECEIPT</div>
  </div>
  
  <div class="section">
    <div class="row-flex"><span class="bold">Order ID:</span> <span>${order.orderId}</span></div>
    <div class="row-flex"><span class="bold">Date:</span> <span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
    <div class="row-flex"><span class="bold">Payment:</span> <span>${order.paymentStatus || 'Pending'}</span></div>
  </div>
  <div class="section">
    <div class="bold" style="margin-bottom:5px;">SHIP TO:</div>
    <div style="font-size:12px;">
      <span class="bold">${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}</span><br>
      ${order.customerInfo?.phone || ''}<br>
      ${order.shippingAddress?.address || ''}<br>
      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zip || ''}
    </div>
  </div>
  
  <div class="section" style="border:none;">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
        <tr>
          <td>${item.name}<br><span style="font-size:10px;color:#555;">[${item.color}]</span></td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="row-flex"><span>Subtotal:</span><span>Rs. ${order.totalAmount.toLocaleString()}</span></div>
      <div class="row-flex"><span>Shipping:</span><span>${order.shippingAddress?.method || 'Free'}</span></div>
      <div class="row-flex grand-total"><span>Total:</span><span>Rs. ${order.totalAmount.toLocaleString()}</span></div>
    </div>
  </div>
  
  <div class="footer">
    Thank you for choosing Fitzone!<br>www.fitzone.in
  </div>
</body>
</html>
    `.trim();
  };

  const renderToCanvas = async (html) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.width = '420px';
    iframe.style.height = '800px';
    document.body.appendChild(iframe);
    
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(iframe.contentDocument.body, { scale: 1, useCORS: true });
    document.body.removeChild(iframe);
    return canvas;
  };

  const handleDownloadPDF = async (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }
    
    const html = generateInvoiceHTML(order);
    const toastId = toast.loading('Generating PDF...');
    
    try {
      const canvas = await renderToCanvas(html);
      // Use JPEG for smaller MB size
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      // a6 format is small, like a thermal/shipping label
      const pdf = new jsPDF('p', 'pt', 'a6');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.orderId}.pdf`);
      toast.success(`Downloaded invoice for ${orderId}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const handleBulkDownload = async () => {
    // Determine which orders to download: selected or filtered
    let targetOrders = [];
    if (selectedOrders.length > 0) {
      targetOrders = orders.filter(o => selectedOrders.includes(o._id));
    } else if (filteredOrders.length > 0) {
      targetOrders = filteredOrders;
    } else {
      toast.error('No orders to download');
      return;
    }
    
    const toastId = toast.loading(`Generating ${targetOrders.length} PDFs...`);
    
    try {
      const pdf = new jsPDF('p', 'pt', 'a6');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      for (let i = 0; i < targetOrders.length; i++) {
        const order = targetOrders[i];
        const html = generateInvoiceHTML(order);
        const canvas = await renderToCanvas(html);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Bulk_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Downloaded ${targetOrders.length} invoices`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate bulk PDFs', { id: toastId });
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const orderItemsString = o.items.map(i => i.name).join(' ');
    const productMatch = filterProduct === 'All' || orderItemsString.includes(filterProduct);
    
    const orderDate = new Date(o.createdAt).setHours(0,0,0,0);
    
    if (exactDate) {
      const exactD = new Date(exactDate).setHours(0,0,0,0);
      if (orderDate !== exactD) return false;
    } else {
      const fromD = fromDate ? new Date(fromDate).setHours(0,0,0,0) : null;
      const toD = toDate ? new Date(toDate).setHours(0,0,0,0) : null;
      if (fromD && orderDate < fromD) return false;
      if (toD && orderDate > toD) return false;
    }

    return productMatch;
  });

  const selectAllFiltered = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'packing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-secondary-white min-h-screen flex pt-20">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-black/5 fixed h-[calc(100vh-80px)] hidden lg:flex flex-col z-10">
        <div className="p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-text mb-8">Management</p>
          <nav className="space-y-2">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
              { name: 'Orders', icon: ShoppingCart, tab: 'orders' },
              { name: 'Products', icon: Package, tab: 'products' },
              { name: 'Settings', icon: Settings, tab: 'settings' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => item.tab !== 'settings' && setActiveTab(item.tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors rounded-sm
                  ${activeTab === item.tab ? 'bg-primary-text text-white' : 'text-secondary-text hover:bg-black/5 hover:text-primary-text'}`}
              >
                <item.icon size={18} /> {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-black/5">
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow lg:ml-64 p-8 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: 'var(--font-bebas)' }}>Dashboard</h1>
              <p className="text-secondary-text text-sm">Overview of your store performance.</p>
            </header>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Revenue</p>
                <h3 className="text-3xl font-bold text-primary-text">Rs. {totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Orders</p>
                <h3 className="text-3xl font-bold text-primary-text">{orders.length}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Products</p>
                <h3 className="text-3xl font-bold text-primary-text">{products.length}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Pending Orders</p>
                <h3 className="text-3xl font-bold text-primary-text">{orders.filter(o => o.status === 'processing' || o.status === 'packing').length}</h3>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white border border-black/5 shadow-sm">
              <div className="p-6 border-b border-black/5">
                <h2 className="text-lg font-bold uppercase tracking-widest text-primary-text">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary-white/50 text-xs font-bold uppercase tracking-widest text-secondary-text border-b border-black/5">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b border-black/5 hover:bg-secondary-white/20 transition-colors text-sm">
                        <td className="p-4 font-mono font-bold text-xs">{order.orderId}</td>
                        <td className="p-4">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</td>
                        <td className="p-4 font-bold">Rs. {order.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-secondary-text text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-secondary-text">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LOW STOCK PRODUCTS */}
            <div className="bg-white border border-black/5 shadow-sm mt-6">
              <div className="p-6 border-b border-black/5">
                <h2 className="text-lg font-bold uppercase tracking-widest text-primary-text">Low Stock Products</h2>
              </div>
              <div className="p-6">
                {products.filter(p => p.stock < 10).length > 0 ? (
                  <div className="space-y-3">
                    {products.filter(p => p.stock < 10).map(p => (
                      <div key={p._id} className="flex justify-between items-center py-2 border-b border-black/5">
                        <span className="font-bold text-primary-text">{p.name}</span>
                        <span className="text-red-500 font-bold">{p.stock} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-text">All products are well stocked.</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: 'var(--font-bebas)' }}>Orders</h1>
                <p className="text-secondary-text text-sm">Manage and track customer orders.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-colors shadow-sm">
                  <FileSpreadsheet size={16} /> Export Excel
                </button>
                <button 
                  onClick={handleBulkDownload} 
                  disabled={filteredOrders.length === 0}
                  className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-colors shadow-sm disabled:opacity-50"
                >
                  <FileText size={16} /> Download Filtered Invoices ({filteredOrders.length})
                </button>
              </div>
            </header>

            {/* ANALYTICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ArrowUpRight size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Revenue</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">${totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShoppingCart size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Orders</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">{orders.length}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><LayoutDashboard size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Pending Fulfillment</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">{orders.filter(o => o.status === 'processing' || o.status === 'packing').length}</h3>
              </div>
            </div>

            {/* FILTERS & BULK ACTIONS */}
            <div className="bg-white border border-black/5 shadow-sm mb-6 p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => {setFromDate(e.target.value); setExactDate('');}} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">To Date</label>
                    <input type="date" value={toDate} onChange={(e) => {setToDate(e.target.value); setExactDate('');}} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div className="mx-2 flex items-center h-10 text-xs font-bold text-secondary-text uppercase">OR</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Specific Date</label>
                    <input type="date" value={exactDate} onChange={(e) => {setExactDate(e.target.value); setFromDate(''); setToDate('');}} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Product Filter</label>
                    <div className="flex items-center gap-2 border border-black/10 px-3 py-2">
                      <Filter size={16} className="text-secondary-text" />
                      <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="bg-transparent text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer">
                        <option value="All">All Products</option>
                        <option value="Regular">Regular Series</option>
                        <option value="Mini">Mini Series</option>
                      </select>
                    </div>
                  </div>
                </div>

                {selectedOrders.length > 0 && (
                  <div className="flex items-end gap-3 p-4 bg-secondary-white border border-black/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block mb-1">Bulk Action ({selectedOrders.length} selected)</span>
                      <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer bg-white">
                        <option value="">Select Status...</option>
                        <option value="processing">Processing</option>
                        <option value="packing">Packing</option>
                        <option value="shipping">Shipping</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <button onClick={handleBulkUpdate} className="bg-primary-text text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors">
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white border border-black/5 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary-white/50 text-xs font-bold uppercase tracking-widest text-secondary-text border-b border-black/5">
                      <th className="p-4 pl-6 w-10">
                        <input type="checkbox" className="accent-luxury-gold w-4 h-4 cursor-pointer" 
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} 
                          onChange={selectAllFiltered} 
                        />
                      </th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="8" className="p-8 text-center">Loading orders...</td></tr>
                    ) : filteredOrders.length > 0 ? filteredOrders.map((order) => (
                      <tr key={order._id} className={`border-b border-black/5 hover:bg-secondary-white/20 transition-colors text-sm ${selectedOrders.includes(order._id) ? 'bg-luxury-gold/5' : ''}`}>
                        <td className="p-4 pl-6">
                          <input type="checkbox" className="accent-luxury-gold w-4 h-4 cursor-pointer" 
                            checked={selectedOrders.includes(order._id)} 
                            onChange={() => toggleSelectOrder(order._id)} 
                          />
                        </td>
                        <td className="p-4 font-mono font-bold text-xs">{order.orderId}</td>
                        <td className="p-4 text-secondary-text text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <p className="font-medium">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                          <p className="text-[10px] text-secondary-text">{order.customerInfo?.phone}</p>
                        </td>
                        <td className="p-4 text-xs text-secondary-text">
                          {order.items.map(i => <div key={i._id}>{i.quantity}x {i.name} ({i.color})</div>)}
                        </td>
                        <td className="p-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <select 
                              className="bg-transparent border border-black/10 text-[10px] font-bold uppercase tracking-widest px-2 py-1 outline-none cursor-pointer"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            >
                              <option value="processing">Processing</option>
                              <option value="packing">Packing</option>
                              <option value="shipping">Shipping</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <button onClick={() => handleDownloadPDF(order.orderId)} className="p-1 text-secondary-text hover:text-luxury-gold transition-colors" title="Download Invoice">
                              <FileText size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-secondary-text text-sm">No orders found matching the criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: 'var(--font-bebas)' }}>Products</h1>
                <p className="text-secondary-text text-sm">Manage your product inventory.</p>
              </div>
              <button onClick={() => openProductModal()} className="flex items-center gap-2 bg-primary-text text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors shadow-sm">
                <Plus size={16} /> Add Product
              </button>
            </header>

            {/* PRODUCTS TABLE */}
            <div className="bg-white border border-black/5 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary-white/50 text-xs font-bold uppercase tracking-widest text-secondary-text border-b border-black/5">
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Badge</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? products.map((product) => (
                      <tr key={product._id} className="border-b border-black/5 hover:bg-secondary-white/20 transition-colors text-sm">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-bold text-primary-text">{product.name}</p>
                              <p className="text-[10px] text-secondary-text">{product.material}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold">Rs. {product.basePrice?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full 
                            ${product.stock < 10 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          {product.badge && (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary-text text-white">
                              {product.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <button onClick={() => openProductModal(product)} className="p-2 text-secondary-text hover:text-luxury-gold hover:bg-luxury-gold/10 transition-colors" title="Edit Product">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteProduct(product._id)} className="p-2 text-secondary-text hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete Product">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-secondary-text text-sm">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* PRODUCT MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-black/10 flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowProductModal(false)} className="text-secondary-text hover:text-primary-text">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={saveProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Name</label>
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Price</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows={3} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Material</label>
                    <input type="text" value={productForm.material} onChange={(e) => setProductForm({...productForm, material: e.target.value})} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Stock</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Image URL / Path</label>
                    <input type="text" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Hover Image URL / Path</label>
                    <input type="text" value={productForm.hoverImage} onChange={(e) => setProductForm({...productForm, hoverImage: e.target.value})} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Badge</label>
                  <input type="text" value={productForm.badge} onChange={(e) => setProductForm({...productForm, badge: e.target.value})} placeholder="e.g., Signature Series" className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                  <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-secondary-text hover:text-primary-text">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-primary-text text-white hover:bg-luxury-gold transition-colors">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
