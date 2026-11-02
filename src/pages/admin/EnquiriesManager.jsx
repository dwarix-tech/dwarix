import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  X,
  Send,
  Mail,
  Phone,
  Building,
  DollarSign,
  Download,
  RotateCw,
  AlertTriangle
} from 'lucide-react';
import { subscribeToEvent } from '../../services/socket';

const STATUSES = ['All', 'New', 'Contacted', 'In Progress', 'Proposal Sent', 'Completed', 'Rejected'];

export default function EnquiriesManager() {
  const [searchParams] = useSearchParams();
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [retryStatus, setRetryStatus] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      
      const res = await fetch(`/api/admin/enquiries?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data);
        setTotal(data.total);

        // If URL requested specific ID
        const targetId = searchParams.get('id');
        if (targetId && (!selectedEnquiry || selectedEnquiry._id !== targetId)) {
          const match = data.data.find(e => e._id === targetId);
          if (match) setSelectedEnquiry(match);
        }
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery, searchParams]);

  useEffect(() => {
    fetchEnquiries();

    // Real-time synchronization when a new enquiry is submitted
    const unsubNewEnquiry = subscribeToEvent('enquiry:new', () => {
      fetchEnquiries();
    });

    return () => {
      unsubNewEnquiry();
    };
  }, [fetchEnquiries]);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/enquiries/${enquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setEnquiries(prev => prev.map(e => e._id === enquiryId ? json.data : e));
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry(json.data);
        }
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedEnquiry) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: newNote.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedEnquiry(json.data);
        setEnquiries(prev => prev.map(e => e._id === selectedEnquiry._id ? json.data : e));
        setNewNote('');
      }
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryEmail = async (enquiryId) => {
    try {
      setRetryStatus('Retrying notification dispatch...');
      const res = await fetch(`/api/admin/enquiries/${enquiryId}/retry-email`, {
        method: 'POST',
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        setRetryStatus('Notification dispatched successfully');
        setEnquiries(prev => prev.map(e => e._id === enquiryId ? json.data : e));
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry(json.data);
        }
      } else {
        setRetryStatus(`Dispatch error: ${json.message || 'Failed'}`);
      }
    } catch (err) {
      setRetryStatus(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setRetryStatus(null), 4000);
    }
  };

  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to permanently delete this enquiry? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setEnquiries(prev => prev.filter(e => e._id !== enquiryId));
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry(null);
        }
      }
    } catch (err) {
      alert('Failed to delete enquiry: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const renderEmailBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span style={{ color: '#34D399', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Delivered</span>;
      case 'simulated':
        return <span style={{ color: '#FBBF24', fontSize: '0.74rem' }}>Simulated</span>;
      case 'failed':
        return <span style={{ color: '#F87171', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Failed</span>;
      default:
        return <span style={{ color: '#8E95A5', fontSize: '0.74rem' }}>Pending</span>;
    }
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ gap: '16px', flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUSES.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`admin-btn ${selectedStatus === status ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, email, ref ID..."
                className="admin-input"
                style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* CSV Export Button */}
            <a
              href="/api/admin/enquiries/export/csv"
              download
              className="admin-btn admin-btn-secondary"
              style={{ height: '38px', padding: '0 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Enquiry Submissions ({total})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference / Client</th>
                <th>Service</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Email Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    Loading client enquiries from MongoDB Atlas...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    No enquiries match the selected filter.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => {
                  const statusClass = enq.status.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <tr key={enq._id}>
                      <td>
                        <span style={{ fontSize: '0.72rem', color: '#F2A057', fontFamily: 'monospace', display: 'block' }}>
                          {enq.referenceId || enq._id.substring(0, 8)}
                        </span>
                        <strong style={{ color: '#FFFFFF' }}>{enq.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{enq.email}</div>
                        {enq.company && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--admin-accent)' }}>{enq.company}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{enq.service}</td>
                      <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>{enq.budget}</td>
                      <td>
                        <select
                          className={`status-badge ${statusClass}`}
                          style={{ background: 'transparent', cursor: 'pointer', border: '1px solid currentColor' }}
                          value={enq.status}
                          disabled={actionLoading}
                          onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                        >
                          <option value="New" style={{ background: '#12151B', color: '#F28C38' }}>New</option>
                          <option value="Contacted" style={{ background: '#12151B', color: '#60A5FA' }}>Contacted</option>
                          <option value="In Progress" style={{ background: '#12151B', color: '#FBBF24' }}>In Progress</option>
                          <option value="Proposal Sent" style={{ background: '#12151B', color: '#A78BFA' }}>Proposal Sent</option>
                          <option value="Completed" style={{ background: '#12151B', color: '#34D399' }}>Completed</option>
                          <option value="Rejected" style={{ background: '#12151B', color: '#F87171' }}>Rejected</option>
                        </select>
                      </td>
                      <td>
                        {renderEmailBadge(enq.customerEmailStatus || enq.adminEmailStatus)}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleDelete(enq._id)}
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Delete enquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal / Drawer */}
      {selectedEnquiry && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--admin-accent)', fontFamily: 'monospace' }}>
                  REF: {selectedEnquiry.referenceId || selectedEnquiry._id}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontFamily: 'Unbounded, sans-serif', fontSize: '1.15rem' }}>
                  {selectedEnquiry.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="admin-btn admin-btn-secondary"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Client Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                background: 'var(--admin-bg-card)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Email</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Mail size={14} color="var(--admin-accent)" />
                    <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>
                      {selectedEnquiry.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Phone</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Phone size={14} color="var(--admin-accent)" />
                    <span style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>
                      {selectedEnquiry.phone || 'Not provided'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Company</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Building size={14} color="var(--admin-accent)" />
                    <span style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>
                      {selectedEnquiry.company || 'Not provided'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Budget</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <DollarSign size={14} color="var(--admin-accent)" />
                    <span style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>
                      {selectedEnquiry.budget || 'Undisclosed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Status & Retry Bar */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Admin Notification: </span>
                    {renderEmailBadge(selectedEnquiry.adminEmailStatus)}
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Client Confirmation: </span>
                    {renderEmailBadge(selectedEnquiry.customerEmailStatus)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetryEmail(selectedEnquiry._id)}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCw size={13} />
                  <span>Retry Email Dispatch</span>
                </button>
              </div>

              {retryStatus && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(242, 160, 87, 0.15)', border: '1px solid rgba(242, 160, 87, 0.4)', color: '#F2A057', fontSize: '0.84rem' }}>
                  {retryStatus}
                </div>
              )}

              {/* Scope & Brief */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--admin-accent)' }}>
                  Service: {selectedEnquiry.service}
                </h4>
                <div style={{
                  background: 'var(--admin-bg-card)',
                  padding: '16px',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--admin-accent)',
                  lineHeight: '1.6',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedEnquiry.description}
                </div>
              </div>

              {/* Status Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label className="admin-label">Lead Lifecycle Status</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['New', 'Contacted', 'In Progress', 'Proposal Sent', 'Completed', 'Rejected'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedEnquiry._id, st)}
                      className={`admin-btn ${selectedEnquiry.status === st ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFFFFF' }}>
                  Internal Team Notes & Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 ? (
                    selectedEnquiry.notes.map((note, idx) => (
                      <div key={idx} style={{
                        background: 'var(--admin-bg-card)',
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: '1px solid var(--admin-border)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>
                          <strong>{note.author || 'Admin'}</strong>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ color: '#E0E0E0' }}>{note.body}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontStyle: 'italic', margin: 0 }}>
                      No internal notes recorded yet.
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add an internal note or meeting summary..."
                    className="admin-input"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={actionLoading || !newNote.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                onClick={() => handleDelete(selectedEnquiry._id)} 
                className="admin-btn admin-btn-danger"
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={16} />
                <span>Delete Enquiry</span>
              </button>
              <button onClick={() => setSelectedEnquiry(null)} className="admin-btn admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
