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
  // const handleSend = () => {
  //   if (!input.trim()) return;
  //   const newMessage = { sender: 'user', text: input };
  //   const updatedMessages = [...messages, newMessage];
  //   setMessages(updatedMessages);
  //   saveToLocalStorage(updatedMessages);
  //
  //   // 模拟 Agent 回复
  //   setTimeout(() => {
  //     const reply = { sender: 'bot', text: `收到「${input}」，我会处理。` };
  //     const finalMessages = [...updatedMessages, reply];
  //     setMessages(finalMessages);
  //     saveToLocalStorage(finalMessages);
  //   }, 500);
  //
  //   setInput('');
  // };


  // 未修改-只能调用需求分析、只有需求分析一个参数
  // const getApiEndpoint = (roleId) => {
  //   switch (roleId) {
  //     case 'analyst':
  //       return 'http://localhost:8000/api/requirementgen/';
  //     case 'architect':
  //       return 'http://localhost:8000/api/architecture/';
  //     case 'developer':
  //       return 'http://localhost:8000/api/codegen/';
  //     case 'tester':
  //       return 'http://localhost:8000/api/test/';
  //     default:
  //       return '';
  //   }
  // };
  //
  // const handleSend = async () => {
  //   if (!input.trim()) return;
  //
  //   const newMessage = { sender: 'user', text: input };
  //   const updatedMessages = [...messages, newMessage];
  //   setMessages(updatedMessages);
  //   saveToLocalStorage(updatedMessages);
  //   setInput('');
  //
  //   try {
  //     const endpoint = getApiEndpoint(roleId);
  //     if (!endpoint) throw new Error('无效角色');
  //
  //     const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ topic: input }),
  //     });
  //
  //     if (!response.ok) throw new Error('后端返回错误');
  //
  //     const data = await response.json();
  //     const reply = {
  //       sender: 'bot',
  //       text: data.requirement || data.architecture || data.code || data.test || '无内容返回',
  //     };
  //     const finalMessages = [...updatedMessages, reply];
  //     setMessages(finalMessages);
  //     saveToLocalStorage(finalMessages);
  //   } catch (err) {
  //     const errorReply = {
  //       sender: 'bot',
  //       text: '服务器错误，请稍后再试。',
  //     };
  //     const finalMessages = [...updatedMessages, errorReply];
  //     setMessages(finalMessages);
  //     saveToLocalStorage(finalMessages);
  //   }
  // };


    const agentConfigs = {
    analyst: {
      endpoint: 'http://localhost:8000/api/requirementgen/',
      bodyField: 'topic',
      responseField: 'requirement',
    },
    architect: {
      endpoint: 'http://localhost:8000/api/architecture/',
      bodyField: 'requirement_text',
      responseField: 'architecture',
    },
    developer: {
      endpoint: 'http://localhost:8000/api/codegen/',
      bodyField: 'module_description',
      responseField: 'code',
    },
    tester: {
      endpoint: 'http://localhost:8000/api/test/',
      bodyField: 'code',
      responseField: 'test',
    },
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveToLocalStorage(updatedMessages);
    setInput('');

    try {
      const config = agentConfigs[roleId];
      if (!config) throw new Error('无效角色');

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.bodyField]: input }),
      });

      if (!response.ok) throw new Error('后端返回错误');

      const data = await response.json();
      const reply = {
        sender: 'bot',
        text: data[config.responseField] || '无内容返回',
      };

      const finalMessages = [...updatedMessages, reply];
      setMessages(finalMessages);
      saveToLocalStorage(finalMessages);
    } catch (err) {
      const errorReply = {
        sender: 'bot',
        text: '服务器错误，请稍后再试。',
      };
      const finalMessages = [...updatedMessages, errorReply];
      setMessages(finalMessages);
      saveToLocalStorage(finalMessages);
    }
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
