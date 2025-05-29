import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  // 在组件内部添加一个检测函数(未使用,暂时注释掉;eco)
  // const supportsBackdropFilter = () => {
  //   return typeof document !== 'undefined' &&
  //          'backdropFilter' in document.documentElement.style;
  // };

  const handleLogout = () => {
    navigate('/');
  };

  // 检查当前路径是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  // 检查当前是否在会议室页面
  const isMeetingPage = location.pathname === '/meeting';

  return (
    <div style={styles.wrapper}>
      {/* 背景装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52, 60, 207, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52, 60, 207, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: 0,
      }} />
      {/* 左侧导航栏 */}
      <aside style={{
        ...styles.sidebar,
        width: collapsed ? '60px' : '220px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(189, 197, 254, 0.22) 100%)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        borderRadius: '16px',
        margin: '0 12px 0 0',
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
            className="sidebar-button"
            style={{
              ...styles.collapseButton,
              backgroundColor: hoveredLink === 'collapse' ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
              color: hoveredLink === 'collapse' ? 'rgb(52, 60, 207)' : '#666'
            }}
            onMouseEnter={() => setHoveredLink('collapse')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={styles.nav}>
          <Link 
            to="/dashboard" 
            style={{
              ...styles.link,
              ...(isActive('/dashboard') ? styles.activeLink : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
              backgroundColor: !isActive('/dashboard') && hoveredLink === 'dashboard' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              color: hoveredLink === 'dashboard' && !isActive('/dashboard') ? 'rgb(52, 60, 207)' : isActive('/dashboard') ? 'rgb(52, 60, 207)' : '#202123'
            }}
            onMouseEnter={() => setHoveredLink('dashboard')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <img 
              src="/icons/homepage.svg" 
              alt="首页" 
              style={{ 
                width: '16px', 
                height: '16px',
                marginRight: collapsed ? '0' : '10px',
                filter: isActive('/dashboard') || hoveredLink === 'dashboard' ? 
                  'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                  'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
                transition: 'filter 0.2s ease'
              }} 
            />
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>首页</span>
          </Link>
          <Link 
            to="/documents" 
            style={{
              ...styles.link,
              ...(isActive('/documents') ? styles.activeLink : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
              backgroundColor: !isActive('/documents') && hoveredLink === 'documents' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              color: hoveredLink === 'documents' && !isActive('/documents') ? 'rgb(52, 60, 207)' : isActive('/documents') ? 'rgb(52, 60, 207)' : '#202123'
            }}
            onMouseEnter={() => setHoveredLink('documents')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <img 
              src="/icons/document.svg" 
              alt="文档管理" 
              style={{ 
                width: '16px', 
                height: '16px',
                marginRight: collapsed ? '0' : '10px',
                filter: isActive('/documents') || hoveredLink === 'documents' ? 
                  'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                  'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
                transition: 'filter 0.2s ease'
              }} 
            />
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>文档管理</span>
          </Link>
          <Link 
            to="/meeting" 
            style={{
              ...styles.link,
              ...(isActive('/meeting') ? styles.activeLink : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
              backgroundColor: !isActive('/meeting') && hoveredLink === 'meeting' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              color: hoveredLink === 'meeting' && !isActive('/meeting') ? 'rgb(52, 60, 207)' : isActive('/meeting') ? 'rgb(52, 60, 207)' : '#202123'
            }}
            onMouseEnter={() => setHoveredLink('meeting')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <img 
              src="/icons/meeting.svg" 
              alt="会议室" 
              style={{ 
                width: '16px', 
                height: '16px',
                marginRight: collapsed ? '0' : '10px',
                filter: isActive('/meeting') || hoveredLink === 'meeting' ? 
                  'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                  'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
                transition: 'filter 0.2s ease'
              }} 
            />
            <span style={{
              ...styles.linkText,
              display: collapsed ? 'none' : 'block'
            }}>会议室</span>
          </Link>
        </nav>
        
        <button 
          onClick={handleLogout} 
          className="sidebar-button"
          style={{
            ...styles.logout,
            justifyContent: collapsed ? 'center' : 'flex-start',
            backgroundColor: hoveredLink === 'logout' ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
            color: hoveredLink === 'logout' ? 'rgb(52, 60, 207)' : '#202123',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={() => setHoveredLink('logout')}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <img 
            src="/icons/quit.svg" 
            alt="退出" 
            style={{ 
              width: '16px', 
              height: '16px',
              filter: hoveredLink === 'logout' ? 
                'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
              transition: 'filter 0.2s ease'
            }} 
          />
          <span style={{
            display: collapsed ? 'none' : 'block'
          }}>退出登录</span>
        </button>
      </aside>

      {/* 主内容区 - 根据页面路径应用不同样式 */}
      <main style={{
        ...styles.content,
        // 如果是会议室页面，应用特殊样式
        ...(isMeetingPage ? {
          backgroundColor: 'transparent',
          background: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderRadius: '0',
          margin: '0',
          padding: '0', // 移除内边距
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        } : {
          // 确保非会议室页面的内容区域可以滚动
          overflowY: 'auto'
        })
      }}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: 'transparent',
    padding: '12px',
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '200px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '16px',
    marginRight: '12px',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 24px)', // 减去wrapper的内边距，使侧边栏与页面等高
    position: 'sticky', // 使侧边栏固定在视口中
    top: '12px', // 与wrapper的内边距相同
  },
  content: {
    flex: 1,
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    margin: '12px',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    height: 'calc(100vh - 38px)', // 与侧边栏等高
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#202123',
    margin: 0,
    transition: 'opacity 0.3s ease, width 0.3s ease',
  },
  collapseButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#202123',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: 'rgba(52, 60, 207, 0.1)',
    color: 'rgb(52, 60, 207)',
    fontWeight: '500',
  },
  linkText: {
    transition: 'opacity 0.3s ease',
  },
  logout: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'left',
    marginTop: 'auto',
    transition: 'all 0.2s ease',
  },
};

export default Layout;
