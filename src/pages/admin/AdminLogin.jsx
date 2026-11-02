import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import '../../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 15%, #1D222D 0%, #0B0D11 75%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--body, "Instrument Sans", sans-serif)',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(224, 107, 45, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#13161D',
        border: '1px solid rgba(224, 107, 45, 0.25)',
        borderRadius: '24px',
        padding: '44px 38px',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.85), 0 0 50px -15px rgba(224, 107, 45, 0.12)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand & Security Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            position: 'relative'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px -4px rgba(224, 107, 45, 0.35)',
              border: '1px solid rgba(242, 160, 87, 0.4)',
              background: '#1B1E24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={logoImg}
                alt="DWARIX Technologies"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--display, "Unbounded", sans-serif)',
            fontSize: '1.45rem',
            fontWeight: 600,
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            DWARIX Admin Portal
          </h1>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--admin-text-muted, #8E95A5)',
            margin: 0,
            lineHeight: 1.5
          }}>
            Sign in with authorized administrator credentials
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#EF4444' }} />
            <span style={{ lineHeight: 1.4 }}>{errorMessage}</span>
          </div>
        )}

        {/* Clean Stacked Login Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            boxShadow: 'none'
          }}
        >
          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="admin-email"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#C8CFDC',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Administrator Email</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8E95A5',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Mail size={17} />
              </div>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  background: '#181C26',
                  border: '1px solid #2B3242',
                  color: '#FFFFFF',
                  padding: '13px 14px 13px 42px',
                  borderRadius: '12px',
                  fontSize: '0.94rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E06B2D';
                  e.target.style.boxShadow = '0 0 0 3px rgba(224, 107, 45, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2B3242';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="name@dwarix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="admin-pass"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#C8CFDC',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8E95A5',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Lock size={17} />
              </div>
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: '#181C26',
                  border: '1px solid #2B3242',
                  color: '#FFFFFF',
                  padding: '13px 44px 13px 42px',
                  borderRadius: '12px',
                  fontSize: '0.94rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#E06B2D';
                  e.target.style.boxShadow = '0 0 0 3px rgba(224, 107, 45, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2B3242';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8E95A5',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.84rem',
            padding: '2px 0'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#B4BAC7',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#E06B2D',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span>Remember this device</span>
            </label>
            <span style={{ color: '#707787', fontSize: '0.78rem' }}>
              Encrypted session
            </span>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #D35A24 0%, #F2A057 100%)',
              color: '#FFFFFF',
              fontFamily: 'var(--display, "Unbounded", sans-serif)',
              fontSize: '0.92rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 12px 28px -6px rgba(211, 90, 36, 0.55)',
              transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
              opacity: isSubmitting ? 0.8 : 1,
              marginTop: '4px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 16px 34px -6px rgba(211, 90, 36, 0.65)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 12px 28px -6px rgba(211, 90, 36, 0.55)';
              }
            }}
          >
            {isSubmitting ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security & Return Links */}
        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(174, 180, 189, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: '#707787'
          }}>
            <ShieldCheck size={14} style={{ color: '#10B981' }} />
            <span>End-to-end encrypted session with HTTP-only security</span>
          </div>

          <Link
            to="/"
            style={{
              fontSize: '0.84rem',
              color: '#A0A7B5',
              textDecoration: 'none',
              transition: 'color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.target.style.color = '#A0A7B5'}
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
