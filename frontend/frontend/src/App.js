// Location: frontend/frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { Navbar, Hero, ProductUpload, Marketplace, DashboardView } from './pages/PageSections';

function App() {
  const [currentTab, setTab] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // યુઝરના રોલ ચેક કરવા માટે શોર્ટકટ (Artisan = Seller, Customer = Buyer)
  const isSeller = user && user.role === 'artisan';
  const isBuyer = user && user.role === 'customer';

  // બ્રાઉઝરમાંથી ડેટા સિંક કરવા માટે
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [currentTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setTab('home');
    alert('Logged out successfully!');
  };

  const renderScreenView = () => {
    switch (currentTab) {
      case 'home':
        return <Hero setTab={setTab} />;
      case 'marketplace':
        return <Marketplace />;
      case 'dashboard':
        // જો સેલર હોય તો જ ડેશબોર્ડ દેખાય, નહીંતર હોમ પેજ પર મોકલી દે
        return token && isSeller ? <DashboardView /> : <Hero setTab={setTab} />;
      case 'upload':
        // જો સેલર હોય તો જ અપલોડ પેજ દેખાય
        return token && isSeller ? <ProductUpload token={token} /> : <Hero setTab={setTab} />;
      case 'login':
        return <LoginView setTab={setTab} setToken={setToken} setUser={setUser} />;
      case 'register':
        return <RegisterView setTab={setTab} />;
      default:
        return <Hero setTab={setTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF8F0', margin: 0, fontFamily: 'sans-serif' }}>
      
      {/* નેવિગેશન બાર */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E7D32', cursor: 'pointer' }} onClick={() => setTab('home')}>
          ArtisanAI
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ ...styles.navLink, color: currentTab === 'home' ? '#2E7D32' : '#555' }} onClick={() => setTab('home')}>Home</button>
          <button style={{ ...styles.navLink, color: currentTab === 'marketplace' ? '#2E7D32' : '#555' }} onClick={() => setTab('marketplace')}>Marketplace</button>
          
          {/* જો લોગિન હોય અને સેલર (Artisan) હોય તો જ આ મેનુ બતાવવાના */}
          {token && isSeller && (
            <>
              <button style={{ ...styles.navLink, color: currentTab === 'dashboard' ? '#2E7D32' : '#555' }} onClick={() => setTab('dashboard')}>Dashboard</button>
              <button style={{ ...styles.navLink, color: currentTab === 'upload' ? '#2E7D32' : '#555' }} onClick={() => setTab('upload')}>Upload</button>
            </>
          )}

          {token ? (
            <>
              <span style={{ fontWeight: 'bold', color: '#2E7D32', marginLeft: '10px' }}>
                Hi, {user?.name}! <span style={{ fontSize: '12px', color: '#777', fontWeight: 'normal' }}>({user?.role})</span>
              </span>
              <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={styles.loginNavBtn} onClick={() => setTab('login')}>Login</button>
              <button style={styles.registerNavBtn} onClick={() => setTab('register')}>Register</button>
            </>
          )}
        </div>
      </div>

      {renderScreenView()}
    </div>
  );
}

// ==========================================
// LOGIN VIEW COMPONENT
// ==========================================
const LoginView = ({ setTab, setToken, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        alert(`Welcome back, ${data.user.name}!`);
        setTab('home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to backend server');
    }
  };

  return (
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '20px' }}>Login to ArtisanAI</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <label style={styles.label}>Email Address</label>
        <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label style={styles.label}>Password</label>
        <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit" style={styles.submitBtn}>Login</button>
        <p style={{ textAlign: 'center', marginTop: '15px', color: '#555' }}>
          New artisan? <span style={{ color: '#2E7D32', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setTab('register')}>Register Here</span>
        </p>
      </form>
    </div>
  );
};

// ==========================================
// REGISTER VIEW COMPONENT
// ==========================================
const RegisterView = ({ setTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('artisan');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Registration Successful! Please log in now.');
        setTab('login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to backend server');
    }
  };

  return (
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '20px' }}>Create Account</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <label style={styles.label}>Full Name</label>
        <input type="text" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />

        <label style={styles.label}>Email Address</label>
        <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label style={styles.label}>Password</label>
        <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <label style={styles.label}>Account Type (રોલ)</label>
        <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="artisan">Artisan (માલ વેચનાર/સેલર)</option>
          <option value="customer">Customer (માલ ખરીદનાર/ગ્રાહક)</option>
        </select>

        <button type="submit" style={styles.submitBtn}>Register</button>
        <p style={{ textAlign: 'center', marginTop: '15px', color: '#555' }}>
          Already have an account? <span style={{ color: '#2E7D32', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setTab('login')}>Login Here</span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  navLink: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '500', cursor: 'pointer', padding: '5px 10px' },
  logoutBtn: { backgroundColor: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  loginNavBtn: { background: 'none', border: '1px solid #2E7D32', color: '#2E7D32', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  registerNavBtn: { backgroundColor: '#2E7D32', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  formContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', backgroundColor: '#2E7D32', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  errorText: { color: '#d32f2f', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px', textAlign: 'center', margin: '0 0 15px 0' }
};

export default App;