import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  FolderKanban, 
  Layers, 
  Cpu, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { subscribeToEvent } from '../../services/socket';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch dashboard metrics');
      }
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Real-time synchronization when a new enquiry is created
    const unsubNewEnquiry = subscribeToEvent('enquiry:new', () => {
      fetchStats();
    });

    return () => {
      unsubNewEnquiry();
    };
  }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--admin-accent)' }} />
        <p style={{ margin: 0, fontSize: '0.92rem' }}>Synchronizing real-time MongoDB Atlas platform statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        padding: '24px',
        color: '#FCA5A5'
      }}>
        <AlertCircle size={22} style={{ marginBottom: '10px', color: '#EF4444' }} />
        <p style={{ margin: '0 0 14px 0', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchStats} className="admin-btn admin-btn-secondary">
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, recentEnquiries } = data;
  const totalEnquiries = stats.enquiries?.total || 0;
  const newCount = stats.enquiries?.new || 0;
  const contactedCount = stats.enquiries?.contacted || 0;
  const inProgressCount = stats.enquiries?.inProgress || 0;
  const proposalSentCount = stats.enquiries?.proposalSent || 0;
  const completedCount = stats.enquiries?.completed || 0;
  const rejectedCount = stats.enquiries?.rejected || 0;

  const totalProjects = typeof stats.projects === 'object' ? stats.projects.total : stats.projects;
  const publishedProjects = typeof stats.projects === 'object' ? stats.projects.published : stats.projects;

  const totalServices = typeof stats.services === 'object' ? stats.services.total : stats.services;
  const activeServices = typeof stats.services === 'object' ? stats.services.active : stats.services;

  return (
    <div>
      {/* Metrics Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">New Inbound Leads</span>
            <div className="admin-stat-icon">
              <Inbox size={20} />
            </div>
          </div>
          <div className="admin-stat-value" style={{ color: 'var(--admin-accent)' }}>
            {newCount}
          </div>
          <p className="admin-stat-desc">
            Out of {totalEnquiries} total client enquiries in Atlas
          </p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Engagements</span>
            <div className="admin-stat-icon" style={{ color: 'var(--admin-warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-stat-value" style={{ color: 'var(--admin-warning)' }}>
            {inProgressCount + proposalSentCount}
          </div>
          <p className="admin-stat-desc">
            {proposalSentCount} proposals sent, {inProgressCount} in progress
          </p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Published Projects</span>
            <div className="admin-stat-icon" style={{ color: 'var(--admin-info)' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{publishedProjects}</div>
          <p className="admin-stat-desc">
            {totalProjects} total systems in MongoDB portfolio
          </p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Services</span>
            <div className="admin-stat-icon" style={{ color: 'var(--admin-success)' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{activeServices}</div>
          <p className="admin-stat-desc">
            {stats.technologies} technologies mapped across services
          </p>
        </div>
      </div>

      {/* Pipeline Status Distribution Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Enquiry Funnel & Lifecycle Distribution</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Live lifecycle distribution of all {totalEnquiries} client requests registered in MongoDB Atlas
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--admin-accent)' }}>
            <TrendingUp size={15} />
            <span>Atlas Live Sync</span>
          </div>
        </div>

        {totalEnquiries > 0 ? (
          <div>
            {/* Visual Multi-Segment Bar */}
            <div style={{
              display: 'flex',
              height: '14px',
              borderRadius: '7px',
              overflow: 'hidden',
              background: '#1A1E26',
              marginBottom: '16px'
            }}>
              {newCount > 0 && (
                <div style={{ width: `${(newCount / totalEnquiries) * 100}%`, background: '#F28C38' }} title={`New: ${newCount}`} />
              )}
              {contactedCount > 0 && (
                <div style={{ width: `${(contactedCount / totalEnquiries) * 100}%`, background: '#60A5FA' }} title={`Contacted: ${contactedCount}`} />
              )}
              {inProgressCount > 0 && (
                <div style={{ width: `${(inProgressCount / totalEnquiries) * 100}%`, background: '#FBBF24' }} title={`In Progress: ${inProgressCount}`} />
              )}
              {proposalSentCount > 0 && (
                <div style={{ width: `${(proposalSentCount / totalEnquiries) * 100}%`, background: '#A78BFA' }} title={`Proposal Sent: ${proposalSentCount}`} />
              )}
              {completedCount > 0 && (
                <div style={{ width: `${(completedCount / totalEnquiries) * 100}%`, background: '#34D399' }} title={`Completed: ${completedCount}`} />
              )}
              {rejectedCount > 0 && (
                <div style={{ width: `${(rejectedCount / totalEnquiries) * 100}%`, background: '#F87171' }} title={`Rejected: ${rejectedCount}`} />
              )}
            </div>

            {/* Legend Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F28C38', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>New: <strong>{newCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>Contacted: <strong>{contactedCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FBBF24', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>In Progress: <strong>{inProgressCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#A78BFA', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>Proposal Sent: <strong>{proposalSentCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>Completed: <strong>{completedCount}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#C8CFDC' }}>Rejected: <strong>{rejectedCount}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
            No enquiries recorded yet. Submissions through the public contact form will automatically build your pipeline distribution here.
          </p>
        )}
      </div>

      {/* Recent Enquiries Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Recent Project Enquiries</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Latest incoming client requests from the public website contact form
            </p>
          </div>
          <Link to="/admin/enquiries" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.85rem' }}>
            <span>Manage All Enquiries</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference / Client</th>
                <th>Service Requested</th>
                <th>Email</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries && recentEnquiries.length > 0 ? (
                recentEnquiries.map((enq) => {
                  const statusClass = enq.status.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <tr key={enq._id}>
                      <td>
                        <span style={{ fontSize: '0.72rem', color: '#F2A057', fontFamily: 'monospace', display: 'block' }}>
                          {enq.referenceId || enq._id.substring(0, 8)}
                        </span>
                        <strong>{enq.name}</strong>
                        {enq.company && (
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                            {enq.company}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--admin-accent)', fontWeight: 500 }}>
                        {enq.service}
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)' }}>{enq.email}</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/enquiries?id=${enq._id}`}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                    No client enquiries received yet. All new submissions will appear here instantly.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
