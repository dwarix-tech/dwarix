import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  ExternalLink, 
  X, 
  FolderKanban,
  Check,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'AI & Machine Learning',
  'Web Applications',
  'Mobile Applications',
  'Custom Software'
];

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('published');
  const [isSampleConcept, setIsSampleConcept] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategory(CATEGORIES[0]);
    setShortDescription('');
    setTechnologies('');
    setLiveUrl('');
    setGithubUrl('');
    setFeatured(false);
    setStatus('published');
    setIsSampleConcept(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setSlug(proj.slug);
    setCategory(proj.category);
    setShortDescription(proj.shortDescription);
    setTechnologies(Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '');
    setLiveUrl(proj.liveUrl || '');
    setGithubUrl(proj.githubUrl || '');
    setFeatured(Boolean(proj.featured));
    setStatus(proj.status || 'published');
    setIsSampleConcept(Boolean(proj.isSampleConcept));
    setFormError('');
    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingProject) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      category,
      shortDescription,
      technologies: techArray,
      liveUrl,
      githubUrl,
      featured,
      status,
      isSampleConcept
    };

    try {
      const url = editingProject 
        ? `/api/admin/projects/${editingProject._id}` 
        : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';

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
      fetchProjects();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== id));
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
            <h2 className="admin-card-title">Portfolio Projects & Case Studies</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Manage production projects and case studies displayed on the public website
            </p>
          </div>
          <button onClick={openCreateModal} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title / Slug</th>
                <th>Category</th>
                <th>Stack</th>
                <th>Featured</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    No projects found. Create one with the button above.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj._id}>
                    <td>
                      <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>{proj.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{proj.slug}</div>
                    </td>
                    <td>{proj.category}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {proj.technologies && proj.technologies.map((t, idx) => (
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
                      {proj.featured ? (
                        <span style={{ color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="var(--admin-accent)" /> Yes
                        </span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-subtle)' }}>No</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${proj.status === 'published' ? 'completed' : 'rejected'}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(proj)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="Edit project"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj._id)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="Delete project"
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

      {/* Project Create / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: 'Unbounded, sans-serif' }}>
                {editingProject ? 'Edit Project' : 'Create New Project'}
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
                  <label className="admin-label">Project Title *</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. FinEdge Analytics Platform"
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
                    placeholder="finedge-analytics-platform"
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
                  <label className="admin-label">Short Description *</label>
                  <textarea
                    required
                    rows="3"
                    className="admin-textarea"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Clear 1-2 sentence overview of the project scope and value..."
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Technologies (comma separated)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="React, Node.js, Python, PostgreSQL"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-input-group">
                    <label className="admin-label">Status</label>
                    <select
                      className="admin-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="admin-input-group" style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                      <span style={{ fontSize: '0.88rem' }}>Feature on homepage</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

