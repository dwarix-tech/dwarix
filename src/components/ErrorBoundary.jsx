import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DWARIX App Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1B1E24',
            color: '#ECEEF1',
            padding: '24px',
            textAlign: 'center',
            fontFamily: "'Instrument Sans', system-ui, sans-serif"
          }}
        >
          <h1
            style={{
              fontFamily: "'Unbounded', system-ui, sans-serif",
              fontSize: '2rem',
              color: '#F2A057',
              marginBottom: '16px'
            }}
          >
            Something unexpected occurred.
          </h1>
          <p
            style={{
              maxWidth: '520px',
              color: '#AEB4BD',
              marginBottom: '28px',
              lineHeight: 1.6
            }}
          >
            An application error was intercepted safely. Click below to refresh the experience.
          </p>
          <button
            onClick={this.handleReload}
            className="btn btn-copper"
            style={{
              cursor: 'pointer',
              padding: '14px 28px',
              borderRadius: '999px',
              background: 'linear-gradient(120deg, #D35A24, #E57A35)',
              color: '#fff',
              border: 'none',
              fontWeight: 600
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

