import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Frog Store App Crash Caught by ErrorBoundary:', error, errorInfo)
  }

  public handleReload = () => {
    window.location.hash = '#/'
    window.location.reload()
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = '#/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🐸</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', margin: '0 0 8px 0' }}>
              Đã xảy ra sự cố hiển thị nhỏ
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Hệ thống đã tự động bảo vệ dữ liệu giỏ hàng của bạn. Bạn có thể nhấn nút bên dưới để khôi phục lại trang chủ ngay lập tức.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Về Trang Chủ
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                Tải Lại Trang
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

