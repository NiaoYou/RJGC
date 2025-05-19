import React from 'react';
import AgentCard from '../components/AgentCard';

const agents = [
  { id: 1, name: '需求分析师', role: '负责收集和分析需求', icon: '📋', path: 'analyst' },
  { id: 2, name: '架构设计师', role: '负责系统架构设计', icon: '🏗️', path: 'architect' },
  { id: 3, name: '程序员', role: '负责代码实现与开发', icon: '👨‍💻', path: 'developer' },
  { id: 4, name: '测试工程师', role: '负责软件测试与质量保障', icon: '🧪', path: 'tester' },
];

function Dashboard({ user }) {
  return (
    <div style={styles.container}>
      {/* 顶部欢迎栏 */}
      <header style={styles.header}>
        <h2 style={styles.greeting}>欢迎，{user} 👋</h2>
        <button
          onClick={() => window.location.href = '/'} // 正确返回登录页
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
    padding: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    alignItems: 'center',
  },
  greeting: {
    fontSize: '20px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
};

export default Dashboard;
