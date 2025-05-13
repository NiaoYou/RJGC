import React from 'react';

function AgentCard({ agent }) {
  return (
    <div style={styles.card}>
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
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '40px',
  },
  name: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  role: {
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default AgentCard;
