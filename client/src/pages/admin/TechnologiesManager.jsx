import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Trash2, Edit, X } from 'lucide-react';

const CATEGORIES = [
  'AI / ML',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud & DevOps',
  'Mobile'
];

export default function TechnologiesManager() {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState('#E06B2D');
  const [displayOrder, setDisplayOrder] = useState(1);

  const fetchTechnologies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/technologies', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTechnologies(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch technologies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const openCreateModal = () => {
    setName('');
    setCategory(CATEGORIES[0]);
    setColor('#E06B2D');
    setDisplayOrder(technologies.length + 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/admin/technologies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          category,
          color,
          displayOrder: parseInt(displayOrder, 10),
          isActive: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchTechnologies();
      } else {
        alert(data.message || 'Failed to add technology');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this technology chip?')) return;
    try {
      const res = await fetch(`/api/admin/technologies/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setTechnologies(prev => prev.filter(t => t._id !== id));
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Group technologies by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = technologies.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Technology Ecosystem ({technologies.length})</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Rendered dynamically in the interactive technology marquee and capability grids
            </p>
          </div>
          <button onClick={openCreateModal} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add Technology</span>
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading technologies...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{
                  background: 'var(--admin-bg-card)',
                  padding: '18px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--admin-accent)', fontFamily: 'Unbounded, sans-serif' }}>
                      {cat}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {grouped[cat]?.length || 0} technologies
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {grouped[cat]?.length > 0 ? (
                      grouped[cat].map(tech => (
                        <div
                          key={tech._id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 12px',
                            background: 'var(--admin-bg-surface)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: tech.color || '#E06B2D',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{tech.name}</span>
                          <button
                            onClick={() => handleDelete(tech._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--admin-text-subtle)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-subtle)', fontStyle: 'italic' }}>
                        No technologies mapped in this group.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: 'Unbounded, sans-serif' }}>Add Technology</h3>
              <button onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-label">Technology Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Next.js, Kubernetes, PyTorch"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Category *</label>
                  <select
                    className="admin-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Badge Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{
                        width: '44px',
                        height: '40px',
                        padding: 0,
                        border: '1px solid var(--admin-border)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: 'none'
                      }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#E06B2D"
                    />
                  </div>
                </div>

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
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Adding...' : 'Add Technology'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

