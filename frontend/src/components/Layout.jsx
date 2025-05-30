import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const agentMenuRef = useRef(null);

  // 添加点击外部关闭下拉框的处理
  useEffect(() => {
    function handleClickOutside(event) {
      if (agentMenuRef.current && !agentMenuRef.current.contains(event.target)) {
        setAgentMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  // 检查当前路径是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  // 检查当前是否在聊天页面
  const isChatPage = location.pathname.includes('/chat');

  // 定义Agent数据
  const agents = [
    { id: 'analyst', name: '需求分析师', icon: '📋', path: 'analyst', color: 'rgb(52, 60, 207)' },
    { id: 'architect', name: '架构设计师', icon: '🏗️', path: 'architect', color: 'rgb(52, 60, 207)' },
    { id: 'developer', name: '开发工程师', icon: '👨‍💻', path: 'developer', color: 'rgb(52, 60, 207)' },
    { id: 'tester', name: '测试工程师', icon: '🧪', path: 'tester', color: 'rgb(52, 60, 207)' },
  ];

  // 检查当前是否在某个Agent的聊天页面
  const isAgentChatActive = (agentPath) => {
    return location.pathname === `/chat/${agentPath}`;
  };

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
          
          {/* 角色对话按钮和下拉菜单 */}
          <div style={{ position: 'relative' }} ref={agentMenuRef}>
            <button 
              onClick={() => setAgentMenuOpen(!agentMenuOpen)}
              className="sidebar-button"
              style={{
                ...styles.link,
                ...(isChatPage ? styles.activeLink : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: !isChatPage && hoveredLink === 'agents' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                color: hoveredLink === 'agents' && !isChatPage ? 'rgb(52, 60, 207)' : isChatPage ? 'rgb(52, 60, 207)' : '#202123',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={() => setHoveredLink('agents')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <img 
                src="/icons/dialogue.svg" 
                alt="角色对话" 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  marginRight: collapsed ? '0' : '10px',
                  filter: isChatPage || hoveredLink === 'agents' ? 
                    'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                    'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
                  transition: 'filter 0.2s ease'
                }} 
              />
              <span style={{
                ...styles.linkText,
                display: collapsed ? 'none' : 'block'
              }}>角色对话</span>
              {!collapsed && (
                <span style={{
                  marginLeft: 'auto',
                  transition: 'transform 0.3s ease',
                  transform: agentMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  fontSize: '12px'
                }}>
                  {agentMenuOpen ? '▲' : '▼'}
                </span>
              )}
            </button>
            
            {/* 角色对话下拉菜单 */}
            {agentMenuOpen && !collapsed && (
              <div style={styles.agentDropdownMenu}>
                {agents.map(agent => (
                  <Link
                    key={agent.id}
                    to={`/chat/${agent.path}`}
                    style={{
                      ...styles.agentMenuItem,
                      ...(isAgentChatActive(agent.path) ? styles.activeAgentMenuItem : {}),
                      backgroundColor: hoveredLink === `agent-${agent.id}` && !isAgentChatActive(agent.path) ? 
                        'rgba(52, 60, 207, 0.05)' : 
                        isAgentChatActive(agent.path) ? 'rgba(52, 60, 207, 0.1)' : 'transparent',
                    }}
                    onClick={() => setAgentMenuOpen(false)}
                    onMouseEnter={() => setHoveredLink(`agent-${agent.id}`)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <div style={{
                      ...styles.agentIcon,
                      backgroundColor: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                        'rgba(52, 60, 207, 0.9)' : 'rgba(52, 60, 207, 0.1)',
                      color: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                        '#fff' : 'rgb(52, 60, 207)',
                    }}>
                      {agent.icon}
                    </div>
                    <div style={styles.agentInfo}>
                      <span style={{
                        ...styles.agentName,
                        color: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                          'rgb(52, 60, 207)' : '#202123',
                      }}>
                        {agent.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* 折叠状态下的弹出菜单 */}
            {agentMenuOpen && collapsed && (
              <div 
                style={{
                  ...styles.agentPopupMenu,
                  left: '60px',
                }}
              >
                <div style={styles.agentMenuHeader}>
                  <h3 style={styles.agentMenuTitle}>选择角色</h3>
                </div>
                <div style={styles.agentMenuContent}>
                  {agents.map(agent => (
                    <Link
                      key={agent.id}
                      to={`/chat/${agent.path}`}
                      style={{
                        ...styles.agentMenuItem,
                        ...(isAgentChatActive(agent.path) ? styles.activeAgentMenuItem : {}),
                        backgroundColor: hoveredLink === `agent-${agent.id}` && !isAgentChatActive(agent.path) ? 
                          'rgba(52, 60, 207, 0.05)' : 
                          isAgentChatActive(agent.path) ? 'rgba(52, 60, 207, 0.1)' : 'transparent',
                      }}
                      onClick={() => setAgentMenuOpen(false)}
                      onMouseEnter={() => setHoveredLink(`agent-${agent.id}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <div style={{
                        ...styles.agentIcon,
                        backgroundColor: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                          'rgba(52, 60, 207, 0.9)' : 'rgba(52, 60, 207, 0.1)',
                        color: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                          '#fff' : 'rgb(52, 60, 207)',
                      }}>
                        {agent.icon}
                      </div>
                      <div style={styles.agentInfo}>
                        <span style={{
                          ...styles.agentName,
                          color: isAgentChatActive(agent.path) || hoveredLink === `agent-${agent.id}` ? 
                            'rgb(52, 60, 207)' : '#202123',
                        }}>
                          {agent.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
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
              marginRight: collapsed ? '0' : '10px',
              filter: hoveredLink === 'logout' ? 
                'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' : 
                'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(30%) contrast(100%)',
              transition: 'filter 0.2s ease'
            }} 
          />
          <span style={{
            ...styles.linkText,
            display: collapsed ? 'none' : 'block'
          }}>退出登录</span>
        </button>
      </aside>

      {/* 主内容区 */}
      <main style={{
        ...styles.content,
        ...((location.pathname === '/meeting' || location.pathname === '/documents' || isChatPage) ? {
          backgroundColor: 'transparent',
          background: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderRadius: '0',
          margin: '0',
          padding: '0',
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '12px',
        } : {})
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
    height: 'calc(100vh - 24px)',
    position: 'sticky',
    top: '12px',
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: '24px',
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    margin: '12px',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    height: 'calc(100vh - 38px)',
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
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#202123',
    transition: 'all 0.2s ease',
    fontSize: '15px',
  },
  activeLink: {
    backgroundColor: 'rgba(52, 60, 207, 0.1)',
    color: 'rgb(52, 60, 207)',
    fontWeight: '500',
  },
  linkText: {
    transition: 'opacity 0.3s ease',
    fontSize: '15px',
  },
  logout: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'left',
    marginTop: 'auto',
    transition: 'all 0.2s ease',
    fontSize: '15px',
  },
  // 下拉菜单样式
  agentDropdownMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '5px',
    marginTop: '5px',
    marginLeft: '25px',
    borderLeft: '1px solid rgba(52, 60, 207, 0.2)',
    animation: 'fadeIn 0.2s ease',
  },
  // 折叠状态下的弹出菜单
  agentPopupMenu: {
    position: 'absolute',
    top: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
    zIndex: 10,
    width: '180px',
    animation: 'fadeIn 0.2s ease',
  },
  agentMenuHeader: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  agentMenuTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#202123',
    margin: 0,
  },
  agentMenuContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '12px',
  },
  agentMenuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#202123',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  },
  activeAgentMenuItem: {
    backgroundColor: 'rgba(52, 60, 207, 0.1)',
    color: 'rgb(52, 60, 207)',
    fontWeight: '500',
  },
  agentIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    marginRight: '10px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    fontSize: '14px',
  },
  agentInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  agentName: {
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'color 0.2s ease',
  },
};

export default Layout;
