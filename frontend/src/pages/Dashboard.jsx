import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentCard from '../components/AgentCard';
import './Dashboard.css';

const agents = [
  { id: 1, name: '需求分析师', role: '负责收集和分析需求', icon: '📋', path: 'analyst', color: 'rgb(52, 60, 207)' },
  { id: 2, name: '架构设计师', role: '负责系统架构设计', icon: '🏗️', path: 'architect', color: 'rgb(52, 60, 207)' },
  { id: 3, name: '开发工程师', role: '负责代码实现与开发', icon: '👨‍💻', path: 'developer', color: 'rgb(52, 60, 207)' },
  { id: 4, name: '测试工程师', role: '负责软件测试与质量保障', icon: '🧪', path: 'tester', color: 'rgb(52, 60, 207)' },
];

const examplePrompts = [
  // 第一行 - 从右向左
  [
    "帮我分析一个电商网站的需求",
    "设计一个博客系统的架构",
    "编写一个用户登录的API",
    "为购物车功能设计测试用例",
    "开发一个在线教育平台",
    "设计一个移动应用的界面",
    "编写数据库查询语句",
    "设计RESTful API接口"
  ],
  // 第二行 - 从左向右
  [
    "为我的项目创建CI/CD流程",
    "编写一个聊天应用的后端",
    "设计一个响应式网页布局",
    "为我的项目实现用户认证功能",
    "开发一个直播购物平台",
    "设计一个微服务架构",
    "编写单元测试用例",
    "优化数据库查询性能"
  ],
];

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMeetingBtnHovered, setIsMeetingBtnHovered] = useState(false);
  const [hoveredPrompts, setHoveredPrompts] = useState({});
  const [activePane, setActivePane] = useState(0);
  const slidesRef = useRef(null);

  // 移除可能影响滚动的 useEffect
  // useEffect(() => {
  //   // 确保进入仪表盘时允许整页滚动
  //   document.body.style.overflow = 'auto';
  //   document.documentElement.style.overflow = 'auto';
  //   document.body.classList.remove('meeting-page');
  //   
  //   // 移除内容区域的滚动限制
  //   const contentElement = document.querySelector('.content');
  //   if (contentElement) {
  //     contentElement.style.overflowY = 'visible';
  //   }
  // }, []);

  // 处理提示悬停
  const handlePromptHover = (rowIndex, promptIndex, isHovering) => {
    setHoveredPrompts(prev => ({
      ...prev,
      [`${rowIndex}-${promptIndex}`]: isHovering
    }));
  };

  // 处理窗格切换
  const handlePaneChange = (index) => {
    setActivePane(index);
    if (slidesRef.current) {
      slidesRef.current.scrollTo({
        left: index * slidesRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // 处理滑动
  const handleScroll = () => {
    if (slidesRef.current) {
      const scrollPosition = slidesRef.current.scrollLeft;
      const paneWidth = slidesRef.current.offsetWidth;
      const newActivePane = Math.round(scrollPosition / paneWidth);
      if (newActivePane !== activePane) {
        setActivePane(newActivePane);
      }
    }
  };

  // 处理箭头导航
  const handleArrowClick = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(activePane + 1, 2) // 只增加一个索引，最大为2
      : Math.max(activePane - 1, 0); // 只减少一个索引，最小为0
    handlePaneChange(newIndex);
  };

  return (
    <div style={{
      // 移除这个背景设置
      // position: 'absolute',
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      // background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(102, 121, 245, 0.22) 100%)',
      // zIndex: -1, // 确保它在内容后面
    }}>
      <div style={styles.container}>
        {/* 上半部分 - 水平滚动窗格 */}
        <div style={{...styles.slidesContainer}}>
          {/* 左箭头 */}
          <button 
            style={{
              ...styles.arrowButton, 
              left: 10,
              opacity: activePane === 0 ? 0.3 : 1,
              pointerEvents: activePane === 0 ? 'none' : 'auto'
            }}
            onClick={() => handleArrowClick('prev')}
          >
            ←
          </button>
          
          {/* 右箭头 */}
          <button 
            style={{
              ...styles.arrowButton, 
              right: 10,
              opacity: activePane === 2 ? 0.3 : 1,
              pointerEvents: activePane === 2 ? 'none' : 'auto'
            }}
            onClick={() => handleArrowClick('next')}
          >
            →
          </button>
          
          {/* 指示器 */}
          <div style={styles.indicators}>
            {[0, 1, 2].map(index => (
              <button
                key={index}
                style={{
                  ...styles.indicator,
                  backgroundColor: activePane === index ? 'rgb(52, 60, 207)' : '#e5e5e5'
                }}
                onClick={() => handlePaneChange(index)}
              />
            ))}
          </div>
          
          {/* 滚动窗格容器 */}
          <div 
            ref={slidesRef}
            style={styles.slides}
            onScroll={handleScroll}
          >
            {/* 窗格1 - 欢迎信息 */}
            <div style={styles.pane}>
              <header style={styles.header}>
                <h1 style={styles.heroTitle}>
                  AI驱动开发&nbsp;&nbsp;&nbsp;&nbsp;智能协作
                </h1>
                <p style={styles.heroSubtitle}>
                  DevHub&nbsp;&nbsp;让软件开发更简单高效<br />需求分析&nbsp;&nbsp;架构设计&nbsp;&nbsp;编码实现&nbsp;&nbsp;测试部署<br />AI助手全程协作&nbsp;&nbsp;助您快速完成项目
                </p>
                <button 
                  onClick={() => navigate('/meeting')} 
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="dashboard-button"
                  style={{
                    backgroundColor: 'rgb(52, 60, 207)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isHovered ? '0 6px 20px rgba(0, 0, 0, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  立即开始 →
                </button>
              </header>
            </div>
            
            {/* 窗格2 - 角色卡片 */}
            <div style={styles.pane}>
              <h2 className="section-title section-title-centered">选择角色&nbsp;&nbsp;开始对话</h2>
              <div style={styles.grid}>
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
            
            {/* 窗格3 - 会议室卡片 */}
            <div style={styles.pane}>
              <h2 className="section-title section-title-centered">团队协作</h2>
              <div style={{
                ...styles.meetingCard,
                boxShadow: isMeetingBtnHovered ? '0 6px 20px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // 内容居中
                justifyContent: 'center', // 内容居中
                textAlign: 'center', // 文本居中
                maxWidth: '500px', // 限制最大宽度
                margin: '0 auto', // 水平居中
                width: '80%' // 设置为容器宽度的80%
              }}>
                <div style={{
                  ...styles.meetingCardContent,
                  display: 'flex',
                  flexDirection: 'column', // 改为纵向排列
                  alignItems: 'center', // 内容居中
                  gap: '16px',
                  width: '100%' // 确保内容宽度为100%
                }}>
                  <div style={styles.meetingIcon}>🏢</div>
                  <div style={{
                    ...styles.meetingInfo,
                    textAlign: 'center' // 文本居中
                  }}>
                    <h3 style={styles.meetingTitle}>项目会议室</h3>
                    <p style={styles.meetingDesc}>所有角色在同一个会话中协作，自动化整个开发流程</p>
                  </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px'}}>
                  <button 
                    onClick={() => navigate('/meeting')} 
                    onMouseEnter={() => setIsMeetingBtnHovered(true)}
                    onMouseLeave={() => setIsMeetingBtnHovered(false)}
                    className="dashboard-button"
                    style={{
                      backgroundColor: 'rgb(52, 60, 207)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transform: isMeetingBtnHovered ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isMeetingBtnHovered ? '0 6px 20px rgba(0, 0, 0, 0.2)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    进入会议室 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 下半部分 - 示例提示 (移除标题) */}
        <section style={{...styles.section, marginTop: '30px'}}>
          <div className="scrolling-prompts-container">
            {examplePrompts.map((row, rowIndex) => (
              <div 
                key={rowIndex} 
                className={`scrolling-prompts-row ${rowIndex % 2 === 1 ? 'reverse' : ''}`}
                style={{marginBottom: rowIndex === 0 ? '10px' : '0px'}}
              >
                <div className="scrolling-prompts-track">
                  {/* 第一组提示 */}
                  {row.map((prompt, promptIndex) => (
                    <div 
                      key={promptIndex}
                      className={`scrolling-prompt ${hoveredPrompts[`${rowIndex}-${promptIndex}`] ? 'paused' : ''}`}
                      onMouseEnter={() => handlePromptHover(rowIndex, promptIndex, true)}
                      onMouseLeave={() => handlePromptHover(rowIndex, promptIndex, false)}
                      onClick={() => navigate('/meeting')}
                      style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
                    >
                      <span>{prompt}</span>
                      <span className="prompt-arrow">→</span>
                    </div>
                  ))}
                  {/* 第二组提示（完全相同的复制） */}
                  {row.map((prompt, promptIndex) => (
                    <div 
                      key={`duplicate-${promptIndex}`}
                      className={`scrolling-prompt ${hoveredPrompts[`${rowIndex}-${promptIndex}`] ? 'paused' : ''}`}
                      onMouseEnter={() => handlePromptHover(rowIndex, promptIndex, true)}
                      onMouseLeave={() => handlePromptHover(rowIndex, promptIndex, false)}
                      onClick={() => navigate('/meeting')}
                      style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}
                    >
                      <span>{prompt}</span>
                      <span className="prompt-arrow">→</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 0',
    minHeight: 'calc(100vh - 24px)', // 减去wrapper的内边距
    // 确保这里没有背景定义
    background: 'transparent',
  },
  slidesContainer: {
    position: 'relative',
    marginBottom: '60px',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  slides: {
    display: 'flex',
    width: '100%',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    '&::-webkit-scrollbar': { // Chrome/Safari/Opera
      display: 'none',
    },
  },
  pane: {
    flex: '0 0 100%',
    scrollSnapAlign: 'start',
    padding: '40px',
    boxSizing: 'border-box',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  indicators: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 10,
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  header: {
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '44px',
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    marginBottom: '24px',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#444654',
    maxWidth: '600px',
    margin: '0 auto 32px',
  },
  section: {
    marginBottom: '48px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(auto, 300px))', // 限制每列最大宽度为300px
    gap: '16px',
    justifyContent: 'center', // 网格在容器中居中
  },
  meetingCard: {
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'box-shadow 0.2s',
  },
  meetingCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  meetingIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#f7f7f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  meetingDesc: {
    fontSize: '14px',
    color: '#444654',
    margin: 0,
  },
};

export default Dashboard;
