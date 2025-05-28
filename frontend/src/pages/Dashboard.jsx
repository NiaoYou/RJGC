import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgentCard from '../components/AgentCard';

const agents = [
  { id: 1, name: '需求分析师', role: '负责收集和分析需求', icon: '📋', path: 'analyst', color: '#3498db' },
  { id: 2, name: '架构设计师', role: '负责系统架构设计', icon: '🏗️', path: 'architect', color: '#2ecc71' },
  { id: 3, name: '程序员', role: '负责代码实现与开发', icon: '👨‍💻', path: 'developer', color: '#e74c3c' },
  { id: 4, name: '测试工程师', role: '负责软件测试与质量保障', icon: '🧪', path: 'tester', color: '#f39c12' },
];

function Dashboard({ user }) {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* 顶部欢迎栏 */}
      <header style={styles.header}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.greeting}>欢迎回来，{user || '管理员'} 👋</h1>
          <p style={styles.subGreeting}>今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* 角色卡片部分 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>选择角色开始对话</h2>
        <div style={styles.grid}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
      
      {/* 会议室卡片 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>团队协作</h2>
        <div style={styles.meetingCard}>
          <div style={styles.meetingCardContent}>
            <div style={styles.meetingIcon}>🏢</div>
            <div style={styles.meetingInfo}>
              <h3 style={styles.meetingTitle}>项目会议室</h3>
              <p style={styles.meetingDesc}>所有角色在同一个会话中协作，自动化整个开发流程</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/meeting')} 
            style={styles.meetingButton}
          >
            进入会议室
          </button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '30px',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  greeting: {
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
  },
  subGreeting: {
    fontSize: '16px',
    opacity: 0.8,
    margin: 0,
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
    position: 'relative',
    paddingLeft: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  meetingCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid #eee',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  meetingCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  meetingIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    backgroundColor: '#8e44ad',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    color: 'white',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#333',
  },
  meetingDesc: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: 1.5,
  },
  meetingButton: {
    backgroundColor: '#8e44ad',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    alignSelf: 'flex-end',
  },
};

export default Dashboard;
