import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';

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

const agentOrder = ['analyst', 'architect', 'developer', 'tester'];

function ChatPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const current = history[roleId] || [];

    const index = agentOrder.indexOf(roleId);
    const previousRole = index > 0 ? agentOrder[index - 1] : null;
    const previous = previousRole ? history[previousRole] || [] : [];

    const contextMessages = previous.length
      ? [
          { sender: 'bot', text: `🧠 以下是 "${previousRole}" 的最后对话：`, fromPrevious: true },
          ...previous.slice(-3).map(m => ({ ...m, fromPrevious: true }))
        ]
      : [];

    setMessages([...contextMessages, ...current]);
  }, [roleId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveToLocalStorage = (msgs) => {
    const all = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const filtered = msgs.filter(m => !m.fromPrevious);
    all[roleId] = filtered;
    localStorage.setItem('chat_history', JSON.stringify(all));
  };

  const getPreviousSummary = () => {
    const all = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const idx = agentOrder.indexOf(roleId);
    if (idx <= 0) return '';
    const prevRole = agentOrder[idx - 1];
    const prevMsgs = all[prevRole] || [];
    const summary = prevMsgs.slice(-3).map(m =>
      `${m.sender === 'user' ? '用户' : 'AI'}：${m.text}`
    ).join('\n');
    return `# 上一个角色 (${prevRole}) 对话摘要：\n${summary}\n`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const loadingMessage = { sender: 'bot', text: '思考中...', loading: true };

    const updated = [...messages, userMessage, loadingMessage];
    setMessages(updated);
    setInput('');

    try {
      const config = agentConfigs[roleId];
      const context = getPreviousSummary();
      const fullInput = context ? `${context}\n当前输入：${input}` : input;

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.bodyField]: fullInput }),
      });

      const data = await response.json();
      const replyText = data[config.responseField] || '（无返回内容）';

      const final = [...messages, userMessage, { sender: 'bot', text: replyText }];
      setMessages(final);
      saveToLocalStorage(final);
    } catch (err) {
      const error = { sender: 'bot', text: '⚠️ 服务器错误，请稍后再试。' };
      const final = [...messages, userMessage, error];
      setMessages(final);
      saveToLocalStorage(final);
    }
  };

  const handleClear = () => {
    const all = JSON.parse(localStorage.getItem('chat_history') || '{}');
    delete all[roleId];
    localStorage.setItem('chat_history', JSON.stringify(all));
    setMessages([]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← 返回</button>
          <h2 style={styles.title}>与 {roleId} 对话</h2>
          <button onClick={handleClear} style={styles.clearBtn}>🗑 清除</button>
        </div>

        <div style={styles.messages}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.fromPrevious ? '#e0e0e0' : (msg.sender === 'user' ? '#007bff' : '#eee'),
                color: msg.sender === 'user' ? '#fff' : '#000',
                fontStyle: msg.fromPrevious ? 'italic' : 'normal',
              }}
            >
              {msg.sender === 'bot' && !msg.loading && !msg.fromPrevious ? (
                <div dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
              ) : (
                msg.text
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div style={styles.inputArea}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入消息..."
            style={styles.input}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} style={styles.sendBtn}>发送</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: '#f4f6f8',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBox: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#ccc',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  clearBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  },
  message: {
    padding: '10px 14px',
    borderRadius: '10px',
    maxWidth: '80%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
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
  },
  sendBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default ChatPage;
