import React from 'react';
import { useNavigate } from 'react-router-dom';

function AgentCard({ agent }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/chat/${agent.path}`)}
      style={styles.card}
    >
      <div style={styles.icon}>{agent.icon}</div>
      <h3 style={styles.name}>{agent.name}</h3>
      <p style={styles.role}>{agent.role}</p>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    width: '220px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '42px',
    marginBottom: '12px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '4px 0',
  },
  role: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
};

export default AgentCard;
