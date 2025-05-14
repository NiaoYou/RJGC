import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      {/* 左侧导航栏 */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🛠 软件工程管理平台</h2>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.link}>📊 首页</Link>
          <Link to="/chat/frontend" style={styles.link}>💬 聊天</Link>
         
        </nav>
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
    fontFamily: 'sans-serif',
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  logout: {
    marginTop: 'auto',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#f4f7fa',
    overflowY: 'auto',
  },
};

export default Layout;
