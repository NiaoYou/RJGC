import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🛠 软件工程平台</h2>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={{
            ...styles.link,
            ...(isActive('/dashboard') ? styles.activeLink : {})
          }}>
            <span style={styles.icon}>📊</span>
            <span>首页</span>
          </Link>
          <Link to="/documents" style={{
            ...styles.link,
            ...(isActive('/documents') ? styles.activeLink : {})
          }}>
            <span style={styles.icon}>📂</span>
            <span>文档管理</span>
          </Link>
          <Link to="/meeting" style={{
            ...styles.link,
            ...(isActive('/meeting') ? styles.activeLink : {})
          }}>
            <span style={styles.icon}>🏢</span>
            <span>会议室</span>
          </Link>
        </nav>
        <button onClick={handleLogout} style={styles.logout}>
          <span style={styles.icon}>🚪</span>
          <span>退出登录</span>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: '#f8f9fa',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '10px 20px 30px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '12px 20px',
    margin: '4px 0',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    borderLeft: '4px solid transparent',
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderLeft: '4px solid #3498db',
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  logout: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    padding: '12px 20px',
    margin: '20px 0 10px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  content: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
  },
};

export default Layout;
