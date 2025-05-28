import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  // 检查当前路径是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={styles.wrapper}>
      {/* 左侧导航栏 */}
      <aside style={{
        ...styles.sidebar,
        width: collapsed ? '60px' : '260px'
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={{
            ...styles.logo,
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : 'auto',
            overflow: 'hidden'
          }}>DevHub</h2>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseButton}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={{
            ...styles.link,
            ...(isActive('/dashboard') ? styles.activeLink : {}),
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={styles.icon}>📊</span>
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>首页</span>
          </Link>
          <Link to="/documents" style={{
            ...styles.link,
            ...(isActive('/documents') ? styles.activeLink : {}),
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={styles.icon}>📂</span>
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>文档管理</span>
          </Link>
          <Link to="/meeting" style={{
            ...styles.link,
            ...(isActive('/meeting') ? styles.activeLink : {}),
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={styles.icon}>🏢</span>
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>会议室</span>
          </Link>
        </nav>
        
        <button 
          onClick={handleLogout} 
          style={{
            ...styles.logout,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <span style={styles.icon}>🚪</span>
          <span style={{
            display: collapsed ? 'none' : 'block'
          }}>退出登录</span>
        </button>
      </aside>

      {/* 主内容区 */}
      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    background: '#ffffff',
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e5e5',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '30px',
    fontWeight: '600',
    transition: 'opacity 0.3s ease, width 0.3s ease',
  },
  collapseButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '4px',
  },
  link: {
    color: '#202123',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    margin: '0 8px',
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: '#f7f7f8',
    fontWeight: '500',
  },
  icon: {
    marginRight: '12px',
    fontSize: '16px',
  },
  linkText: {
    whiteSpace: 'nowrap',
  },
  logout: {
    backgroundColor: 'transparent',
    color: '#202123',
    border: 'none',
    padding: '10px 16px',
    margin: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
  },
};

export default Layout;
