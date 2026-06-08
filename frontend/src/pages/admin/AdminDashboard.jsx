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
import fitzLogo from '../../assets/fitz1.webp';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Order Edit State
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderEditForm, setOrderEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doorNo: '',
    streetName: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    zip: '',
    paymentStatus: 'pending',
    items: [],
    dispatchDate: '',
    expectedDeliveryDate: ''
  });

  // Filters
  const [filterProduct, setFilterProduct] = useState('All');
  const [filterVariant, setFilterVariant] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exactDate, setExactDate] = useState('');

  // Bulk Selection
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Tracking Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingInputId, setTrackingInputId] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('indian');
  const [courierNameInput, setCourierNameInput] = useState('Indian Courier');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    size: 'regular',
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
        size: product.size || 'regular',
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
        size: 'regular',
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

  const updateOrderDetails = async (id, details) => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${id}/status`, details, { headers, withCredentials: true });
      setOrders(orders.map(o => o._id === id ? res.data.order : o));
      toast.success(`Order updated successfully`);
    } catch (error) {
      toast.error('Failed to update order details');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/orders/${id}`, { headers, withCredentials: true });
      setOrders(orders.filter(o => o._id !== id));
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const saveOrderEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const door = orderEditForm.doorNo ? orderEditForm.doorNo.trim() : '';
      const street = orderEditForm.streetName ? orderEditForm.streetName.trim() : '';
      const area = orderEditForm.area ? orderEditForm.area.trim() : '';
      const landmark = orderEditForm.landmark ? orderEditForm.landmark.trim() : '';
      
      let fullAddress = `${door}, ${street}, ${area}`;
      if (landmark) {
        fullAddress += `, ${landmark}`;
      }

      const updatedPayload = {
        customerInfo: {
          firstName: orderEditForm.firstName,
          lastName: orderEditForm.lastName,
          email: orderEditForm.email,
          phone: orderEditForm.phone
        },
        shippingAddress: {
          address: fullAddress,
          city: orderEditForm.city,
          state: orderEditForm.state,
          zip: orderEditForm.zip,
          method: editingOrder.shippingAddress?.method || 'Free Shipping'
        },
        items: orderEditForm.items,
        totalAmount: orderEditForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentStatus: orderEditForm.paymentStatus,
        dispatchDate: orderEditForm.dispatchDate ? new Date(orderEditForm.dispatchDate) : undefined,
        expectedDeliveryDate: orderEditForm.expectedDeliveryDate ? new Date(orderEditForm.expectedDeliveryDate) : undefined
      };

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${editingOrder._id}`, updatedPayload, { headers, withCredentials: true });
      if (res.data.success) {
        toast.success('Order details updated successfully');
        setOrders(orders.map(o => o._id === editingOrder._id ? res.data.order : o));
        setShowOrderEditModal(false);
      }
    } catch (error) {
      toast.error('Failed to update order details');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    const ordersToDelete = orders.filter(o => selectedOrders.includes(o._id) && filteredOrders.some(f => f._id === o._id));
    if (ordersToDelete.length === 0) return toast.error('No filtered orders selected');
    if (!window.confirm(`Are you sure you want to delete ${ordersToDelete.length} selected orders? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await Promise.all(ordersToDelete.map(o =>
        axios.delete(`${import.meta.env.VITE_API_URL}/admin/orders/${o._id}`, { headers, withCredentials: true })
      ));

      const deletedIds = ordersToDelete.map(o => o._id);
      setOrders(orders.filter(o => !deletedIds.includes(o._id)));
      setSelectedOrders([]);
      toast.success(`Successfully deleted ${ordersToDelete.length} orders`);
    } catch (error) {
      toast.error('Bulk deletion failed');
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
    // Filter to include only paid/completed orders
    const paidFilteredOrders = filteredOrders.filter(
      order => order.paymentStatus === 'paid' || order.paymentStatus === 'completed'
    );

    if (paidFilteredOrders.length === 0) {
      toast.error('No paid orders to export');
      return;
    }

    // Create CSV content
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Total', 'Status'];
    const rows = paidFilteredOrders.map(order => [
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
    toast.success(`Exported ${paidFilteredOrders.length} paid orders`);
  };

  // ── Load logo as base64 for jsPDF ──────────────────────────────────────────
  const loadLogoBase64 = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const drawShippingLabel = (doc, order, logoBase64, isFirstPage) => {
    if (!isFirstPage) doc.addPage();

    // Set standard font - The entire label uses bold text
    doc.setFont('Helvetica', 'bold');

    // --- TOP LEFT ---
    doc.setFontSize(11);
    doc.text('BOOKED UNDER BNPL ADVANCE FACILITY', 10, 15);
    let textWidth = doc.getTextWidth('BOOKED UNDER BNPL ADVANCE FACILITY');
    doc.setLineWidth(0.5);
    doc.line(10, 16, 10 + textWidth, 16);

    doc.text('TTN-628001/BNPL-ADV/TTN/TTN0050', 10, 21);
    textWidth = doc.getTextWidth('TTN-628001/BNPL-ADV/TTN/TTN0050');
    doc.line(10, 22, 10 + textWidth, 22);

    // --- MIDDLE LEFT ---
    doc.setFontSize(12);
    doc.text('BILLER ID: 1988872960', 11, 40);

    // --- BOTTOM LEFT ---
    doc.setFontSize(12);
    doc.text('FROM:', 10, 80);
    doc.text('Fitz1 Tuticorin', 23, 86);
    doc.text('Tamilnadu-628002,', 23, 92);
    doc.text('Mob : 8072210156', 23, 98);

    // --- RIGHT SIDE ---
    doc.setFontSize(12);
    doc.text('BUSINESS PARCEL', 100, 35);

    // TO Section
    doc.text('TO:', 65, 47);

    // Customer Info Block
    let currentY = 47;
    const rightX = 73;
    doc.setFontSize(12);

    const customerName = `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim();
    doc.text(customerName, rightX, currentY);
    currentY += 5;

    const addr = order.shippingAddress?.address || '';
    if (addr) {
      const addrLines = doc.splitTextToSize(`Door no - ${addr}`, 50);
      doc.text(addrLines, rightX, currentY);
      currentY += addrLines.length * 5;
    }

    const city = order.shippingAddress?.city || '';
    const zip = order.shippingAddress?.zip || '';
    if (city || zip) {
      doc.text(`${city} - ${zip}`, rightX, currentY);
      currentY += 5;
    }

    const phone = order.customerInfo?.phone || '';
    if (phone) {
      doc.text(`Ph number- ${phone}`, rightX, currentY);
      currentY += 5;
    }

    // Items ordered
    const orderStr = order.items.map(i => `${i.name} (${i.color || 'Standard'})`).join(', ');
    const orderLines = doc.splitTextToSize(`Order - ${orderStr}`, 50);
    doc.text(orderLines, rightX, currentY);
    currentY += orderLines.length * 5;

    // --- BOTTOM RIGHT (LOGO) ---
    if (logoBase64) {
      try {
        // Place logo at the bottom right, with even more padding from text
        doc.addImage(logoBase64, 'PNG', 130, 88, 14, 8.5);
      } catch (e) {
        console.error('Logo error', e);
      }
    }
  };

  const drawSTCourierLabel = (doc, order, logoBase64, isFirstPage) => {
    if (!isFirstPage) doc.addPage();

    // Border around the whole page margin
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    doc.rect(5, 5, 138, 95);

    // Split lines
    // Vertical line down the middle of upper section
    doc.line(74, 5, 74, 60);
    // Horizontal line for return address split
    doc.line(5, 38, 74, 38);
    // Horizontal line separating upper section and product details
    doc.line(5, 60, 143, 60);
    // Horizontal line separating product details and note
    doc.line(5, 87, 143, 87);

    // --- Delivery Address Section ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Delivery Address:', 8, 10);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    let deliveryY = 14.5;
    const customerName = `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim();
    doc.text(customerName, 8, deliveryY);
    deliveryY += 3.8;

    const addr = order.shippingAddress?.address || '';
    if (addr) {
      const addrLines = doc.splitTextToSize(addr, 62);
      const linesToPrint = addrLines.slice(0, 3);
      linesToPrint.forEach(line => {
        doc.text(line, 8, deliveryY);
        deliveryY += 3.8;
      });
    }

    const city = order.shippingAddress?.city || '';
    const state = order.shippingAddress?.state || '';
    const zip = order.shippingAddress?.zip || '';
    let locStr = '';
    if (city) locStr += city;
    if (state) locStr += (locStr ? `, ${state}` : state);
    if (zip) locStr += (locStr ? ` - ${zip}` : zip);
    
    if (locStr) {
      const locLines = doc.splitTextToSize(locStr, 62);
      locLines.slice(0, 1).forEach(line => {
        doc.text(line, 8, deliveryY);
        deliveryY += 3.8;
      });
    }

    const phone = order.customerInfo?.phone || '';
    if (phone) {
      doc.text(`Ph No- ${phone}`, 8, 36);
    }

    // --- Return Address Section ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('If undelivered, return to:', 8, 41.5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Fitz1,', 8, 45);
    doc.text('5/1293 Thai nagar,', 8, 48.5);
    doc.text('Mapillaiyurani, Tuticorin.', 8, 52);
    doc.text('628002.', 8, 55.5);
    doc.text('Ph No:. 8072210156', 8, 59);

    // --- Logo Area (Right Side) ---
    if (logoBase64) {
      try {
        // Centered inside x=74..143 (width 69) and y=5..60 (height 55)
        doc.addImage(logoBase64, 'PNG', 83.5, 17.5, 50, 30);
      } catch (e) {
        console.error('Logo error', e);
      }
    }

    // --- Product Details Section ---
    const firstItem = order.items?.[0] || { name: 'Parallettes', color: 'Natural', quantity: 1 };
    const prodName = 'Parallettes'; // Template has "Parallettes"
    const prodSize = firstItem.name.toLowerCase().includes('mini') ? 'Mini' : 'Regular';
    const prodQty = firstItem.quantity || 1;
    const prodColor = firstItem.color || 'Natural';
    const priceStr = `Rs. ${order.totalAmount}/-`;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Product Details: -', 8, 65);

    // Table Headers
    doc.text('Product', 28, 71, { align: 'center' });
    doc.text('Size', 55, 71, { align: 'center' });
    doc.text('Qty', 78, 71, { align: 'center' });
    doc.text('Color', 100, 71, { align: 'center' });
    doc.text('Prepaid', 125, 71, { align: 'center' });

    // Table Values
    doc.setFont('Helvetica', 'normal');
    doc.text(prodName, 28, 79, { align: 'center' });
    doc.text(prodSize, 55, 79, { align: 'center' });
    doc.text(String(prodQty), 78, 79, { align: 'center' });
    doc.text(prodColor, 100, 79, { align: 'center' });
    doc.text(priceStr, 125, 79, { align: 'center' });

    // --- Bottom Note Section ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Note: Please handle with care.', 8, 93);
  };

  const handleDownloadPDF = async (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'completed') {
      toast.error('Invoices can only be downloaded for paid orders');
      return;
    }

    const toastId = toast.loading('Generating PDF...');
    try {
      const logoBase64 = await loadLogoBase64(fitzLogo);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a6' });
      if (downloadFormat === 'st') {
        drawSTCourierLabel(doc, order, logoBase64, true);
      } else {
        drawShippingLabel(doc, order, logoBase64, true);
      }
      doc.save(`Invoice_${order.orderId}.pdf`);
      toast.success(`Downloaded invoice for ${orderId}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const handleBulkDownload = async () => {
    let targetOrders = [];
    if (selectedOrders.length > 0) {
      targetOrders = orders.filter(o => selectedOrders.includes(o._id));
    } else if (filteredOrders.length > 0) {
      targetOrders = filteredOrders;
    } else {
      toast.error('No orders to download');
      return;
    }

    // Filter targetOrders to only include paid/completed orders
    const paidTargetOrders = targetOrders.filter(
      o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed'
    );

    if (paidTargetOrders.length === 0) {
      toast.error('No paid orders found to download');
      return;
    }

    const toastId = toast.loading(`Generating ${paidTargetOrders.length} PDFs...`);
    try {
      const logoBase64 = await loadLogoBase64(fitzLogo);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a6' });
      for (let i = 0; i < paidTargetOrders.length; i++) {
        if (downloadFormat === 'st') {
          drawSTCourierLabel(doc, paidTargetOrders[i], logoBase64, i === 0);
        } else {
          drawShippingLabel(doc, paidTargetOrders[i], logoBase64, i === 0);
        }
      }
      doc.save(`Bulk_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Downloaded ${paidTargetOrders.length} invoices`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate bulk PDFs', { id: toastId });
    }
  };




  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const orderItemsString = o.items.map(i => i.name).join(' ');
    const productMatch = filterProduct === 'All' || orderItemsString.includes(filterProduct);

    // Variant / Color match
    let variantMatch = true;
    if (filterVariant !== 'All') {
      variantMatch = o.items.some(item => {
        const name = item.name.toLowerCase();
        const color = item.color.toLowerCase();
        
        if (filterVariant === 'mini-black') {
          return name.includes('mini') && (color.includes('black') || color.includes('shadow black'));
        }
        if (filterVariant === 'mini-natural') {
          return name.includes('mini') && (color.includes('natural') || color.includes('natural finish'));
        }
        if (filterVariant === 'regular-black') {
          return name.includes('regular') && (color.includes('black') || color.includes('shadow black'));
        }
        if (filterVariant === 'regular-natural') {
          return name.includes('regular') && (color.includes('natural') || color.includes('natural finish'));
        }
        return false;
      });
    }

    const orderDate = new Date(o.createdAt).setHours(0, 0, 0, 0);

    if (exactDate) {
      const exactD = new Date(exactDate).setHours(0, 0, 0, 0);
      if (orderDate !== exactD) return false;
    } else {
      const fromD = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const toD = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
      if (fromD && orderDate < fromD) return false;
      if (toD && orderDate > toD) return false;
    }

    return productMatch && variantMatch;
  });

  const selectAllFiltered = () => {
    if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  // Group orders by base order ID to avoid duplicate calculations in stats cards
  const getBaseOrderId = (orderId) => {
    if (!orderId) return '';
    const parts = orderId.split('-');
    return parts.length > 3 ? parts.slice(0, 3).join('-') : orderId;
  };

  const orderGroups = orders.reduce((groups, order) => {
    const baseId = getBaseOrderId(order.orderId);
    if (!groups[baseId]) {
      groups[baseId] = [];
    }
    groups[baseId].push(order);
    return groups;
  }, {});

  const totalOrdersCount = Object.keys(orderGroups).length;

  const totalRevenue = Object.values(orderGroups).reduce((sum, group) => {
    const isPaid = group.some(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed');
    if (isPaid) {
      return sum + group.reduce((acc, curr) => acc + curr.totalAmount, 0);
    }
    return sum;
  }, 0);

  const pendingOrdersCount = Object.values(orderGroups).filter(group => {
    return group.some(o => o.status === 'processing' || o.status === 'packing');
  }).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'packing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-secondary-white min-h-screen flex flex-col lg:flex-row pt-20">

      {/* MOBILE TAB BAR */}
      <div className="lg:hidden w-full bg-white border-b border-black/5 px-4 py-3 flex overflow-x-auto gap-2 sticky top-20 z-20 shadow-sm">
        {[
          { name: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
          { name: 'Orders', icon: ShoppingCart, tab: 'orders' },
          { name: 'Products', icon: Package, tab: 'products' },
          { name: 'Settings', icon: Settings, tab: 'settings' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(item.tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors rounded
              ${activeTab === item.tab ? 'bg-primary-text text-white' : 'bg-secondary-white text-secondary-text hover:bg-black/5 hover:text-primary-text'}`}
          >
            <item.icon size={16} /> {item.name}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap bg-red-50 text-red-600 rounded hover:bg-red-500 hover:text-white transition-colors ml-auto"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

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
                onClick={() => setActiveTab(item.tab)}
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
              <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Dashboard</h1>
              <p className="text-secondary-text text-sm">Overview of your store performance.</p>
            </header>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Revenue</p>
                <h3 className="text-3xl font-bold text-primary-text">₹{totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Orders</p>
                <h3 className="text-3xl font-bold text-primary-text">{totalOrdersCount}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Products</p>
                <h3 className="text-3xl font-bold text-primary-text">{products.length}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Pending Orders</p>
                <h3 className="text-3xl font-bold text-primary-text">{pendingOrdersCount}</h3>
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
                        <td className="p-4 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-secondary-text text-xs">
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          {order.dispatchDate && (
                            <div className="text-[10px] text-gray-500 mt-1">
                              Disp: {new Date(order.dispatchDate).toLocaleDateString()}
                            </div>
                          )}
                          {order.expectedDeliveryDate && (
                            <div className="text-[10px] text-luxury-gold font-bold mt-0.5">
                              Delv: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
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
                <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Orders</h1>
                <p className="text-secondary-text text-sm">Manage and track customer orders.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-black/10 px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                  <span className="text-secondary-text">Format:</span>
                  <select 
                    value={downloadFormat} 
                    onChange={(e) => setDownloadFormat(e.target.value)} 
                    className="bg-transparent text-primary-text outline-none cursor-pointer"
                  >
                    <option value="indian">Indian Courier</option>
                    <option value="st">ST Courier</option>
                  </select>
                </div>
                <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-colors shadow-sm">
                  <FileSpreadsheet size={16} /> Export Excel
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={filteredOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed').length === 0}
                  className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold hover:text-luxury-gold transition-colors shadow-sm disabled:opacity-50"
                >
                  <FileText size={16} /> Download Filtered Invoices ({filteredOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed').length})
                </button>
              </div>

            </header>

            {/* ANALYTICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ArrowUpRight size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Revenue</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">₹{totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShoppingCart size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Total Orders</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">{totalOrdersCount}</h3>
              </div>
              <div className="bg-white p-6 border border-black/5 shadow-sm relative overflow-hidden group hover:border-luxury-gold/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><LayoutDashboard size={48} /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Pending Fulfillment</p>
                <h3 className="text-3xl font-bold text-primary-text mb-1">{pendingOrdersCount}</h3>
              </div>
            </div>

            {/* FILTERS & BULK ACTIONS */}
            <div className="bg-white border border-black/5 shadow-sm mb-6 p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setExactDate(''); }} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">To Date</label>
                    <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setExactDate(''); }} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div className="mx-2 flex items-center h-10 text-xs font-bold text-secondary-text uppercase">OR</div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Specific Date</label>
                    <input type="date" value={exactDate} onChange={(e) => { setExactDate(e.target.value); setFromDate(''); setToDate(''); }} className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Product Filter</label>
                    <div className="flex items-center gap-2 border border-black/10 px-3 py-2">
                      <Filter size={16} className="text-secondary-text" />
                      <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="bg-transparent text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer">
                        <option value="All">All Products</option>
                        <option value="Regular">Pro Series Regular</option>
                        <option value="Mini">Mini Parallettes</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Color/Variant Filter</label>
                    <div className="flex items-center gap-2 border border-black/10 px-3 py-2">
                      <Filter size={16} className="text-secondary-text" />
                      <select value={filterVariant} onChange={(e) => setFilterVariant(e.target.value)} className="bg-transparent text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer">
                        <option value="All">All Combinations</option>
                        <option value="mini-black">Mini Black</option>
                        <option value="mini-natural">Mini Natural</option>
                        <option value="regular-black">Regular Black</option>
                        <option value="regular-natural">Regular Natural</option>
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
                    <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-1.5">
                      <Trash2 size={14} /> Delete Selected
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
                      <th className="p-4">Payment</th>
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
                        <td className="p-4 text-secondary-text text-xs">
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          {order.dispatchDate && (
                            <div className="text-[10px] text-gray-500 mt-1">
                              Disp: {new Date(order.dispatchDate).toLocaleDateString()}
                            </div>
                          )}
                          {order.expectedDeliveryDate && (
                            <div className="text-[10px] text-luxury-gold font-bold mt-0.5">
                              Delv: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                          <p className="text-[10px] text-secondary-text">{order.customerInfo?.phone}</p>
                        </td>
                        <td className="p-4 text-xs text-secondary-text">
                          {order.items.map(i => <div key={i._id}>{i.quantity}x {i.name} ({i.color})</div>)}
                        </td>
                        <td className="p-4 font-bold">₹{order.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                              {order.paymentStatus || 'unpaid'}
                            </span>
                            <a
                              href={`https://wa.me/${
                                order.customerInfo?.phone 
                                  ? (order.customerInfo.phone.replace(/\D/g, '').length === 10 
                                      ? '91' + order.customerInfo.phone.replace(/\D/g, '') 
                                      : order.customerInfo.phone.replace(/\D/g, '')) 
                                  : ''
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded border border-green-200 transition-all flex items-center justify-center shadow-sm"
                              title="Contact via WhatsApp"
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-11.585c.124-.075.914-.54 1.129-.665.215-.125.378-.025.539.125.161.15.616.755.756.905.14.15.28.175.495.05.215-.125.909-.34 1.732-1.073.64-.57 1.073-1.275 1.199-1.488.125-.213.013-.327-.093-.433-.096-.095-.215-.25-.323-.375-.108-.125-.144-.213-.215-.363-.072-.15-.036-.282.018-.387.054-.105.536-1.288.732-1.762.193-.462.383-.393.539-.393l.462-.011c.16 0 .42.06.64.3.22.24.84.82.84 2.012 0 1.192-.87 2.343-.99 2.506-.12.162-1.713 2.616-4.148 3.66-.58.248-1.031.396-1.385.508-.583.186-1.113.16-1.533.097-.47-.07-1.447-.592-1.653-1.164-.206-.572-.206-1.063-.144-1.164.062-.101.23-.15.424-.25z"/>
                              </svg>
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full w-fit ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <button 
                              onClick={() => {
                                setTrackingOrder(order);
                                setTrackingInputId(order.trackingId || '');
                                setCourierNameInput(order.courierName || 'Indian Courier');
                                setShowTrackingModal(true);
                              }}
                              className="mt-2 text-[10px] font-bold uppercase tracking-widest border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors px-3 py-1.5 w-fit flex items-center gap-1.5"
                            >
                              <Package size={12} /> {order.trackingId ? 'Edit Tracking' : 'Add Tracking'}
                            </button>
                            {order.trackingId && (
                              <span className="text-[10px] font-mono text-secondary-text mt-1">
                                {order.courierName || 'Indian Courier'}: {order.trackingId}
                              </span>
                            )}

                          </div>
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <select
                              className="bg-transparent border border-black/10 text-[10px] font-bold uppercase tracking-widest px-2 py-1 outline-none cursor-pointer"
                              value={order.status}
                              onChange={(e) => updateOrderDetails(order._id, { status: e.target.value, trackingId: order.trackingId, courierName: order.courierName, trackingLink: order.trackingLink })}
                            >
                              <option value="processing">Processing</option>
                              <option value="packing">Packing</option>
                              <option value="shipping">Shipping</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <button 
                              onClick={() => {
                                setEditingOrder(order);
                                const addrParts = order.shippingAddress?.address ? order.shippingAddress.address.split(',') : [];
                                setOrderEditForm({
                                  firstName: order.customerInfo?.firstName || '',
                                  lastName: order.customerInfo?.lastName || '',
                                  email: order.customerInfo?.email || '',
                                  phone: order.customerInfo?.phone || '',
                                  doorNo: addrParts[0] || '',
                                  streetName: addrParts[1]?.trim() || '',
                                  area: addrParts[2]?.trim() || '',
                                  landmark: addrParts[3]?.trim() || '',
                                  city: order.shippingAddress?.city || '',
                                  state: order.shippingAddress?.state || '',
                                  zip: order.shippingAddress?.zip || '',
                                  paymentStatus: order.paymentStatus || 'pending',
                                  items: order.items ? order.items.map(item => ({ ...item })) : [],
                                  dispatchDate: order.dispatchDate ? new Date(order.dispatchDate).toISOString().split('T')[0] : '',
                                  expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : ''
                                });
                                setShowOrderEditModal(true);
                              }} 
                              className="p-1 text-secondary-text hover:text-luxury-gold transition-colors" 
                              title="Edit Order Details"
                            >
                              <Pencil size={18} />
                            </button>
                            {(order.paymentStatus === 'paid' || order.paymentStatus === 'completed') && (
                              <button onClick={() => handleDownloadPDF(order.orderId)} className="p-1 text-secondary-text hover:text-luxury-gold transition-colors" title="Download Invoice">
                                <FileText size={18} />
                              </button>
                            )}
                            <button onClick={() => handleDeleteOrder(order._id)} className="p-1 text-secondary-text hover:text-red-500 transition-colors" title="Delete Order">
                              <Trash2 size={18} />
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
                <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Products</h1>
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
                        <td className="p-4 font-bold">₹{product.basePrice?.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full w-fit 
                              ${product.stock < 10 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                              Total: {product.stock} units
                            </span>
                            {product.colors && product.colors.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {product.colors.map(c => (
                                  <span key={c.id || c._id} className="text-[9px] font-medium text-secondary-text bg-secondary-white px-2 py-0.5 border border-black/5 rounded-sm flex items-center gap-1" title={`${c.name} Stock`}>
                                    <span className="w-1.5 h-1.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }}></span>
                                    {c.stock !== undefined ? c.stock : Math.round(product.stock / product.colors.length)} units
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
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

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl">
            <header className="mb-10">
              <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Settings</h1>
              <p className="text-secondary-text text-sm">Configure admin account and notification preferences.</p>
            </header>

            <div className="bg-white p-6 border border-black/5 shadow-sm space-y-6 mb-8">
              <h2 className="text-lg font-bold uppercase tracking-widest text-primary-text pb-4 border-b border-black/5">System Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-2">Admin Notification Email</label>
                  <input type="email" disabled value="kavinath50@gmail.com" className="w-full bg-secondary-white border border-black/10 px-4 py-3 text-xs font-mono text-secondary-text cursor-not-allowed" />
                  <p className="text-[10px] text-secondary-text mt-1">Configured via environment variables (SMTP_USER / ADMIN_EMAIL).</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-2">SMTP Relay Host</label>
                  <input type="text" disabled value="smtp-relay.brevo.com (Port 587)" className="w-full bg-secondary-white border border-black/10 px-4 py-3 text-xs font-mono text-secondary-text cursor-not-allowed" />
                  <p className="text-[10px] text-secondary-text mt-1">Brevo transactional email service connected.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-black/5 shadow-sm space-y-6">
              <h2 className="text-lg font-bold uppercase tracking-widest text-primary-text pb-4 border-b border-black/5">Security & Session</h2>
              <div>
                <p className="text-xs font-bold text-primary-text mb-1">Active JWT Admin Session</p>
                <p className="text-xs text-secondary-text mb-4">You are currently authenticated as super administrator. Your token is valid for 24 hours.</p>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                  Revoke Session & Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ORDER EDIT MODAL */}
        {showOrderEditModal && editingOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-black/10 flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text">
                  Edit Order #{editingOrder.orderId}
                </h2>
                <button onClick={() => setShowOrderEditModal(false)} className="text-secondary-text hover:text-primary-text">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={saveOrderEdit} className="p-6 space-y-6">
                {/* Customer Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold pb-2 border-b border-black/5">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">First Name</label>
                      <input type="text" value={orderEditForm.firstName} onChange={(e) => setOrderEditForm({ ...orderEditForm, firstName: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Last Name</label>
                      <input type="text" value={orderEditForm.lastName} onChange={(e) => setOrderEditForm({ ...orderEditForm, lastName: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Email</label>
                      <input type="email" value={orderEditForm.email} onChange={(e) => setOrderEditForm({ ...orderEditForm, email: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Phone</label>
                      <input type="text" value={orderEditForm.phone} onChange={(e) => setOrderEditForm({ ...orderEditForm, phone: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold pb-2 border-b border-black/5">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Door No</label>
                      <input type="text" value={orderEditForm.doorNo} onChange={(e) => setOrderEditForm({ ...orderEditForm, doorNo: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Street Name</label>
                      <input type="text" value={orderEditForm.streetName} onChange={(e) => setOrderEditForm({ ...orderEditForm, streetName: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Area</label>
                      <input type="text" value={orderEditForm.area} onChange={(e) => setOrderEditForm({ ...orderEditForm, area: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Landmark</label>
                      <input type="text" value={orderEditForm.landmark} onChange={(e) => setOrderEditForm({ ...orderEditForm, landmark: e.target.value })} className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">City</label>
                      <input type="text" value={orderEditForm.city} onChange={(e) => setOrderEditForm({ ...orderEditForm, city: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">State</label>
                      <input type="text" value={orderEditForm.state} onChange={(e) => setOrderEditForm({ ...orderEditForm, state: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Zip Code</label>
                      <input type="text" value={orderEditForm.zip} onChange={(e) => setOrderEditForm({ ...orderEditForm, zip: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white" />
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold">Ordered Items</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultProduct = products.length > 0 ? products[0] : { name: 'Pro Series Regular', basePrice: 2499 };
                        const newItem = {
                          productId: defaultProduct._id || '',
                          name: defaultProduct.name || 'Pro Series Regular',
                          color: 'Natural Finish',
                          price: defaultProduct.basePrice || 2499,
                          quantity: 1
                        };
                        setOrderEditForm({ ...orderEditForm, items: [...orderEditForm.items, newItem] });
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:text-luxury-gold/80 flex items-center gap-1 transition-colors border border-luxury-gold/20 px-2.5 py-1 rounded"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div className="max-h-[30vh] overflow-y-auto pr-1">
                    {orderEditForm.items.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-secondary-white p-3 border border-black/5 rounded-sm mb-3">
                        <div className="flex-grow">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Product</span>
                          <select 
                            value={products.some(p => p._id === item.productId || p.name === item.name) ? (products.find(p => p._id === item.productId || p.name === item.name)?._id) : ''}
                            onChange={(e) => {
                              const selectedProd = products.find(p => p._id === e.target.value);
                              if (selectedProd) {
                                const updatedItems = [...orderEditForm.items];
                                updatedItems[index] = { 
                                  ...item, 
                                  productId: selectedProd._id,
                                  name: selectedProd.name,
                                  price: selectedProd.basePrice 
                                };
                                setOrderEditForm({ ...orderEditForm, items: updatedItems });
                              }
                            }}
                            className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text bg-white outline-none cursor-pointer"
                          >
                            <option value="" disabled>Select Product...</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-36">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Color</span>
                          <select 
                            value={item.color} 
                            onChange={(e) => {
                              const updatedItems = [...orderEditForm.items];
                              updatedItems[index] = { ...item, color: e.target.value };
                              setOrderEditForm({ ...orderEditForm, items: updatedItems });
                            }}
                            className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text bg-white outline-none cursor-pointer"
                          >
                            <option value="Standard">Standard</option>
                            <option value="Natural Finish">Natural Finish</option>
                            <option value="Shadow Black">Shadow Black</option>
                          </select>
                        </div>
                        <div className="w-20">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Qty</span>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            min="1" 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const updatedItems = [...orderEditForm.items];
                              updatedItems[index] = { ...item, quantity: val };
                              setOrderEditForm({ ...orderEditForm, items: updatedItems });
                            }}
                            className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text bg-white outline-none" 
                          />
                        </div>
                        <div className="w-24">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Price (₹)</span>
                          <input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updatedItems = [...orderEditForm.items];
                              updatedItems[index] = { ...item, price: val };
                              setOrderEditForm({ ...orderEditForm, items: updatedItems });
                            }}
                            className="w-full border border-black/10 px-3 py-2 text-xs font-bold text-primary-text bg-white outline-none" 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const updatedItems = orderEditForm.items.filter((_, i) => i !== index);
                            setOrderEditForm({ ...orderEditForm, items: updatedItems });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center border border-red-100 h-[38px] w-[38px]"
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {orderEditForm.items.length === 0 && (
                      <p className="text-xs text-secondary-text text-center italic py-4">No items inside this order. Click "Add Item" to add products.</p>
                    )}
                  </div>
                </div>

                {/* Total, Dates and Payment Status */}
                <div className="grid grid-cols-2 gap-6 bg-secondary-white p-4 border border-black/5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Payment Status</span>
                    <select 
                      value={orderEditForm.paymentStatus} 
                      onChange={(e) => setOrderEditForm({ ...orderEditForm, paymentStatus: e.target.value })}
                      className="border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer bg-white w-full"
                    >
                      <option value="pending">Pending / Unpaid</option>
                      <option value="completed">Completed / Paid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Total Amount</span>
                    <span className="text-xl font-bold text-primary-text">₹{orderEditForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-secondary-white p-4 border border-black/5 -mt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Dispatch Date</span>
                    <input 
                      type="date"
                      value={orderEditForm.dispatchDate}
                      onChange={(e) => setOrderEditForm({ ...orderEditForm, dispatchDate: e.target.value })}
                      className="border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white w-full"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text block mb-1">Expected Delivery Date</span>
                    <input 
                      type="date"
                      value={orderEditForm.expectedDeliveryDate}
                      onChange={(e) => setOrderEditForm({ ...orderEditForm, expectedDeliveryDate: e.target.value })}
                      className="border border-black/10 px-3 py-2 text-xs font-bold text-primary-text outline-none bg-white w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                  <button type="button" onClick={() => setShowOrderEditModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-secondary-text hover:text-primary-text">Cancel</button>
                  <button type="submit" disabled={orderEditForm.items.length === 0} className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-primary-text text-white hover:bg-luxury-gold transition-colors disabled:opacity-50">
                    Save Order Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
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
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Price</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Material</label>
                    <input type="text" value={productForm.material} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Color Stock Levels (Total: {productForm.stock})</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {productForm.colors?.map((color, index) => {
                        const defaultStock = color.stock !== undefined 
                          ? color.stock 
                          : (editingProduct ? Math.round((parseInt(productForm.stock) || 0) / (productForm.colors.length || 2)) : 25);
                        return (
                          <div key={color.id || index} className="bg-secondary-white p-2.5 border border-black/5 rounded-sm flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-text flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }}></span>
                              {color.name}
                            </span>
                            <input 
                              type="number" 
                              value={defaultStock} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const updatedColors = [...productForm.colors];
                                updatedColors[index] = { ...color, stock: val };
                                
                                // Calculate total stock sum
                                const totalStock = updatedColors.reduce((sum, c) => {
                                  const cStock = c.stock !== undefined ? c.stock : (editingProduct ? Math.round((parseInt(productForm.stock) || 0) / (productForm.colors.length || 2)) : 25);
                                  return sum + (parseInt(cStock) || 0);
                                }, 0);
                                
                                setProductForm({ 
                                  ...productForm, 
                                  colors: updatedColors,
                                  stock: totalStock.toString() 
                                });
                              }} 
                              required 
                              min="0"
                              className="w-full border border-black/10 px-2.5 py-1.5 bg-white text-xs font-bold text-primary-text outline-none" 
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Size Type</label>
                    <select value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none cursor-pointer bg-white">
                      <option value="regular">Regular</option>
                      <option value="mini">Mini</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Badge</label>
                    <input type="text" value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} placeholder="e.g., Signature Series" className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Image URL / Path</label>
                    <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-1">Hover Image URL / Path</label>
                    <input type="text" value={productForm.hoverImage} onChange={(e) => setProductForm({ ...productForm, hoverImage: e.target.value })} className="w-full border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-text outline-none" />
                  </div>
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
      {/* Tracking Modal */}
      {showTrackingModal && trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full p-8 relative">
            <button onClick={() => setShowTrackingModal(false)} className="absolute top-4 right-4 text-secondary-text hover:text-primary-text">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold uppercase tracking-tighter text-primary-text mb-6 border-b border-black/10 pb-4">
              Add Tracking Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Courier Name</label>
                <select 
                  value={courierNameInput} 
                  onChange={(e) => setCourierNameInput(e.target.value)} 
                  className="w-full border border-black/20 p-3 text-sm outline-none focus:border-luxury-gold bg-white font-bold uppercase tracking-widest cursor-pointer"
                >
                  <option value="Indian Courier">Indian Courier</option>
                  <option value="ST Courier">ST Courier</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary-text mb-2">Tracking ID</label>
                <input 
                  type="text" 
                  value={trackingInputId} 
                  onChange={(e) => setTrackingInputId(e.target.value)} 
                  className="w-full border border-black/20 p-3 text-sm outline-none focus:border-luxury-gold font-mono"
                  placeholder="Enter Tracking ID..."
                />
              </div>
              <button 
                onClick={() => {
                  const link = courierNameInput === 'ST Courier' 
                    ? 'https://stcourier.com/' 
                    : 'https://www.indiapost.gov.in/';
                  updateOrderDetails(trackingOrder._id, { 
                    status: trackingOrder.status,
                    trackingId: trackingInputId, 
                    courierName: courierNameInput, 
                    trackingLink: link 
                  });
                  setShowTrackingModal(false);
                }}
                className="w-full bg-primary-text text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-luxury-gold transition-colors"
              >
                Save Tracking Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
