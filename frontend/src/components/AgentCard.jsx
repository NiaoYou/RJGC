import React from 'react';
import { useNavigate } from 'react-router-dom';

function AgentCard({ agent }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${agent.path}`);
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <div style={styles.icon}>{agent.icon}</div>
      <h3 style={styles.name}>{agent.name}</h3>
      <p style={styles.role}>{agent.role}</p>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  icon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  name: {
    fontSize: '18px',
    margin: '8px 0',
  },
  role: {
    fontSize: '14px',
    color: '#555',
  },
};

export default AgentCard;
