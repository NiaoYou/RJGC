import React from 'react';
import { useNavigate } from 'react-router-dom';

function AgentCard({ agent }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${agent.path}`);
  };

  return (
    <div 
      style={{
        ...styles.card,
        borderTop: `4px solid ${agent.color || '#3498db'}`
      }} 
      onClick={handleClick}
    >
      <div style={{
        ...styles.iconContainer,
        backgroundColor: agent.color || '#3498db'
      }}>
        <span style={styles.icon}>{agent.icon}</span>
      </div>
      <h3 style={styles.name}>{agent.name}</h3>
      <p style={styles.role}>{agent.role}</p>
      <button style={{
        ...styles.chatButton,
        backgroundColor: agent.color || '#3498db'
      }}>
        开始对话
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #eee',
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
  },
  icon: {
    fontSize: '28px',
    color: 'white',
  },
  name: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#333',
  },
  role: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px 0',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  chatButton: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: 'auto',
  },
};

export default AgentCard;
