import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Inbox, 
  FolderKanban, 
  Layers, 
  Cpu, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B0D10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E06B2D',
        fontFamily: 'Unbounded, sans-serif'
      }}>
        Authenticating DWARIX Admin Session...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/enquiries', label: 'Enquiries & Leads', icon: Inbox },
    { to: '/admin/projects', label: 'Projects & Case Studies', icon: FolderKanban },
    { to: '/admin/services', label: 'Services', icon: Layers },
    { to: '/admin/technologies', label: 'Technologies', icon: Cpu },
    { to: '/admin/settings', label: 'Company Settings', icon: Settings }
  ];

  const getPageTitle = () => {
    const current = navLinks.find(link => location.pathname.startsWith(link.to));
    return current ? current.label : 'Admin Portal';
  };

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <a href="/" className="admin-logo">
            DWARIX <span className="admin-logo-badge">Admin</span>
          </a>
          <button 
            className="admin-btn admin-btn-secondary" 
            style={{ padding: '4px 8px', display: mobileOpen ? 'block' : 'none' }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          
          <div style={{ margin: '16px 0', borderTop: '1px solid var(--admin-border)' }} />

          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer" 
            className="admin-nav-item"
            style={{ color: 'var(--admin-accent)' }}
          >
            <ExternalLink size={18} />
            <span>View Public Website</span>
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <div className="admin-user-avatar">
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{admin.name}</span>
              <span className="admin-user-role">{admin.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="admin-btn admin-btn-secondary"
              style={{ padding: '8px', display: 'flex' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="admin-user-topbar-info" style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              <span className="admin-hide-mobile">Logged in as </span>
              <strong style={{ color: '#FFFFFF' }}>{admin.email}</strong>
            </span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

