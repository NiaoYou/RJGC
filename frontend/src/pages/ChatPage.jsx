import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const roleConfig = {
  frontend: { name: '前端工程师', icon: '🖼️' },
  backend: { name: '后端工程师', icon: '🖥️' },
  qa: { name: '测试工程师', icon: '🧪' },
  architect: { name: '架构师', icon: '🧠' },
};

function ChatPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'agent', text: '你好，有什么问题需要我帮忙？' },
  ]);

  const role = roleConfig[roleId] || { name: '未知角色', icon: '❓' };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
    // 这里可以接入 ChatGPT 接口
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← 返回</button>
        <h2>{role.icon} {role.name}</h2>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={msg.from === 'user' ? styles.userMsg : styles.agentMsg}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的问题..."
        />
        <button style={styles.sendBtn} onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    height: '100vh',
    background: '#f1f3f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 0 6px rgba(0,0,0,0.05)',
    marginBottom: '12px',
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: '#d1e7dd',
    padding: '10px 14px',
    borderRadius: '18px',
    marginBottom: '8px',
    maxWidth: '70%',
    textAlign: 'right',
  },
  agentMsg: {
    alignSelf: 'flex-start',
    background: '#e2e3e5',
    padding: '10px 14px',
    borderRadius: '18px',
    marginBottom: '8px',
    maxWidth: '70%',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  sendBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default ChatPage;
