import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ChatPage() {
  const { roleId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // 加载历史记录
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '{}');
    setMessages(history[roleId] || []);
  }, [roleId]);

  // 更新 localStorage
  const saveToLocalStorage = (newMessages) => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '{}');
    history[roleId] = newMessages;
    localStorage.setItem('chat_history', JSON.stringify(history));
  };

  // 发送消息
  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveToLocalStorage(updatedMessages);

    // 模拟 Agent 回复
    setTimeout(() => {
      const reply = { sender: 'bot', text: `收到「${input}」，我会处理。` };
      const finalMessages = [...updatedMessages, reply];
      setMessages(finalMessages);
      saveToLocalStorage(finalMessages);
    }, 500);

    setInput('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        <h2 style={styles.title}>与 {roleId} 对话</h2>
        <div style={styles.messages}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ ...styles.message, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? '#007bff' : '#eee', color: msg.sender === 'user' ? '#fff' : '#000' }}>
              {msg.text}
            </div>
          ))}
        </div>
        <div style={styles.inputArea}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入消息..."
            style={styles.input}
          />
          <button onClick={handleSend} style={styles.sendBtn}>发送</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f4f7fa',
  },
  chatBox: {
    width: '500px',
    height: '600px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
  },
  message: {
    maxWidth: '80%',
    padding: '10px 15px',
    borderRadius: '16px',
    fontSize: '14px',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default ChatPage;
