// Location: frontend/frontend/src/pages/PageSections.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { theme } from '../theme';

// ==========================================
// 1. NAVIGATION BAR (WITH ACTIVE SEARCH)
// ==========================================
export function Navbar({ currentTab, setTab, searchQuery, setSearchQuery }) {
  const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: theme.colors.card, boxShadow: theme.shadows.soft, position: 'sticky', top: 0, zIndex: 1000, fontFamily: theme.fonts.body },
    logo: { fontFamily: theme.fonts.heading, fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, cursor: 'pointer' },
    links: { display: 'flex', gap: '24px', listStyle: 'none' },
    link: (active) => ({ cursor: 'pointer', fontWeight: active ? '700' : '500', color: active ? theme.colors.primary : theme.colors.text, borderBottom: active ? `2px solid ${theme.colors.primary}` : '2px solid transparent', paddingBottom: '4px' }),
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    search: { padding: '8px 16px', borderRadius: '20px', border: `1px solid ${theme.colors.border}`, outline: 'none', background: theme.colors.background },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: theme.colors.secondary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => setTab('home')}>ArtisanAI</div>
      <ul style={styles.links}>
        {['home', 'marketplace', 'dashboard', 'upload'].map((tab) => (
          <li key={tab} style={styles.link(currentTab === tab)} onClick={() => setTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </li>
        ))}
      </ul>
      <div style={styles.right}>
        {/* 🔍 સર્ચ ઇનપુટ બોક્સ: યુઝર લખશે એટલે ઓટોમેટિક માર્કેટપ્લેસ ટેબ ખુલી જશે */}
        <input 
          type="text" 
          placeholder="Search crafts..." 
          style={styles.search} 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (currentTab !== 'marketplace') setTab('marketplace');
          }}
        />
        <div style={styles.avatar}>A</div>
      </div>
    </nav>
  );
}

// ==========================================
// 2. HERO SECTION (CLEAN & PREMIUM - NO CLAYPOT CARD)
// ==========================================
export function Hero({ setTab }) {
  const styles = {
    hero: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', minHeight: '75vh', background: theme.colors.background, fontFamily: theme.fonts.body },
    left: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', textAlign: 'center' },
    title: { fontFamily: theme.fonts.heading, fontSize: '54px', color: theme.colors.text, lineHeight: '1.2', margin: '0' },
    desc: { fontSize: '20px', color: theme.colors.textLight, lineHeight: '1.6', margin: '0' },
    btnGroup: { display: 'flex', gap: '16px', justifyContent: 'center' },
    primaryBtn: { padding: '14px 32px', background: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.radius, fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    secondaryBtn: { padding: '14px 32px', background: 'transparent', color: theme.colors.text, border: `2px solid ${theme.colors.text}`, borderRadius: theme.radius, fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    badges: { display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginTop: '20px' },
    badge: { display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.primary, fontWeight: '600', fontSize: '16px' }
  };

  return (
    <section style={styles.hero}>
      <div style={styles.left}>
        <h1 style={styles.title}>AI-Powered Marketplace for Local Artisans</h1>
        <p style={styles.desc}>Empowering artisans to create professional product listings using AI, connect with buyers worldwide, preserve cultural heritage, and grow their business through smart digital tools.</p>
        <div style={styles.btnGroup}>
          <button style={styles.primaryBtn} onClick={() => setTab('upload')}>Start Selling</button>
          <button style={styles.secondaryBtn} onClick={() => setTab('marketplace')}>Explore Marketplace</button>
        </div>
        <div style={styles.badges}>
          <div style={styles.badge}>✓ AI Product Listing</div>
          <div style={styles.badge}>✓ Voice Upload</div>
          <div style={styles.badge}>✓ WhatsApp Commerce</div>
          <div style={styles.badge}>✓ Verified Artisans</div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 3. PRODUCT UPLOAD - DUAL ENGINE
// ==========================================
export function ProductUpload() {
  const [uploadMode, setUploadMode] = useState(null); 
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const triggerPhotoOnlyAI = async () => {
    if (!file) return alert("Please upload a product photo first!");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/products/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setAiResult(data);
      } else {
        alert(data.message || "Analysis request rejected.");
      }
    } catch (err) {
      console.error(err);
      alert("AI interpretation failed.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImageForVoiceMode = async () => {
    if (!file) return alert("કૃપા કરીને પ્રોડક્ટનો ફોટો લો!");
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/products/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.image) {
        setUploadedFileName(data.image);
        setCurrentStep(2); 
      } else {
        alert("ફોટો સેવ ન થઈ શક્યો.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/wav';
        setAudioBlob(new Blob(audioChunksRef.current, { type: mimeType }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("માઇક એક્સેસ ભૂલ!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeVoiceDescription = async () => {
    if (!audioBlob) return alert("પહેલા અવાજ રેકોર્ડ કરો!");
    setLoading(true);

    const formData = new FormData();
    const extension = audioBlob.type.includes('webm') ? 'webm' : 'wav';
    formData.append('audio', audioBlob, `artisan-voice.${extension}`);

    try {
      const response = await fetch('http://localhost:5000/api/products/analyze-voice', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAiResult(data);
      } else {
        alert("વોઈસ એનાલિસિસ ફેઈલ.");
      }
    } catch (err) {
      alert("સર્વર એરર.");
    } finally {
      setLoading(false);
    }
  };

  const commitToDatabase = async () => {
    try {
      const finalImage = uploadMode === 'photo_ai' ? aiResult.image : uploadedFileName;
      const response = await fetch('http://localhost:5000/api/products/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...aiResult, image: finalImage }),
      });
      if (response.ok) {
        alert("પ્રોડક્ટ સફળતાપૂર્વક માર્કેટપ્લેસમાં લાઈવ થઈ ગઈ છે! 🎉");
        resetWizard();
      }
    } catch (err) {
      alert("Database error.");
    }
  };

  const resetWizard = () => {
    setUploadMode(null);
    setCurrentStep(1);
    setFile(null);
    setPreview(null);
    setAudioBlob(null);
    setUploadedFileName("");
    setAiResult(null);
  };

  const styles = {
    container: { padding: '40px', background: theme.colors.background, fontFamily: theme.fonts.body, minHeight: '90vh' },
    card: { background: 'white', padding: '32px', borderRadius: theme.radius, boxShadow: theme.shadows.premium, maxWidth: '800px', margin: '0 auto' },
    modeBox: { border: '2px solid #E2E8F0', padding: '24px', borderRadius: theme.radius, textAlign: 'center', cursor: 'pointer', transition: '0.3s', flex: 1, background: '#F8FAFC' },
    dropzone: { border: `2px dashed ${theme.colors.primary}`, borderRadius: theme.radius, padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#F0FDF4', marginBottom: '24px' },
    btn: (bg) => ({ width: '100%', padding: '14px', background: bg, color: 'white', border: 'none', borderRadius: theme.radius, fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginBottom: '12px' }),
    voiceSection: { background: '#FFFBEB', border: '1px dashed #F59E0B', borderRadius: theme.radius, padding: '20px', textAlign: 'center', marginBottom: '24px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!uploadMode && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>તમે પ્રોડક્ટ કેવી રીતે અપલોડ કરવા માંગો છો?</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={styles.modeBox} onClick={() => setUploadMode('photo_ai')}>
                <h3 style={{ fontSize: '24px' }}>💻 ઓપ્શન ૧</h3>
                <p style={{ fontWeight: 'bold', color: theme.colors.primary }}>Drag & Drop / Photo Scan</p>
                <p style={{ fontSize: '13px', color: '#64748B' }}>જેમને ફાઇલ અપલોડ કરતા ફાવે છે અને AI જાતે વિગત નક્કી કરે તે ગમે છે.</p>
              </div>
              <div style={styles.modeBox} onClick={() => setUploadMode('voice_ai')}>
                <h3 style={{ fontSize: '24px' }}>🎙️ ઓપ્શન ૨</h3>
                <p style={{ fontWeight: 'bold', color: '#F59E0B' }}>Take Photo + Voice (બોલીને)</p>
                <p style={{ fontSize: '13px', color: '#64748B' }}>પ્રોડક્ટનો ફોટો પાડીને, વિગતો અને કિંમત મોઢેથી બોલીને ઉમેરવા માટે.</p>
              </div>
            </div>
          </div>
        )}

        {uploadMode === 'photo_ai' && (
          <div>
            <button onClick={resetWizard} style={{ marginBottom: '15px', cursor: 'pointer' }}>⬅️ ઓપ્શન બદલો</button>
            <div style={styles.dropzone} onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" style={{ display: 'none' }} />
              {preview ? <img src={preview} alt="Preview" style={{ maxHeight: '250px' }} /> : (
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>Drag & Drop or Click to Scan Artisan Artwork</p>
                  <p style={{ color: theme.colors.textLight, fontSize: '14px' }}>Supports PNG, JPG captures</p>
                </div>
              )}
            </div>
            {file && !aiResult && (
              <button onClick={triggerPhotoOnlyAI} disabled={loading} style={styles.btn(theme.colors.primary)}>
                {loading ? "AI ફોટો ચેક કરી રહ્યું છે..." : "Run AI Catalog Engine 🚀"}
              </button>
            )}
          </div>
        )}

        {uploadMode === 'voice_ai' && (
          <div>
            <button onClick={resetWizard} style={{ marginBottom: '15px', cursor: 'pointer' }}>⬅️ ઓપ્શન બદલો</button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontWeight: 'bold' }}>
              <span style={{ color: currentStep === 1 ? theme.colors.primary : '#aaa' }}>📸 સ્ટેપ ૧: ફોટો લો</span>
              <span style={{ color: currentStep === 2 ? '#F59E0B' : '#aaa' }}>🎙️ સ્ટેપ ૨: વિગત બોલો</span>
            </div>

            {currentStep === 1 && (
              <div>
                <div style={styles.dropzone} onClick={() => fileInputRef.current.click()}>
                  <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" style={{ display: 'none' }} />
                  {preview ? <img src={preview} alt="Preview" style={{ maxHeight: '250px' }} /> : <p>પ્રોડક્ટનો ફોટો પાડો અથવા સિલેક્ટ કરો</p>}
                </div>
                {file && (
                  <button onClick={uploadImageForVoiceMode} disabled={loading} style={styles.btn(theme.colors.primary)}>
                    {loading ? "અપલોડિંગ..." : "ફોટો લોક કરો અને આગળ વધો ➡️"}
                  </button>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div style={styles.voiceSection}>
                <h4>🎙️ માઇક ઓન કરીને પ્રોડક્ટ વિશે બોલો</h4>
                {!isRecording ? (
                  <button type="button" onClick={startRecording} style={{ background: '#F59E0B', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🎤 Start Recording</button>
                ) : (
                  <button type="button" onClick={stopRecording} style={{ background: '#DC2626', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>🛑 Stop Recording</button>
                )}
                {audioBlob && !isRecording && (
                  <div style={{ marginTop: '15px' }}>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ display: 'block', margin: '0 auto 10px' }} />
                    <button type="button" onClick={analyzeVoiceDescription} disabled={loading} style={{ background: '#F59E0B', color: 'white', padding: '10px 20px', border: 'none', borderRadius: theme.radius, cursor: 'pointer' }}>
                      {loading ? "AI સમજી રહ્યું છે..." : "અવાજમાંથી ડેટા બનાવો ✨"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {aiResult && (
          <div style={{ marginTop: '32px', padding: '24px', background: '#F8FAFC', borderRadius: theme.radius, border: '1px solid #E2E8F0' }}>
            <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>✨ AI Generated Details</h3>
            <p><strong>Title (En):</strong> {aiResult.title_en}</p>
            <p><strong>Title (ગુજરાતી):</strong> {aiResult.title_gu}</p>
            <p><strong>Price:</strong> ₹{aiResult.suggestedPrice}</p>
            <button onClick={commitToDatabase} style={styles.btn(theme.colors.success)}>
              Publish Product Data to Live Web Marketplace 🛒
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. MARKETPLACE GRID (ERROR FREE)
// ==========================================
export function Marketplace({ searchQuery }) { 
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [editForm, setEditForm] = useState({ title_en: '', title_gu: '', suggestedPrice: '', desc_en: '' });
  
  const userToken = localStorage.getItem('token');
  let isArtisan = false;

  if (userToken) {
    try {
      const payload = JSON.parse(atob(userToken.split('.')[1]));
      if (payload && payload.role === 'artisan') isArtisan = true;
    } catch (e) { console.error(e); }
  }

  const fetchProducts = useCallback(() => {
    const url = searchQuery 
      ? `http://localhost:5000/api/products?search=${encodeURIComponent(searchQuery)}`
      : "http://localhost:5000/api/products";

    fetch(url)
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error(err));
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); 

  const handleDelete = async (id) => {
    if (!window.confirm("શું તમે આ પ્રોડક્ટ ડિલીટ કરવા માંગો છો?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (response.ok) fetchProducts();
    } catch (err) { console.error(err); }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      title_en: product.title_en,
      title_gu: product.title_gu,
      suggestedPrice: product.suggestedPrice,
      desc_en: product.desc_en
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const response = await fetch(`http://localhost:5000/api/products/edit/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        alert("પ્રોડક્ટ અપડેટ થઈ ગઈ!");
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err) { alert("Error updating."); }
  };

  const handleWhatsAppOrder = (product) => {
    const message = `મને આ પ્રોડક્ટ ખરીદવામાં રસ છે: ${product.title_en}`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>{searchQuery ? `પરિણામ: "${searchQuery}"` : "માર્કેટપ્લેસ"}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.title_en} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
            
            {/* ટાઈટલ અને પ્રાઇસનું પ્રોપર સ્ટ્રક્ચર */}
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{p.title_en}</h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>{p.title_gu}</p>
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', fontSize: '16px', color: '#059669' }}>₹{p.suggestedPrice}</p>
            </div>

            {/* બટન્સ */}
            <button onClick={() => handleWhatsAppOrder(p)} style={{ width: '100%', padding: '10px', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>WhatsApp Order 💬</button>
            
            {isArtisan && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => openEditModal(p)} style={{ flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit 📝</button>
                <button onClick={() => handleDelete(p._id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete 🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleEditSubmit} style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Edit Product</h3>
            <input type="text" value={editForm.title_en} onChange={(e) => setEditForm({...editForm, title_en: e.target.value})} placeholder="Title (EN)" style={{ padding: '8px' }} />
            <input type="number" value={editForm.suggestedPrice} onChange={(e) => setEditForm({...editForm, suggestedPrice: e.target.value})} placeholder="Price" style={{ padding: '8px' }} />
            <button type="submit" style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none' }}>Save Changes</button>
            <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '10px' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
// ==========================================
// 5. ANALYTICS MANAGEMENT DASHBOARD
// ==========================================
export function DashboardView() {
  const metrics = [
    { label: "Total Products Listed", value: "14 Items", color: theme.colors.primary },
    { label: "Gross Marketplace Orders", value: "32 Received", color: theme.colors.secondary },
    { label: "Calculated Revenue", value: "₹48,250", color: theme.colors.accent },
    { label: "Profile Visitors", value: "1,240 Hits", color: theme.colors.text }
  ];

  const styles = {
    view: { padding: '40px', background: theme.colors.background, fontFamily: theme.fonts.body, minHeight: '90vh' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
    card: { background: 'white', padding: '24px', borderRadius: theme.radius, boxShadow: theme.shadows.soft, borderLeft: `6px solid ${theme.colors.primary}` }
  };

  return (
    <div style={styles.view}>
      <h2 style={{ fontFamily: theme.fonts.heading, marginBottom: '24px' }}>Artisan Storefront Analytics Summary</h2>
      <div style={styles.grid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{ ...styles.card, borderLeftColor: m.color }}>
            <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textLight, fontWeight: '500' }}>{m.label}</p>
            <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: theme.colors.text }}>{m.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}