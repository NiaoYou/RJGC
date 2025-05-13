import React from 'react';
import AgentCard from '../components/AgentCard';
const agents = [
  { id: 1, name: '前端工程师', role: '负责界面与交互设计', icon: '🖼️' },
  { id: 2, name: '后端工程师', role: '负责服务器与数据库逻辑', icon: '🖥️' },
  { id: 3, name: '测试工程师', role: '负责功能测试与质量保障', icon: '🧪' },
  { id: 4, name: '架构师', role: '负责系统整体架构设计', icon: '🧠' },
];


function Dashboard({ user }) {
  return (
    <div style={styles.container}>
      {/* 顶部欢迎栏 */}
      <header style={styles.header}>
        <h2 style={styles.greeting}>欢迎，{user} 👋</h2>
        <button
          onClick={() => window.location.reload()} // 暂时代替 logout
          style={styles.logoutBtn}
        >
          退出登录
        </button>
      </header>

      {/* 主内容 */}
      <div style={styles.grid}>
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    background: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: '#fff',
    padding: '16px 24px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  greeting: {
    margin: 0,
    color: '#333',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
};

export default Dashboard;
