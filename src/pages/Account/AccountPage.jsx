import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Truck, AlertCircle, X, Upload } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { supabase } from '../../lib/supabase';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './AccountPage.css';

const AccountPage = () => {
  const { user, login, logout, signup, resetPassword } = useAuth() || { 
    user: null, 
    login: () => {}, 
    logout: () => {}, 
    signup: () => {},
    resetPassword: () => {}
  };
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'profile';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  
  // Orders State
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Support Tickets State
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [issueType, setIssueType] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [issueImage, setIssueImage] = useState(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const handleOpenSupport = (orderId) => {
    setSelectedOrderId(orderId);
    setIssueType('');
    setIssueMessage('');
    setIssueImage(null);
    setSupportModalOpen(true);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!issueType || !issueMessage) return toast.error('Please fill in all required fields');
    
    setIsSubmittingIssue(true);
    let imageUrl = null;

    try {
      if (issueImage) {
        // File Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(issueImage.type)) {
          toast.error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.');
          setIsLoading(false);
          return;
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (issueImage.size > maxSize) {
          toast.error('Image size must be less than 5MB.');
          setIsLoading(false);
          return;
        }

        const fileExt = issueImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('support_images')
          .upload(fileName, issueImage);
          
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('support_images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/support-tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          issueType,
          message: issueMessage,
          imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Your issue has been reported. We will contact you soon.');
        setSupportModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to submit issue');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while uploading image or submitting');
    } finally {
      setIsSubmittingIssue(false);
    }
  };
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    if (isForgotPassword) {
      const result = await resetPassword(email);
      setStatusMessage(result.message);
      return;
    }
    
    if (isLogin) {
      const result = await login(email, password);
      if (result && !result.success) {
        setStatusMessage(result.message);
      }
    } else {
      const result = await signup(name, email, password, phone);
      if (result && !result.success) {
        setStatusMessage(result.message);
      } else if (result && result.success) {
        setStatusMessage(result.message + " If you don't see the dashboard, please check your email to verify your account.");
      }
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setMyOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) return toast.error('Please enter your password to confirm');
    
    setIsDeleting(true);
    try {
      // Step 1: Verify password via Supabase Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword
      });

      if (signInError) {
        toast.error('Incorrect password');
        setIsDeleting(false);
        return;
      }

      // Step 2: Call our secure backend to delete the account and anonymize orders
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success('Your account has been successfully deleted.');
        logout(); // Logs them out and redirects
      } else {
        toast.error(result.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const { items: wishlistItems, toggleWishlist } = useWishlist();

  if (!user) {
    return (
      <PageTransition>
        <div className="account-page auth-container">
          <div className="auth-wrapper glass-panel">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${isLogin && !isForgotPassword ? 'active' : ''}`} 
                onClick={() => { setIsLogin(true); setIsForgotPassword(false); setStatusMessage(''); }}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${!isLogin && !isForgotPassword ? 'active' : ''}`} 
                onClick={() => { setIsLogin(false); setIsForgotPassword(false); setStatusMessage(''); }}
              >
                Register
              </button>
            </div>
            
            <form className="auth-form" onSubmit={handleAuth}>
              <h2 className="auth-title">
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-subtitle">
                {isForgotPassword 
                  ? 'Enter your email to receive a password reset link.' 
                  : isLogin ? 'Enter your details to access your account.' : 'Join Buddies Cafe for exclusive benefits.'}
              </p>
              
              {statusMessage && (
                <div className="auth-status-message" style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                  {statusMessage}
                </div>
              )}
              
              {!isLogin && !isForgotPassword && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" required />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              
              {!isForgotPassword && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              )}
              
              {isLogin && !isForgotPassword && (
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setStatusMessage(''); }}>
                  Forgot Password?
                </a>
              )}
              
              {isForgotPassword && (
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setStatusMessage(''); }}>
                  Back to Login
                </a>
              )}
              
              <button type="submit" className="btn-primary auth-submit">
                {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="account-page dashboard-container">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar glass-panel">
            <div className="user-info">
              <div className="user-avatar">
                <User size={32} />
              </div>
              <h3>{user?.user_metadata?.full_name || 'Valued Guest'}</h3>
              <p>{user.email || 'guest@buddiescafe.com'}</p>
            </div>
            
            <nav className="dashboard-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                <span>Orders</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={20} />
                <span>Wishlist</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
              <button onClick={logout} className="nav-item logout">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>
          
          <main className="dashboard-main glass-panel">
            <h2 className="dashboard-title">
              {activeTab === 'profile' && `Welcome back, ${user?.user_metadata?.full_name || 'Valued Guest'}`}
              {activeTab === 'orders' && 'Your Order History'}
              {activeTab === 'wishlist' && 'Your Wishlist'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
            
            {(activeTab === 'profile' || activeTab === 'orders') && (
              <section className="dashboard-section">
                {activeTab === 'profile' && (
                  <div className="section-header">
                    <h3>Recent Orders</h3>
                    <button className="view-all" onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                
                <div className="orders-table-wrapper">
                {loadingOrders ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Fetching your orders...</p>
                ) : myOrders.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <Package size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
                    <a href="/shop" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.6rem 1.5rem' }}>Explore Teas</a>
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontFamily: 'monospace' }}>{order.id.substring(0,8)}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td style={{ maxWidth: '200px' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </td>
                          <td style={{ fontWeight: 'bold' }}>₹{order.total_amount}</td>
                          <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{order.payment_status?.toUpperCase() || 'PAID'}</span></td>
                          <td>
                            <span className={`status ${order.status?.toLowerCase() === 'shipped' ? 'delivered' : 'processing'}`}>
                              {order.status || 'Processing'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <Link to={`/track-order?id=${order.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#4ade80', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                <Truck size={14} /> Track
                              </Link>
                              {order.status?.toLowerCase() === 'delivered' && (
                                <button 
                                  onClick={() => handleOpenSupport(order.id)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <AlertCircle size={14} /> Report Issue
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
            )}

            {activeTab === 'wishlist' && (
              <section className="dashboard-section">
                {wishlistItems.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <Heart size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Your wishlist is empty.</p>
                    <Link to="/shop" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.6rem 1.5rem' }}>Discover Teas</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {wishlistItems.map(item => (
                      <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                        <button 
                          onClick={() => toggleWishlist(item)} 
                          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                        <h4 style={{ color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{item.name}</h4>
                        <p style={{ color: '#4ade80', fontWeight: 'bold' }}>₹{item.price}</p>
                        <Link to={`/product/${item.slug}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', padding: '0.4rem', fontSize: '0.9rem' }}>View Tea</Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="dashboard-section">
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: '#f8fafc' }}>Account Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Email Address</label>
                      <p style={{ color: '#e2e8f0', fontSize: '1.1rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{user.email}</p>
                    </div>
                    
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Phone Number</label>
                      <p style={{ color: '#e2e8f0', fontSize: '1.1rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {user.user_metadata?.phone || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not provided</span>}
                      </p>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <Link to="/update-password" style={{ color: '#4ade80', textDecoration: 'none' }}>Change Password</Link>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2rem', borderRadius: '12px', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
                      <div>
                        <label style={{ color: '#ef4444', fontSize: '0.85rem' }}>Enter password to confirm:</label>
                        <input 
                          type="password" 
                          value={deletePassword} 
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#fff', marginTop: '0.5rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          type="button" 
                          onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                          style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #94a3b8', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isDeleting}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', flex: 1, opacity: isDeleting ? 0.7 : 1 }}
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Support Ticket Modal */}
        {supportModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel" 
              style={{ padding: '2rem', maxWidth: '500px', width: '90%', position: 'relative' }}
            >
              <button 
                onClick={() => setSupportModalOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle /> Report an Issue
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                We're sorry you had an issue with your order. Please let us know what happened and we will make it right.
              </p>
              
              <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Issue Type *</label>
                  <select 
                    value={issueType} 
                    onChange={e => setIssueType(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', outline: 'none' }}
                  >
                    <option value="" disabled>Select an issue type</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Missing Item">Missing Item</option>
                    <option value="Quality Concern">Quality Concern</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    value={issueMessage}
                    onChange={e => setIssueMessage(e.target.value)}
                    required
                    rows="4"
                    placeholder="Please describe the issue in detail..."
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Attach Image (Optional)</label>
                  <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                    <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                      <Upload size={18} /> {issueImage ? issueImage.name : 'Upload Photo'}
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setIssueImage(e.target.files[0])}
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmittingIssue}
                  className="btn-primary"
                  style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {isSubmittingIssue ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Submit Complaint'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default AccountPage;
