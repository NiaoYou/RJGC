import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AgentCard({ agent }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(`/chat/${agent.path}`);
  };

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 6px 20px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
      }} 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        ...styles.iconContainer,
        backgroundColor: '#f7f7f8'
      }}>
        <span style={styles.icon}>{agent.icon}</span>
      </div>
      <div style={styles.content}>
        <h3 style={styles.name}>{agent.name}</h3>
        <p style={styles.role}>{agent.role}</p>
      </div>
      <span style={styles.arrow}>→</span>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e5e5',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '16px',
  },
  icon: {
    fontSize: '20px',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#000000',
  },
  role: {
    fontSize: '14px',
    color: '#444654',
    margin: 0,
  },
  arrow: {
    fontSize: '16px',
    opacity: 0.5,
    marginLeft: '8px',
  }
};

export default AgentCard;
