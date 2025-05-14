import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgentCard from '../components/AgentCard';

const agents = [
  { id: 1, name: '前端工程师', role: '负责界面与交互设计', icon: '🖼️', path: 'frontend' },
  { id: 2, name: '后端工程师', role: '负责服务器与数据库逻辑', icon: '🖥️', path: 'backend' },
  { id: 3, name: '测试工程师', role: '负责功能测试与质量保障', icon: '🧪', path: 'qa' },
  { id: 4, name: '架构师', role: '负责系统整体架构设计', icon: '🧠', path: 'architect' },
];

function Dashboard({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 这里可以加清除本地状态/存储的逻辑（可选）
    navigate('/'); // 跳转到登录页
  };

  return (
    <div style={styles.container}>
      {/* 顶部欢迎栏 */}
      <header style={styles.header}>
        <h2 style={styles.greeting}>欢迎，{user} 👋</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 退出登录
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
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  greeting: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
};

export default Dashboard;
