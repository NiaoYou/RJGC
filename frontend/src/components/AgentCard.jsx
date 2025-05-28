import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AgentCard({ agent }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onClick={() => navigate(`/chat/${agent.path}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.1)' : styles.card.boxShadow,
        borderColor: isHovered ? 'rgb(52, 60, 207)' : '#e5e5e5',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        ...styles.iconContainer,
        backgroundColor: isHovered ? 'rgb(52, 60, 207)' : 'rgba(58, 60, 102, 0.1)', // 使用登录页面的蓝紫色
        color: isHovered ? '#ffffff' : 'rgb(52, 60, 207)',
      }}>
        <span style={styles.icon}>{agent.icon}</span>
      </div>
      <div style={styles.content}>
        <h3 style={styles.name}>{agent.name}</h3>
        <p style={styles.role}>{agent.role}</p>
      </div>
      <span style={{
        ...styles.arrow,
        opacity: isHovered ? 1 : 0.5,
        color: isHovered ? 'rgb(52, 60, 207)' : 'inherit',
      }}>→</span>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e5e5e5',
    padding: '16px 25px',
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
