import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, Tag, Settings, Coffee, LogOut, Search, Edit2, ShieldAlert, LayoutDashboard, TrendingUp, AlertTriangle, BookOpen, Eye, EyeOff, Calendar, LifeBuoy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { client } from '../../lib/sanity';
import './AdminDashboard.css';

const fetchWithAuth = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return fetch(url, { ...options, headers });
};

const AdminDashboard = () => {
  const { user, login, logout, isAdmin, loading } = useAuth() || { user: null, login: () => {}, logout: () => {}, isAdmin: false, loading: false };
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeProductCategory, setActiveProductCategory] = useState('All Teas');
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [settings, setSettings] = useState({
    store_email: '',
    store_phone: '',
    shipping_flat_rate: 150,
    announcement_text: '',
    bulk_weight_options: '500, 1000, 2000, 3000, 4000'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState([]);

  // Journal State
  const [journalPosts, setJournalPosts] = useState([]);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalSlug, setNewJournalSlug] = useState('');
  const [newJournalExcerpt, setNewJournalExcerpt] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');
  const [isPublishingJournal, setIsPublishingJournal] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState(null);
  const [editJournalData, setEditJournalData] = useState({ title: '', slug: '', excerpt: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Admin Login State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Coupon Creation State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponType, setNewCouponType] = useState('percentage');
  const [newCouponMinCart, setNewCouponMinCart] = useState('');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState('');

  // Inline Editing State
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState(0);
  const [editStock, setEditStock] = useState(true);
  const [editCustomWeights, setEditCustomWeights] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Security Check
  const isAuthorized = isAdmin;

  useEffect(() => {
    if (isAuthorized) {
      fetchAllData();
      
      // Real-time Sanity Listener for live syncing
      const subscription = client.listen('*[_type == "product"]').subscribe((update) => {
        fetchProducts(); // Re-fetch products instantly on any Sanity update
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isAuthorized]);

  const fetchProducts = async () => {
    try {
      // Force bypass CDN for the Admin dashboard
      const sanityProducts = await client.withConfig({ useCdn: false }).fetch(`
        *[_type == "product"] {
          _id,
          name,
          slug,
          price,
          "imageUrl": image.asset->url,
          subcategory,
          inStock,
          stock,
          customBulkWeights
        }
      `);
      setProducts(sanityProducts || []);
    } catch (err) {
      console.error("Error fetching Sanity products:", err);
    }
  };

  const fetchJournalPosts = async () => {
    try {
      const posts = await client.withConfig({ useCdn: false }).fetch(`
        *[_type == "journalPost"] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          content,
          publishedAt,
          isHidden
        }
      `);
      setJournalPosts(posts || []);
    } catch (err) {
      console.error("Error fetching journal posts:", err);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles ( full_name )
        `)
        .is('deleted_at', null)
        .neq('status', 'Pending Payment')
        .order('created_at', { ascending: false });
      
      if (!ordersError) setOrders(ordersData || []);

      // Fetch Customers securely from backend
      const customersRes = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/customers');
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.users || []);
      }

      // Fetch Support Tickets
      const supportRes = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/support-tickets');
      if (supportRes.ok) {
        const supportData = await supportRes.json();
        setSupportTickets(supportData || []);
      }

      // Fetch Products from Sanity
      await fetchProducts();

      // Fetch Journal Posts
      await fetchJournalPosts();

      // Fetch Bookings securely from backend (bypasses RLS)
      const bookingsRes = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/get-bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      // Fetch Coupons
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (!couponsError) setCoupons(couponsData || []);

      // Fetch Site Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!settingsError && settingsData) {
        setSettings(settingsData);
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportTicketUpdate = async (ticketId, newStatus) => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket marked as ${newStatus}`);
        setSupportTickets(supportTickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      } else {
        toast.error('Failed to update ticket');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (!error) {
        // Optimistic UI update
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will send a cancellation email to the customer.')) return;
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled & email sent");
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error("An error occurred while cancelling");
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/update-booking-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        toast.error("Failed to update booking status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setEditPrice(product.price);
    setEditStockQuantity(product.stock || 0);
    setEditStock(product.inStock !== false);
    setEditCustomWeights(product.customBulkWeights || '');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleSaveProduct = async (productId) => {
    try {
      const parsedQty = Number(editStockQuantity);
      
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          updates: {
            price: Number(editPrice),
            stock: parsedQty,
            inStock: editStock,
            customBulkWeights: editCustomWeights
          }
        })
      });

      const result = await res.json();
      if (result.success) {
        // Update local state
        setProducts(products.map(p => 
          p._id === productId 
            ? { ...p, price: Number(editPrice), stock: parsedQty, inStock: editStock, customBulkWeights: editCustomWeights } 
            : p
        ));
        setEditingProductId(null);
        toast.success("Product updated successfully!");
      } else {
        toast.error("Failed to update product: " + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to backend");
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/create-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: newCouponCode, 
          discount_percent: newCouponType === 'free_shipping' ? 0 : Number(newCouponDiscount),
          type: newCouponType,
          min_cart_value: newCouponMinCart ? Number(newCouponMinCart) : 0,
          usage_limit: newCouponUsageLimit ? Number(newCouponUsageLimit) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setCoupons([data.coupon, ...coupons]);
        setNewCouponCode('');
        setNewCouponDiscount('');
        setNewCouponType('percentage');
        setNewCouponMinCart('');
        setNewCouponUsageLimit('');
        toast.success("Coupon created successfully!");
      } else {
        toast.error("Failed to create coupon: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating coupon");
    }
  };

  const handleCreateJournalPost = async (e) => {
    e.preventDefault();
    if (!newJournalTitle || !newJournalSlug || !newJournalContent) return;
    setIsPublishingJournal(true);
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/create-journal-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newJournalTitle, 
          slug: newJournalSlug, 
          excerpt: newJournalExcerpt, 
          content: newJournalContent 
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewJournalTitle('');
        setNewJournalSlug('');
        setNewJournalExcerpt('');
        setNewJournalContent('');
        fetchJournalPosts(); // Refresh list
        toast.success('Post published successfully!');
      } else {
        toast.error('Failed to publish post: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error publishing journal post");
    } finally {
      setIsPublishingJournal(false);
    }
  };

  const handleUpdateJournalPost = async (id, updates) => {
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/update-journal-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });
      const data = await res.json();
      if (data.success) {
        fetchJournalPosts();
        setEditingJournalId(null);
        toast.success('Post updated successfully!');
      } else {
        toast.error('Failed to update post: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating post');
    }
  };

  const handleToggleJournalVisibility = async (id, currentIsHidden) => {
    await handleUpdateJournalPost(id, { isHidden: !currentIsHidden });
  };

  const handleToggleCoupon = async (id, currentStatus) => {
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/toggle-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/delete-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetchWithAuth((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings updated successfully!");
        setSettings(data.settings);
      } else {
        toast.error("Failed to update settings: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const result = await login(adminEmail, adminPassword);
    if (result && !result.success) {
      setLoginError(result.message);
    }
  };

  if (loading) {
    return (
      <div className="unauthorized-view" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <h2 style={{ color: '#f8fafc' }}>Checking Administrative Privileges...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="unauthorized-view" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div className="admin-glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%', background: 'rgba(30, 41, 59, 0.7)' }}>
          <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h1 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Admin Login</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Please log in to access the dashboard.</p>
          
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc' }}
            />
            {loginError && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{loginError}</div>}
            <button type="submit" className="admin-btn primary" style={{ width: '100%', marginTop: '0.5rem' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="unauthorized-view">
        <div className="admin-glass-panel">
          <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h1>Unauthorized Access</h1>
          <p>The account ({user.email}) does not have administrative privileges.</p>
          <button className="admin-btn" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>Return to Homepage</button>
        </div>
      </div>
    );
  }

  // Export Functions
  const handleExportCSV = () => {
    try {
      if (!orders.length) return toast.error("No orders to export");
      
      const headers = ['Order ID', 'Date', 'Customer ID', 'Total Amount', 'Status', 'Payment Status', 'Razorpay ID'];
      const csvRows = [headers.join(',')];
      
      orders.forEach(o => {
        csvRows.push([
          o.id,
          new Date(o.created_at).toLocaleString().replace(/,/g, ''),
          o.user_id,
          o.total_amount,
          o.status,
          o.payment_status,
          o.razorpay_payment_id || 'N/A'
        ].join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `orders_backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("CSV Export downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Error generating CSV");
    }
  };

  const handleExportSQL = () => {
    window.open((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/backup-sql', '_blank');
  };

  // Analytics Calculations
  const filterByDate = (items, dateField = 'created_at') => {
    if (timeFilter === 'all') return items;
    
    const now = new Date();
    let pastDate = new Date();
    
    switch(timeFilter) {
      case '1w': pastDate.setDate(now.getDate() - 7); break;
      case '1m': pastDate.setMonth(now.getMonth() - 1); break;
      case '3m': pastDate.setMonth(now.getMonth() - 3); break;
      case '1y': pastDate.setFullYear(now.getFullYear() - 1); break;
      default: return items;
    }
    
    return items.filter(item => new Date(item[dateField]) >= pastDate);
  };

  let filteredOrders = filterByDate(orders);
  let filteredCustomers = filterByDate(customers);
  let filteredJournalPosts = journalPosts;
  let filteredSupportTickets = supportTickets;
  let filteredBookings = bookings;
  let filteredCoupons = coupons;
  let filteredLowStockProducts = products.filter(p => p.inStock === false || p.stock === 0);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const safeMatch = (val) => val ? String(val).toLowerCase().includes(q) : false;
    
    filteredOrders = filteredOrders.filter(o => safeMatch(o.id) || safeMatch(o.profiles?.full_name));
    filteredCustomers = filteredCustomers.filter(c => safeMatch(c.user_metadata?.full_name) || safeMatch(c.email));
    filteredJournalPosts = filteredJournalPosts.filter(j => safeMatch(j.title) || safeMatch(j.slug));
    filteredSupportTickets = filteredSupportTickets.filter(t => safeMatch(t.id) || safeMatch(t.profiles?.full_name) || safeMatch(t.issue_type));
    filteredBookings = filteredBookings.filter(b => safeMatch(b.full_name) || safeMatch(b.email));
    filteredCoupons = filteredCoupons.filter(c => safeMatch(c.code));
    filteredLowStockProducts = filteredLowStockProducts.filter(p => safeMatch(p.name));
  }

  const totalRevenue = filteredOrders.reduce((sum, o) => {
    if (o.status !== 'Cancelled') return sum + Number(o.total_amount || 0);
    return sum;
  }, 0);
  const activeOrdersCount = filteredOrders.filter(o => o.status !== 'Shipped' && o.status !== 'Cancelled').length;
  const totalCustomers = filteredCustomers.length;
  const recentOrders = filteredOrders.slice(0, 5);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>Command Center</h2>
        
        <button 
          className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={20} /> Overview
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={20} /> Orders
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Coffee size={20} /> Products
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={20} /> Customers
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          <BookOpen size={20} /> Journal
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'promo' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo')}
        >
          <Tag size={20} /> Promo Codes
        </button>
        
        <button 
          className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} /> Settings
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={20} /> Bookings
        </button>

        <button 
          className={`admin-nav-item ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          <LifeBuoy size={20} /> Support Tickets
        </button>

        <button 
          className="admin-nav-item logout"
          onClick={() => { logout(); navigate('/'); }}
        >
          <LogOut size={20} /> Exit Admin
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Command Center Overview'}
            {activeTab === 'orders' && 'Live Orders'}
            {activeTab === 'support' && 'Customer Support Tickets'}
            {activeTab === 'bookings' && 'Reservation Requests'}
            {activeTab === 'products' && 'Product Catalog'}
            {activeTab === 'customers' && 'Customer Database'}
            {activeTab === 'promo' && 'Promo Code Engine'}
            {activeTab === 'settings' && 'Global Site Settings'}
          </h1>
          
          <div className="admin-glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#4ade80', marginTop: '5rem' }}>Loading Databases...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="admin-overview-tab">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.5rem' }}>Overview</h2>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="1w">Last 7 Days</option>
                    <option value="1m">Last 30 Days</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                <div className="admin-stat-grid">
                  <div className="admin-stat-card">
                    <div className="stat-icon revenue"><TrendingUp size={24} /></div>
                    <div className="stat-content">
                      <p>Total Revenue</p>
                      <h3>₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon orders"><Package size={24} /></div>
                    <div className="stat-content">
                      <p>Active Orders</p>
                      <h3>{activeOrdersCount}</h3>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon customers"><Users size={24} /></div>
                    <div className="stat-content">
                      <p>Total Customers</p>
                      <h3>{totalCustomers}</h3>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon alerts"><AlertTriangle size={24} /></div>
                    <div className="stat-content">
                      <p>Low Stock Alerts</p>
                      <h3 style={{ color: filteredLowStockProducts.length > 0 ? '#ef4444' : '#f8fafc' }}>{filteredLowStockProducts.length}</h3>
                    </div>
                  </div>
                </div>

                <div className="admin-overview-bottom">
                  <div className="admin-glass-panel recent-activity">
                    <h3 style={{ marginBottom: '1rem', color: '#f8fafc' }}>Recent Activity</h3>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length === 0 ? (
                          <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent orders.</td></tr>
                        ) : (
                          recentOrders.map(order => (
                            <tr key={order.id}>
                              <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{order.id.substring(0,8)}</td>
                              <td>{order.profiles?.full_name || 'Guest'}</td>
                              <td style={{ fontWeight: 'bold' }}>₹{order.total_amount}</td>
                              <td>
                                <span className={`status-badge ${order.status?.toLowerCase() === 'shipped' ? 'delivered' : 'processing'}`}>
                                  {order.status || 'Processing'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-glass-panel stock-alerts">
                    <h3 style={{ marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} color="#ef4444" /> Low Stock Items
                    </h3>
                    {filteredLowStockProducts.length === 0 ? (
                      <p style={{ color: '#94a3b8' }}>All products are fully stocked.</p>
                    ) : (
                      <div className="low-stock-list">
                        {filteredLowStockProducts.map(p => (
                          <div key={p._id} className="low-stock-item">
                            <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{p.name}</p>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>Out of Stock</p>
                            </div>
                            <button className="admin-btn" onClick={() => setActiveTab('products')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Update</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* JOURNAL TAB */}
            {activeTab === 'journal' && (
              <div className="admin-glass-panel">
                <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Create New Journal Post</h2>
                <form onSubmit={handleCreateJournalPost} className="admin-form" style={{ marginBottom: '2rem' }}>
                  <div className="admin-form-group">
                    <label>Post Title</label>
                    <input 
                      type="text" 
                      value={newJournalTitle} 
                      onChange={(e) => {
                        setNewJournalTitle(e.target.value);
                        setNewJournalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }} 
                      placeholder="e.g., The Art of Matcha"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>URL Slug</label>
                    <input 
                      type="text" 
                      value={newJournalSlug} 
                      onChange={(e) => setNewJournalSlug(e.target.value)} 
                      placeholder="e.g., the-art-of-matcha"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Short Excerpt</label>
                    <textarea 
                      value={newJournalExcerpt} 
                      onChange={(e) => setNewJournalExcerpt(e.target.value)} 
                      placeholder="A short summary for the blog card..."
                      rows={2}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Full Content</label>
                    <textarea 
                      value={newJournalContent} 
                      onChange={(e) => setNewJournalContent(e.target.value)} 
                      placeholder="Write your full article here..."
                      rows={10}
                      required
                    />
                  </div>
                  <button type="submit" className="admin-btn primary" disabled={isPublishingJournal} style={{ marginTop: '1rem' }}>
                    {isPublishingJournal ? 'Publishing...' : 'Publish Post to Website'}
                  </button>
                </form>

                <h3 style={{ color: '#f8fafc', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>Published Posts ({journalPosts.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Published At</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJournalPosts.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No journal posts found.</td></tr>
                      ) : (
                        filteredJournalPosts.map(post => (
                          <tr key={post._id} style={{ opacity: post.isHidden ? 0.5 : 1 }}>
                            {editingJournalId === post._id ? (
                              <td colSpan="6">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                  <input type="text" value={editJournalData.title} onChange={e => setEditJournalData({...editJournalData, title: e.target.value})} placeholder="Title" style={{ padding: '0.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid #4ade80', color: '#fff', borderRadius: '4px' }} />
                                  <input type="text" value={editJournalData.slug} onChange={e => setEditJournalData({...editJournalData, slug: e.target.value})} placeholder="Slug" style={{ padding: '0.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid #4ade80', color: '#fff', borderRadius: '4px' }} />
                                  <textarea value={editJournalData.excerpt} onChange={e => setEditJournalData({...editJournalData, excerpt: e.target.value})} placeholder="Excerpt" style={{ padding: '0.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid #4ade80', color: '#fff', borderRadius: '4px' }} rows={2} />
                                  <textarea value={editJournalData.content} onChange={e => setEditJournalData({...editJournalData, content: e.target.value})} placeholder="Content" style={{ padding: '0.5rem', background: 'rgba(15,23,42,0.8)', border: '1px solid #4ade80', color: '#fff', borderRadius: '4px' }} rows={5} />
                                  <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="admin-btn primary" onClick={() => handleUpdateJournalPost(post._id, editJournalData)}>Save</button>
                                    <button className="admin-btn" onClick={() => setEditingJournalId(null)}>Cancel</button>
                                  </div>
                                </div>
                              </td>
                            ) : (
                              <>
                                <td style={{ fontWeight: 'bold' }}>{post.title}</td>
                                <td style={{ color: '#94a3b8' }}>/journal/{post.slug}</td>
                                <td>{new Date(post.publishedAt).toLocaleDateString()}</td>
                                <td>
                                  <span className={`status-badge ${post.isHidden ? 'processing' : 'shipped'}`}>
                                    {post.isHidden ? 'HIDDEN' : 'PUBLIC'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="admin-btn" style={{ padding: '0.3rem 0.5rem' }} onClick={() => {
                                      setEditingJournalId(post._id);
                                      setEditJournalData({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content });
                                    }} title="Edit">
                                      <Edit2 size={16} />
                                    </button>
                                    <button className="admin-btn" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleToggleJournalVisibility(post._id, post.isHidden)} title={post.isHidden ? 'Publish' : 'Hide'}>
                                      {post.isHidden ? <Eye size={16} color="#94a3b8" /> : <EyeOff size={16} color="#ef4444" />}
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="admin-glass-panel admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Logistics Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders found.</td></tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{order.id.substring(0,8)}...</td>
                          <td>{order.profiles?.full_name || 'Guest'}</td>
                          <td style={{ fontWeight: 'bold' }}>₹{order.total_amount}</td>
                          <td>
                            <span className={`status-badge ${order.payment_status === 'paid' ? 'shipped' : 'processing'}`}>
                              {order.payment_status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${order.status?.toLowerCase() === 'shipped' ? 'delivered' : 'processing'}`}>
                              {order.status || 'Processing'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button 
                                className="admin-btn"
                                onClick={() => setSelectedOrderDetails(order)}
                              >
                                View Details
                              </button>
                              {order.status !== 'Shipped' && order.status !== 'Cancelled' && (
                                <button 
                                  className="admin-btn primary"
                                  onClick={() => updateOrderStatus(order.id, 'Shipped')}
                                >
                                  Mark Shipped
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrderDetails && (
              <div className="admin-modal-overlay" onClick={() => setSelectedOrderDetails(null)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
              }}>
                <div className="admin-modal-content admin-glass-panel" onClick={e => e.stopPropagation()} style={{
                  width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative'
                }}>
                  <button onClick={() => setSelectedOrderDetails(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                  
                  <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Order Details</h2>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.5rem', color: '#94a3b8' }}>ID: <span style={{ color: '#fff' }}>{selectedOrderDetails.id}</span></p>
                      <p style={{ margin: '0 0 0.5rem', color: '#94a3b8' }}>Date: <span style={{ color: '#fff' }}>{new Date(selectedOrderDetails.created_at).toLocaleString()}</span></p>
                      <p style={{ margin: '0 0 0.5rem', color: '#94a3b8' }}>Payment: <span style={{ color: '#fff' }}>{selectedOrderDetails.payment_method === 'cod' ? 'Cash On Delivery' : 'Prepaid (Razorpay)'}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 0.5rem', color: '#94a3b8' }}>Customer: <span style={{ color: '#fff' }}>{selectedOrderDetails.profiles?.full_name || 'Guest'}</span></p>
                      <p style={{ margin: '0 0 0.5rem', color: '#94a3b8' }}>Phone: <span style={{ color: '#fff' }}>{selectedOrderDetails.shipping_info?.phone || 'N/A'}</span></p>
                    </div>
                  </div>

                  <h3 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>Items</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0', color: '#94a3b8' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '0.5rem 0', color: '#94a3b8' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0', color: '#94a3b8' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items?.map((item, idx) => {
                        const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
                        const basePrice = item.price / (1 + gstRate);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.8rem 0', color: '#fff' }}>{item.name}</td>
                            <td style={{ padding: '0.8rem 0', textAlign: 'center', color: '#fff' }}>{item.quantity}</td>
                            <td style={{ padding: '0.8rem 0', textAlign: 'right', color: '#fff' }}>₹{Math.round(basePrice * item.quantity)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {(() => {
                    const subtotal = selectedOrderDetails.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                    
                    let baseSubtotal = 0;
                    let totalGst = 0;
                    selectedOrderDetails.items?.forEach(item => {
                      const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
                      const basePrice = item.price / (1 + gstRate);
                      const gstAmt = item.price - basePrice;
                      baseSubtotal += basePrice * item.quantity;
                      totalGst += gstAmt * item.quantity;
                    });
                    
                    const shippingCost = selectedOrderDetails.shipping_info?.shipping_cost !== undefined 
                      ? selectedOrderDetails.shipping_info.shipping_cost 
                      : Math.max(0, selectedOrderDetails.total_amount - subtotal);
                    const discountAmount = selectedOrderDetails.shipping_info?.discount_amount || 0;
                    
                    return (
                      <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                          Subtotal: ₹{Math.round(baseSubtotal)}
                        </div>
                        {totalGst > 0 && (
                          <>
                            <div style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                              CGST: ₹{(totalGst / 2).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                              SGST: ₹{(totalGst / 2).toFixed(2)}
                            </div>
                          </>
                        )}
                        {discountAmount > 0 && (
                          <div style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '0.2rem' }}>
                            Discount: -₹{discountAmount}
                          </div>
                        )}
                        <div style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                          Delivery Cost: ₹{Math.round(shippingCost)}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
                          Total Amount: ₹{selectedOrderDetails.total_amount}
                        </div>
                      </div>
                    );
                  })()}
                  <h3 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '1.1rem' }}>Shipping Address</h3>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                    {selectedOrderDetails.shipping_info ? (
                      <>
                        <p style={{ margin: '0 0 0.3rem', color: '#fff' }}>{selectedOrderDetails.shipping_info.firstName} {selectedOrderDetails.shipping_info.lastName}</p>
                        <p style={{ margin: '0 0 0.3rem' }}>{selectedOrderDetails.shipping_info.address}</p>
                        <p style={{ margin: '0 0 0.3rem' }}>{selectedOrderDetails.shipping_info.city}, {selectedOrderDetails.shipping_info.state} - {selectedOrderDetails.shipping_info.pinCode}</p>
                        {selectedOrderDetails.shipping_info.phone && (
                          <p style={{ margin: '0' }}>Phone: {selectedOrderDetails.shipping_info.phone}</p>
                        )}
                      </>
                    ) : 'No shipping info provided.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
                    {selectedOrderDetails.status !== 'Cancelled' && (
                      <button 
                        className="admin-btn"
                        style={{ backgroundColor: 'transparent', color: '#ef4444', borderColor: '#ef4444' }}
                        onClick={() => {
                          if (window.confirm('Are you absolute sure you want to cancel this order? This cannot be undone.')) {
                            cancelOrder(selectedOrderDetails.id);
                            setSelectedOrderDetails(null);
                          }
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                    <button className="admin-btn" onClick={() => setSelectedOrderDetails(null)}>Close</button>
                    <button className="admin-btn primary" onClick={() => {
                      const printContent = `
                        <html>
                          <head>
                            <title>Print KOT - ${selectedOrderDetails.id}</title>
                            <style>
                              body { font-family: monospace; color: #000; background: #fff; margin: 0; padding: 20px; }
                              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                              .header h2 { margin: 0; }
                              .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
                              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                              th, td { padding: 8px 0; border-bottom: 1px dotted #000; text-align: left; }
                              th { border-bottom: 1px solid #000; }
                              .right { text-align: right; }
                              .total { font-weight: bold; font-size: 1.2em; text-align: right; border-top: 2px dashed #000; padding-top: 10px; margin-top: 20px; }
                              .address { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 0.9em; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h2>BUDDIES CAFE KOT</h2>
                              <div>Order: ${selectedOrderDetails.id}</div>
                            </div>
                            <div class="meta">
                              <div>Date: ${new Date(selectedOrderDetails.created_at).toLocaleString()}</div>
                              <div>Type: ${selectedOrderDetails.payment_method === 'cod' ? 'COD' : 'PREPAID'}</div>
                            </div>
                            <table>
                              <thead>
                                <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th></tr>
                              </thead>
                              <tbody>
                                ${selectedOrderDetails.items?.map(item => {
                                  const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
                                  const basePrice = item.price / (1 + gstRate);
                                  return `<tr><td>${item.name}</td><td class="right">${item.quantity}</td><td class="right">Rs.${Math.round(basePrice * item.quantity)}</td></tr>`;
                                }).join('')}
                              </tbody>
                            </table>
                            ${(() => {
                              const subtotal = selectedOrderDetails.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                              let baseSubtotal = 0;
                              let totalGst = 0;
                              selectedOrderDetails.items?.forEach(item => {
                                const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
                                const basePrice = item.price / (1 + gstRate);
                                const gstAmt = item.price - basePrice;
                                baseSubtotal += basePrice * item.quantity;
                                totalGst += gstAmt * item.quantity;
                              });
                              const shippingCost = selectedOrderDetails.shipping_info?.shipping_cost !== undefined 
                                ? selectedOrderDetails.shipping_info.shipping_cost 
                                : Math.max(0, selectedOrderDetails.total_amount - subtotal);
                              const discountAmount = selectedOrderDetails.shipping_info?.discount_amount || 0;
                              
                              let extraRows = '';
                              extraRows += `<div style="text-align: right; padding-top: 5px; font-size: 0.9em; color: #333;">Subtotal: Rs.${Math.round(baseSubtotal)}</div>`;
                              if (totalGst > 0) {
                                extraRows += `<div style="text-align: right; padding-top: 5px; font-size: 0.9em; color: #333;">CGST: Rs.${(totalGst / 2).toFixed(2)}</div>`;
                                extraRows += `<div style="text-align: right; padding-top: 5px; font-size: 0.9em; color: #333;">SGST: Rs.${(totalGst / 2).toFixed(2)}</div>`;
                              }
                              if (discountAmount > 0) {
                                extraRows += `<div style="text-align: right; padding-top: 5px; font-size: 0.9em; color: #333;">Discount: -Rs.${discountAmount}</div>`;
                              }
                              extraRows += `<div style="text-align: right; padding-top: 5px; padding-bottom: 5px; font-size: 0.9em; color: #333;">Delivery Cost: Rs.${Math.round(shippingCost)}</div>`;
                              return extraRows;
                            })()}
                            <div class="total">Total: Rs.${selectedOrderDetails.total_amount}</div>
                            <div class="address">
                              <strong>Shipping Address:</strong><br/>
                              ${selectedOrderDetails.shipping_info ? `
                                ${selectedOrderDetails.shipping_info.firstName} ${selectedOrderDetails.shipping_info.lastName}<br/>
                                ${selectedOrderDetails.shipping_info.address}, ${selectedOrderDetails.shipping_info.city}, ${selectedOrderDetails.shipping_info.state} - ${selectedOrderDetails.shipping_info.pinCode}<br/>
                                Phone: ${selectedOrderDetails.shipping_info.phone || 'N/A'}
                              ` : 'N/A'}
                            </div>
                          </body>
                        </html>
                      `;

                      const iframe = document.createElement('iframe');
                      iframe.style.position = 'fixed';
                      iframe.style.right = '0';
                      iframe.style.bottom = '0';
                      iframe.style.width = '0';
                      iframe.style.height = '0';
                      iframe.style.border = '0';
                      document.body.appendChild(iframe);

                      const doc = iframe.contentWindow.document;
                      doc.open();
                      doc.write(printContent);
                      doc.close();

                      iframe.contentWindow.focus();
                      setTimeout(() => {
                        iframe.contentWindow.print();
                        setTimeout(() => {
                          if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                          }
                        }, 1000);
                      }, 250);
                    }}>
                      🖨️ Print KOT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="admin-glass-panel admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Order ID</th>
                      <th>Issue Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupportTickets.map(ticket => (
                      <React.Fragment key={ticket.id}>
                        <tr>
                          <td style={{ fontFamily: 'monospace' }}>{ticket.id.substring(0,8)}</td>
                          <td>
                            <div>{ticket.profiles?.full_name || 'Guest'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ticket.profiles?.email}</div>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{ticket.order_id.substring(0,8)}</td>
                          <td>
                            <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{ticket.issue_type}</span>
                          </td>
                          <td>
                            <span className={`status ${ticket.status?.toLowerCase() === 'resolved' ? 'delivered' : ticket.status?.toLowerCase() === 'investigating' ? 'processing' : 'pending'}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={ticket.status}
                              onChange={(e) => handleSupportTicketUpdate(ticket.id, e.target.value)}
                              style={{ padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Investigating">Investigating</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>MESSAGE</strong>
                                <p style={{ marginTop: '0.5rem', color: '#e2e8f0' }}>{ticket.message}</p>
                              </div>
                              {ticket.image_url && (
                                <div style={{ minWidth: '200px' }}>
                                  <strong style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>ATTACHMENT</strong>
                                  <a href={ticket.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', textDecoration: 'none', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                                    <ExternalLink size={16} /> View Image
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    {filteredSupportTickets.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No support tickets found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="admin-glass-panel admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date / Time</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>No booking requests found.</td></tr>
                    ) : (
                      filteredBookings.map(booking => (
                        <tr key={booking.id}>
                          <td style={{ fontWeight: 'bold' }}>
                            {new Date(booking.date).toLocaleDateString()} <br/>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{booking.time}</span>
                          </td>
                          <td>
                            {booking.full_name} <br/>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Guests: {booking.guests}</span>
                          </td>
                          <td style={{ fontSize: '0.9rem' }}>
                            {booking.email} <br/>
                            {booking.phone}
                          </td>
                          <td>
                            {booking.experience_type === 'tasting' ? 'Private Tasting' : 'Cafe Table'}
                            {booking.special_requests && (
                              <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.3rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.special_requests}>
                                📝 {booking.special_requests}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${booking.status === 'confirmed' ? 'shipped' : booking.status === 'cancelled' ? 'processing' : 'processing'}`} style={booking.status === 'cancelled' ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444' } : {}}>
                              {booking.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {booking.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="admin-btn primary"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                                >
                                  Confirm
                                </button>
                                <button 
                                  className="admin-btn"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (() => {
              const rawCategories = Array.from(new Set(products.map(p => p.subcategory || 'Tea').filter(Boolean)));
              const sortedCategories = rawCategories.sort((a, b) => {
                const aIsBrand = a.toUpperCase().startsWith('BRAND') || a.toUpperCase().startsWith('SMALL GROWERS') || a.toUpperCase().startsWith('SILVERMIST');
                const bIsBrand = b.toUpperCase().startsWith('BRAND') || b.toUpperCase().startsWith('SMALL GROWERS') || b.toUpperCase().startsWith('SILVERMIST');
                if (aIsBrand && !bIsBrand) return 1;
                if (!aIsBrand && bIsBrand) return -1;
                return a.localeCompare(b);
              });
              const dynamicCategories = ['All Teas', ...sortedCategories];
              let filteredProducts = activeProductCategory === 'All Teas' 
                ? products 
                : products.filter(p => (p.subcategory || 'Tea') === activeProductCategory);

              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filteredProducts = filteredProducts.filter(p => p?.name?.toLowerCase()?.includes(q) || p?.subcategory?.toLowerCase()?.includes(q));
              }

              return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="admin-category-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {dynamicCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveProductCategory(cat)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        background: activeProductCategory === cat ? 'var(--color-accent-matcha, #7C9A5E)' : 'rgba(245,245,220,0.05)',
                        color: activeProductCategory === cat ? '#0f172a' : '#94a3b8',
                        border: '1px solid',
                        borderColor: activeProductCategory === cat ? 'var(--color-accent-matcha, #7C9A5E)' : 'rgba(245,245,220,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="admin-products-grid">
                  {filteredProducts.map(product => (
                    <div className="admin-product-card" key={product._id}>
                      <img src={product.imageUrl || '/assets/hero_4k.png'} alt={product.name} className="admin-product-img" />
                    <div className="admin-product-info">
                      <h3>{product.name}</h3>
                      
                      {editingProductId === product._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#94a3b8' }}>₹</span>
                            <input 
                              type="number" 
                              value={editPrice} 
                              onChange={(e) => setEditPrice(e.target.value)}
                              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #4ade80', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', width: '100px' }}>Custom Weights</span>
                            <input 
                              type="text" 
                              value={editCustomWeights} 
                              onChange={(e) => setEditCustomWeights(e.target.value)}
                              placeholder="e.g., 500, 1000, 2000"
                              style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #4ade80', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem' }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.9rem', cursor: 'pointer', flex: 1 }}>
                              <span style={{ color: '#94a3b8' }}>Qty</span>
                              <input 
                                type="number" 
                                value={editStockQuantity} 
                                onChange={(e) => setEditStockQuantity(e.target.value)}
                                style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #4ade80', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                              />
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.9rem', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editStock} 
                                onChange={(e) => setEditStock(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#4ade80' }}
                              />
                              In Stock
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button className="admin-btn primary" style={{ flex: 1 }} onClick={() => handleSaveProduct(product._id)}>Save</button>
                            <button className="admin-btn" style={{ flex: 1 }} onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#4ade80', fontWeight: '600', fontSize: '1.2rem', margin: 0 }}>₹{product.price}</p>
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: product.inStock !== false ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: product.inStock !== false ? '#4ade80' : '#ef4444' }}>
                              {product.inStock !== false ? `In Stock (${product.stock || 0})` : 'Out of Stock'}
                            </span>
                          </div>
                          <button className="admin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => handleEditClick(product)}>
                            <Edit2 size={16} /> Quick Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              );
            })()}

            {/* CUSTOMERS TAB */}
            {activeTab === 'customers' && (
              <div className="admin-glass-panel admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Contact Info</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No customers found.</td></tr>
                    ) : (
                      filteredCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{customer.id.substring(0,8)}...</td>
                          <td style={{ fontWeight: 'bold', color: '#fff' }}>{customer.user_metadata?.full_name || 'Anonymous User'}</td>
                          <td style={{ fontSize: '0.9rem' }}>
                            {customer.email} <br/>
                            {customer.user_metadata?.phone && <span style={{ color: '#94a3b8' }}>{customer.user_metadata.phone}</span>}
                          </td>
                          <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PROMO TAB */}
            {activeTab === 'promo' && (
              <div className="admin-promo-tab">
                <div className="admin-glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                  <h2 style={{ marginBottom: '1.5rem', color: '#f8fafc' }}>Create New Promo Code</h2>
                  <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Code (e.g., DIWALI20)</label>
                        <input 
                          type="text" 
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem', textTransform: 'uppercase' }}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Type</label>
                        <select
                          value={newCouponType}
                          onChange={(e) => setNewCouponType(e.target.value)}
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.1rem' }}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat_discount">Flat Discount (₹)</option>
                          <option value="free_shipping">Free Shipping</option>
                        </select>
                      </div>
                      {newCouponType !== 'free_shipping' && (
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Value/Amount</label>
                          <input 
                            type="number" 
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                            placeholder={newCouponType === 'percentage' ? "20" : "150"}
                            min="1"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem' }}
                            required={newCouponType !== 'free_shipping'}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Min Cart Value (Optional)</label>
                        <input 
                          type="number" 
                          value={newCouponMinCart}
                          onChange={(e) => setNewCouponMinCart(e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Usage Limit (Optional)</label>
                        <input 
                          type="number" 
                          value={newCouponUsageLimit}
                          onChange={(e) => setNewCouponUsageLimit(e.target.value)}
                          placeholder="Unlimited"
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem' }}
                        />
                      </div>
                      <button type="submit" className="admin-btn primary" style={{ padding: '0.8rem 2rem', height: '100%', flex: 1 }}>Create Code</button>
                    </div>
                  </form>
                </div>

                <div className="admin-glass-panel admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Promo Code</th>
                        <th>Type & Value</th>
                        <th>Limits & Uses</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoupons.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No promo codes found.</td></tr>
                      ) : (
                        filteredCoupons.map(coupon => (
                          <tr key={coupon.id}>
                            <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', letterSpacing: '1px' }}>{coupon.code}</td>
                            <td style={{ color: '#4ade80', fontWeight: 'bold' }}>
                              {coupon.type === 'free_shipping' ? 'Free Shipping' : (coupon.type === 'flat_discount' ? `₹${coupon.discount_percent} OFF` : `${coupon.discount_percent}% OFF`)}
                            </td>
                            <td style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                              Min: {coupon.min_cart_value > 0 ? `₹${coupon.min_cart_value}` : 'None'}<br/>
                              Uses: {coupon.times_used || 0} / {coupon.usage_limit || '∞'}
                            </td>
                            <td>
                              <span className={`status-badge ${coupon.is_active ? 'delivered' : 'cancelled'}`}>
                                {coupon.is_active ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </td>
                            <td>{new Date(coupon.created_at).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="admin-btn"
                                  onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                                >
                                  {coupon.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button 
                                  className="admin-btn"
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="admin-settings-tab">
                <div className="admin-glass-panel" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
                  <h2 style={{ marginBottom: '2rem', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>General Configuration</h2>
                  
                  <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: '500' }}>Store Support Email</label>
                      <input 
                        type="email" 
                        value={settings.store_email}
                        onChange={(e) => setSettings({...settings, store_email: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: '500' }}>Store Phone Number</label>
                      <input 
                        type="text" 
                        value={settings.store_phone}
                        onChange={(e) => setSettings({...settings, store_phone: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: '500' }}>Flat Rate Shipping (₹)</label>
                      <input 
                        type="number" 
                        value={settings.shipping_flat_rate}
                        onChange={(e) => setSettings({...settings, shipping_flat_rate: Number(e.target.value)})}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }}
                        required
                      />
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>This is the fallback shipping rate if live calculation fails.</p>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: '500' }}>Store Announcement Banner</label>
                      <textarea 
                        value={settings.announcement_text}
                        onChange={(e) => setSettings({...settings, announcement_text: e.target.value})}
                        rows="3"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem', resize: 'vertical' }}
                      />
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>This text appears at the very top of the website (e.g., "Free Shipping over ₹1000!"). Leave blank to hide.</p>
                    </div>

                    <div className="form-group" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={settings.maintenance_mode || false}
                          onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                          style={{ width: '20px', height: '20px', accentColor: '#ef4444' }}
                        />
                        <div>
                          <span style={{ display: 'block', color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>Maintenance Mode</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>If enabled, the website will display a "Back Soon" screen and block all user actions.</span>
                        </div>
                      </label>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontWeight: '500' }}>Bulk Weight Quick Select Options (in grams)</label>
                      <input 
                        type="text" 
                        value={settings.bulk_weight_options || ''}
                        onChange={(e) => setSettings({...settings, bulk_weight_options: e.target.value})}
                        placeholder="e.g., 500, 1000, 2000"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1rem' }}
                        required
                      />
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Comma separated list of weights in grams. E.g. "50, 100, 150, 200, 250" (will appear as 50gms, 100gms etc. on product pages).</p>
                    </div>

                    <button type="submit" className="admin-btn primary" style={{ marginTop: '1rem', width: '100%' }} disabled={isSavingSettings}>
                      {isSavingSettings ? 'Saving...' : 'Save All Settings'}
                    </button>
                  </form>

                  <div className="admin-danger-zone" style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid #333', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Database Backups & Export</h3>
                    <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Download your store data for accounting or backup purposes.</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button" onClick={handleExportCSV} className="admin-btn">
                        Download Orders (CSV)
                      </button>
                      <button type="button" onClick={handleExportSQL} className="admin-btn">
                        Download Full DB (SQL)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
