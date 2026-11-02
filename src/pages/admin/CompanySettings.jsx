import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export default function CompanySettings() {
  const { updateCompanyData } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [companyName, setCompanyName] = useState('DWARIX Technologies');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Social Links
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/company', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        const c = data.data;
        setCompanyName(c.companyName || 'DWARIX Technologies');
        setTagline(c.tagline || '');
        setDescription(c.description || '');
        setEmail(c.email || 'dwarixtech@gmail.com');
        setPhone(c.phone || '+91 7981613325');
        setWhatsapp(c.whatsapp || '+91 7981613325');
        setWorkingHours(c.workingHours || 'Mon – Sat, 9:00 AM – 7:00 PM IST');

        if (c.address) {
          setStreet(c.address.street || 'Rajam');
          setCity(c.address.city || 'Vizianagaram');
          setState(c.address.state || 'Andhraprades');
          setCountry(c.address.country || 'India');
          setPostalCode(c.address.postalCode || '532127');
          setGoogleMapsUrl(c.address.googleMapsUrl || '');
        }

        if (c.socialLinks) {
          setGithub(c.socialLinks.github || 'https://github.com/dwarix-tech');
          setLinkedin(c.socialLinks.linkedin || 'https://www.linkedin.com/in/dwarix-technologies/');
          setTwitter(c.socialLinks.twitter || 'https://twitter.com/dwarixtech');
          setInstagram(c.socialLinks.instagram || 'https://www.instagram.com/dwarixtech/');
        }

        if (c.seoMetadata) {
          setSeoTitle(c.seoMetadata.title || 'DWARIX Technologies — AI, Web & Mobile Engineering');
          setSeoDescription(c.seoMetadata.description || '');
        }
      }
    } catch (err) {
      setError('Failed to fetch settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      companyName,
      tagline,
      description,
      email,
      phone,
      whatsapp,
      workingHours,
      address: { street, city, state, country, postalCode, googleMapsUrl },
      socialLinks: { github, linkedin, twitter, instagram },
      seoMetadata: { title: seoTitle, description: seoDescription }
    };

    try {
      const res = await fetch('/api/admin/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Company configuration saved and broadcasted in real-time to the public website!');
        if (updateCompanyData) {
          updateCompanyData(data.data || payload);
        }
      } else {
        setError(data.message || 'Failed to save configuration');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '40px' }}>Loading configuration...</p>;
  }

  return (
    <div>
      <form onSubmit={handleSave}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Company Profile & Global CMS Settings</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                Official brand identity, contact routes, address, and live website synchronization
              </p>
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {message && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#34D399',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#F87171',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* General Information */}
            <h3 style={{ fontSize: '1rem', color: 'var(--admin-accent)', margin: '0 0 16px 0', fontFamily: 'Unbounded, sans-serif' }}>
              Brand Identity & Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="admin-input-group">
                <label className="admin-label">Company Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Official Tagline</label>
                <input
                  type="text"
                  className="admin-input"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-input-group" style={{ marginBottom: '28px' }}>
              <label className="admin-label">About / Executive Summary</label>
              <textarea
                className="admin-input"
                rows={3}
                style={{ resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Contact Routes */}
            <h3 style={{ fontSize: '1rem', color: 'var(--admin-accent)', margin: '0 0 16px 0', fontFamily: 'Unbounded, sans-serif' }}>
              Direct Contact & Channels
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div className="admin-input-group">
                <label className="admin-label">Official Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Telephone</label>
                <input
                  type="text"
                  className="admin-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="admin-input"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Business Hours</label>
                <input
                  type="text"
                  className="admin-input"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <h3 style={{ fontSize: '1rem', color: 'var(--admin-accent)', margin: '0 0 16px 0', fontFamily: 'Unbounded, sans-serif' }}>
              Office Location & Maps
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="admin-input-group">
                <label className="admin-label">Street Address</label>
                <input
                  type="text"
                  className="admin-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">City</label>
                <input
                  type="text"
                  className="admin-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">State / Region</label>
                <input
                  type="text"
                  className="admin-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Country</label>
                <input
                  type="text"
                  className="admin-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Postal Code</label>
                <input
                  type="text"
                  className="admin-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-input-group" style={{ marginBottom: '28px' }}>
              <label className="admin-label">Google Maps URL (Optional)</label>
              <input
                type="url"
                className="admin-input"
                placeholder="https://maps.google.com/..."
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
              />
            </div>

            {/* Social Links */}
            <h3 style={{ fontSize: '1rem', color: 'var(--admin-accent)', margin: '0 0 16px 0', fontFamily: 'Unbounded, sans-serif' }}>
              Social & Developer Channels
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div className="admin-input-group">
                <label className="admin-label">GitHub Organization</label>
                <input
                  type="url"
                  className="admin-input"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">LinkedIn Page</label>
                <input
                  type="url"
                  className="admin-input"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Twitter / X Profile</label>
                <input
                  type="url"
                  className="admin-input"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Instagram Profile</label>
                <input
                  type="url"
                  className="admin-input"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>

            {/* SEO Metadata */}
            <h3 style={{ fontSize: '1rem', color: 'var(--admin-accent)', margin: '0 0 16px 0', fontFamily: 'Unbounded, sans-serif' }}>
              Search Engine Optimization (SEO)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div className="admin-input-group">
                <label className="admin-label">Meta Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="admin-input-group">
                <label className="admin-label">Meta Description</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
