import React, { useState, useEffect } from 'react';
import { Layers, Edit, Plus, Trash2, Check, X } from 'lucide-react';

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle('');
    setSlug('');
    setShortDescription('');
    setFeatures('');
    setTechnologies('');
    setDisplayOrder(services.length + 1);
    setIsActive(true);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (svc) => {
    setEditingService(svc);
    setTitle(svc.title);
    setSlug(svc.slug);
    setShortDescription(svc.shortDescription);
    setFeatures(Array.isArray(svc.features) ? svc.features.join('\n') : '');
    setTechnologies(Array.isArray(svc.technologies) ? svc.technologies.join(', ') : '');
    setDisplayOrder(svc.displayOrder || 1);
    setIsActive(svc.isActive !== false);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const featuresArray = features
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      shortDescription,
      features: featuresArray,
      technologies: techArray,
      displayOrder: parseInt(displayOrder, 10),
      isActive
    };

    try {
      const url = editingService 
        ? `/api/admin/services/${editingService._id}` 
        : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Operation failed');
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setServices(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Services Offerings ({services.length})</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Core capabilities and deliverables rendered dynamically across the platform
            </p>
          </div>
          <button onClick={openCreateModal} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add New Service</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Service Name</th>
                <th>Features Count</th>
                <th>Tech Stack</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    No services found. Run seed script or add one.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc._id}>
                    <td style={{ color: 'var(--admin-accent)', fontWeight: 600 }}>#{svc.displayOrder}</td>
                    <td>
                      <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{svc.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{svc.slug}</div>
                    </td>
                    <td>{svc.features ? svc.features.length : 0} deliverables</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {svc.technologies && svc.technologies.map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--admin-bg-card)',
                            border: '1px solid var(--admin-border)'
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${svc.isActive ? 'completed' : 'rejected'}`}>
                        {svc.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(svc)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(svc._id)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} />
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

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: 'Unbounded, sans-serif' }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    color: '#FCA5A5',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}>
                    {formError}
                  </div>
                )}

                <div className="admin-input-group">
                  <label className="admin-label">Service Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingService) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. AI & Machine Learning"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Slug *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ai-and-machine-learning"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Short Description *</label>
                  <textarea
                    required
                    rows="3"
                    className="admin-textarea"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="High level overview of what this service offers..."
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Deliverables / Features (one per line)</label>
                  <textarea
                    rows="5"
                    className="admin-textarea"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="AI-powered applications&#10;Machine learning models&#10;Generative AI solutions"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Technologies (comma separated)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="Python, TensorFlow, PyTorch, FastAPI"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-input-group">
                    <label className="admin-label">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-input"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                    />
                  </div>

                  <div className="admin-input-group" style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <span style={{ fontSize: '0.88rem' }}>Active on website</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : (editingService ? 'Save Changes' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

