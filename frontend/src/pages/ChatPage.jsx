import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import './ChatPage.css';

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
  const [copiedId, setCopiedId] = useState(null);
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
      // 检查是否是简单问候
      const greetings = ['你好', '您好', 'hello', 'hi', '嗨'];
      if (greetings.some(greeting => input.toLowerCase().includes(greeting.toLowerCase()))) {
        const roleGreetings = {
          analyst: '你好！我是需求分析师。请告诉我你想要开发的系统或功能，我会帮你分析并生成详细需求。',
          architect: '你好！我是系统架构师。请描述你的系统需求，我会为你设计合适的架构和数据库方案。',
          developer: '你好！我是开发工程师。请描述你需要实现的模块功能，我会为你生成相应的代码。',
          tester: '你好！我是测试工程师。请提供你需要测试的代码，我会为你生成测试用例。'
        };
        
        const replyText = roleGreetings[roleId] || '你好！请告诉我你需要什么帮助？';
        const final = [...messages, userMessage, { sender: 'bot', text: replyText }];
        setMessages(final);
        saveToLocalStorage(final);
        return;
      }

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

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(idx);
      setTimeout(() => setCopiedId(null), 2000); // 2秒后重置复制状态
    });
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
                position: 'relative', // 添加相对定位
              }}
            >
              {msg.sender === 'bot' && !msg.loading && !msg.fromPrevious ? (
                <>
                  <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
                  <button 
                    onClick={() => handleCopy(msg.text, idx)}
                    style={styles.copyButton}
                    title="复制内容"
                  >
                    {copiedId === idx ? '✓' : '📋'}
                  </button>
                </>
              ) : (
                <>
                  {msg.text}
                  {msg.sender === 'user' && (
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      style={{...styles.copyButton, color: '#fff'}}
                      title="复制内容"
                    >
                      {copiedId === idx ? '✓' : '📋'}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入消息..."
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
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
    maxHeight: '60vh', // 增加最大高度
  },
  message: {
    padding: '14px 18px', // 增加上下左右内边距
    borderRadius: '10px',
    maxWidth: '80%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    lineHeight: '1.5', // 增加行高
    overflowX: 'auto',
    maxHeight: '400px',
    overflowY: 'auto',
    minHeight: '24px', // 添加最小高度确保气泡不会太矮
    position: 'relative', // 添加相对定位
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
    resize: 'vertical', // 允许垂直调整大小
    minHeight: '60px',  // 最小高度
    fontFamily: 'inherit', // 继承字体
  },
  sendBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  copyButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '12px',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 1
    }
  },
};

export default ChatPage;
