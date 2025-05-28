import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import './MeetingRoom.css';

const agents = [
  { id: 'analyst', name: '需求分析师', avatar: '👨‍💼', color: '#4285F4' },
  { id: 'architect', name: '系统架构师', avatar: '👩‍💻', color: '#EA4335' },
  { id: 'developer', name: '开发工程师', avatar: '👨‍🔧', color: '#34A853' },
  { id: 'tester', name: '测试工程师', avatar: '🧪', color: '#FBBC05' }
];

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

function MeetingRoom() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    // 加载历史记录或显示欢迎消息
    const history = JSON.parse(localStorage.getItem('meeting_history') || '[]');
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([
        {
          sender: 'system',
          text: '👋 欢迎来到项目会议室！请描述您的项目需求，所有团队成员将依次参与讨论。',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveToLocalStorage = (msgs) => {
    localStorage.setItem('meeting_history', JSON.stringify(msgs));
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveToLocalStorage(updatedMessages);
    setInput('');
    setIsProcessing(true);

    // 启动Agent流程
    await startAgentFlow(updatedMessages);
  };

  const startAgentFlow = async (currentMessages) => {
    let msgs = [...currentMessages];
    
    // 依次让每个Agent发言
    for (const agent of agents) {
      setCurrentAgent(agent.id);
      
      // 添加"正在思考"消息
      const thinkingMsg = {
        sender: agent.id,
        text: `${agent.avatar} 正在思考...`,
        timestamp: new Date().toISOString(),
        thinking: true
      };
      
      msgs = [...msgs, thinkingMsg];
      setMessages(msgs);
      
      // 调用API获取回复
      try {
        const config = agentConfigs[agent.id];
        
        // 获取所有历史消息作为上下文
        const context = msgs
          .filter(m => !m.thinking)
          .map(m => {
            const sender = m.sender === 'user' ? '用户' : 
                          m.sender === 'system' ? '系统' : 
                          agents.find(a => a.id === m.sender)?.name || m.sender;
            return `${sender}: ${m.text}`;
          })
          .join('\n\n');
        
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [config.bodyField]: context }),
        });

        const data = await response.json();
        const replyText = data[config.responseField] || '（无返回内容）';

        // 替换"正在思考"为实际回复
        msgs = msgs.filter(m => !(m.sender === agent.id && m.thinking));
        const agentMsg = {
          sender: agent.id,
          text: replyText,
          timestamp: new Date().toISOString()
        };
        
        msgs = [...msgs, agentMsg];
        setMessages(msgs);
        saveToLocalStorage(msgs);
        
        // 等待一小段时间，让用户有时间阅读
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.error(`${agent.id} 处理失败:`, err);
        
        // 替换"正在思考"为错误消息
        msgs = msgs.filter(m => !(m.sender === agent.id && m.thinking));
        const errorMsg = {
          sender: agent.id,
          text: `⚠️ 抱歉，我在处理时遇到了问题。`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        msgs = [...msgs, errorMsg];
        setMessages(msgs);
        saveToLocalStorage(msgs);
      }
    }
    
    setCurrentAgent(null);
    setIsProcessing(false);
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有会议记录吗？')) {
      localStorage.removeItem('meeting_history');
      setMessages([
        {
          sender: 'system',
          text: '👋 会议记录已清除。请描述您的新项目需求。',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(idx);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getSenderInfo = (senderId) => {
    if (senderId === 'user') return { name: '您', avatar: '👤', color: '#007bff' };
    if (senderId === 'system') return { name: '系统', avatar: '🤖', color: '#6c757d' };
    return agents.find(a => a.id === senderId) || { name: senderId, avatar: '👾', color: '#6c757d' };
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <span className="back-arrow">←</span> 返回
          </button>
          <h2 style={styles.title}>项目会议室</h2>
          <button onClick={handleClear} style={styles.clearBtn}>🗑 清除</button>
        </div>

        <div style={styles.agentBar}>
          {agents.map(agent => (
            <div 
              key={agent.id} 
              style={{
                ...styles.agentIcon,
                backgroundColor: agent.color,
                opacity: currentAgent === agent.id ? 1 : 0.6,
                transform: currentAgent === agent.id ? 'scale(1.1)' : 'scale(1)'
              }}
              title={agent.name}
            >
              {agent.avatar}
            </div>
          ))}
        </div>

        <div style={styles.messages}>
          {messages.map((msg, idx) => {
            const sender = getSenderInfo(msg.sender);
            return (
              <div key={idx} style={styles.messageContainer}>
                {msg.sender !== 'user' && (
                  <div style={{...styles.avatar, backgroundColor: sender.color}}>
                    {sender.avatar}
                  </div>
                )}
                <div
                  style={{
                    ...styles.message,
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'user' ? '#007bff' : 
                                    msg.sender === 'system' ? '#6c757d' : 
                                    msg.thinking ? '#f8f9fa' : 
                                    msg.isError ? '#dc3545' : 
                                    sender.color + '22', // 使用代理颜色的透明版本
                    color: msg.sender === 'user' || msg.sender === 'system' ? '#fff' : '#000',
                    borderLeft: msg.sender !== 'user' && msg.sender !== 'system' ? `4px solid ${sender.color}` : 'none',
                    opacity: msg.thinking ? 0.8 : 1,
                  }}
                >
                  {msg.sender !== 'user' && !msg.thinking && (
                    <div style={styles.senderName}>{sender.name}</div>
                  )}
                  
                  {msg.thinking ? (
                    <div>{msg.text}</div>
                  ) : (
                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
                  )}
                  
                  {!msg.thinking && (
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      style={{
                        ...styles.copyButton,
                        color: msg.sender === 'user' || msg.sender === 'system' ? '#fff' : '#000'
                      }}
                      title="复制内容"
                    >
                      {copiedId === idx ? '✓' : '📋'}
                    </button>
                  )}
                  
                  <div style={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div style={{...styles.avatar, backgroundColor: sender.color}}>
                    {sender.avatar}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isProcessing ? "请等待所有团队成员回复..." : "请输入您的项目需求..."}
            style={styles.input}
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
          />
          <button 
            onClick={handleSend} 
            style={{
              ...styles.sendBtn,
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '发送'}
          </button>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  chatBox: {
    width: '90%',
    maxWidth: '1000px',
    height: '90vh',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
  },
  backBtn: {
    backgroundColor: '#f0f0f0',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'inherit',
  },
  title: {
    margin: 0,
    fontSize: '20px',
  },
  clearBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  agentBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  agentIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    transition: 'all 0.3s ease',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  message: {
    padding: '14px 18px',
    borderRadius: '10px',
    maxWidth: 'calc(100% - 100px)',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    lineHeight: '1.5',
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '13px',
  },
  timestamp: {
    position: 'absolute',
    bottom: '2px',
    right: '8px',
    fontSize: '10px',
    opacity: 0.6,
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
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '15px 20px',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    resize: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0 20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default MeetingRoom;