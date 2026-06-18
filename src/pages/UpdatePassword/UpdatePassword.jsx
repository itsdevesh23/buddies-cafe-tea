import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useAuth } from '../../context/AuthContext';
import '../Account/AccountPage.css'; // Reusing account styles

const UpdatePassword = () => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    
    if (password.length < 6) {
      setStatusMessage('Password must be at least 6 characters.');
      return;
    }

    const result = await updatePassword(password);
    setStatusMessage(result.message);
    
    if (result.success) {
      setTimeout(() => {
        navigate('/account');
      }, 2000);
    }
  };

  return (
    <PageTransition>
      <div className="account-page auth-container">
        <div className="auth-wrapper glass-panel">
          <form className="auth-form" onSubmit={handleUpdate}>
            <h2 className="auth-title">Update Password</h2>
            <p className="auth-subtitle">Enter your new secure password below.</p>
            
            {statusMessage && (
              <div className="auth-status-message" style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {statusMessage}
              </div>
            )}
            
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            
            <button type="submit" className="btn-primary auth-submit">
              Save New Password
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default UpdatePassword;
