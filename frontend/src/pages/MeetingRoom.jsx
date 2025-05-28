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
    responseField: 'test_code',
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
    // 保存原始滚动状态
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // 进入会议室页面时修改滚动行为
    document.body.classList.add('meeting-page');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // 离开会议室页面时恢复原始状态
    return () => {
      document.body.classList.remove('meeting-page');
      document.body.style.overflow = 'auto'; // 确保返回后允许滚动
      document.documentElement.style.overflow = 'auto'; // 确保返回后允许滚动
    };
  }, []);

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
        
        // 创建一个空的回复消息
        const agentMsg = {
          sender: agent.id,
          text: '',
          timestamp: new Date().toISOString(),
          streaming: true
        };
        
        // 替换"正在思考"为空的回复消息
        msgs = msgs.filter(m => !(m.sender === agent.id && m.thinking));
        msgs = [...msgs, agentMsg];
        setMessages(msgs);
        
        // 使用fetch API的流式响应
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({ [config.bodyField]: context, stream: true }),
        });
        
        // 创建响应流读取器
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // 读取流数据
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // 解码并处理数据块
          const chunk = decoder.decode(value, { stream: true });
          
          try {
            // 尝试解析JSON响应
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.substring(6));
                
                // 更新消息文本
                msgs = msgs.map(m => {
                  if (m.sender === agent.id && m.streaming) {
                    return {
                      ...m,
                      text: m.text + (data.content || data[config.responseField] || '')
                    };
                  }
                  return m;
                });
                
                setMessages([...msgs]);
              }
            }
          } catch (e) {
            // 如果不是JSON格式，直接追加文本
            msgs = msgs.map(m => {
              if (m.sender === agent.id && m.streaming) {
                return {
                  ...m,
                  text: m.text + chunk
                };
              }
              return m;
            });
            
            setMessages([...msgs]);
          }
        }
        
        // 完成流式输出后，更新消息状态
        msgs = msgs.map(m => {
          if (m.sender === agent.id && m.streaming) {
            return {
              ...m,
              streaming: false
            };
          }
          return m;
        });
        
        setMessages([...msgs]);
        saveToLocalStorage(msgs);
        
        // 等待一小段时间，让用户有时间阅读
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.error(`${agent.id} 处理失败:`, err);
        
        // 替换"正在思考"或流式消息为错误消息
        msgs = msgs.filter(m => !(m.sender === agent.id && (m.thinking || m.streaming)));
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
      // 显示复制成功标记2秒
      const button = document.querySelector(`.message-container:nth-child(${idx + 1}) .copy-button`);
      if (button) {
        button.classList.add('copied');
        setTimeout(() => {
          setCopiedId(null);
          button.classList.remove('copied');
        }, 2000);
      }
    });
  };

  const getSenderInfo = (senderId) => {
    if (senderId === 'user') return { name: '您', avatar: '👤', color: '#007bff' };
    if (senderId === 'system') return { name: '系统', avatar: '🤖', color: '#6c757d' };
    return agents.find(a => a.id === senderId) || { name: senderId, avatar: '👾', color: '#6c757d' };
  };

  return (
    <div className="page" style={{
      background: 'transparent',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px', // 添加内边距，四周留出空间
      margin: '0',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    }}>
      <div className="chat-box" style={{
        height: 'calc(100% - 40px)', // 减去上下内边距
        maxHeight: 'calc(100vh - 40px)', // 减去上下内边距
        width: 'calc(100% - 40px)', // 减去左右内边距
        margin: '0',
        borderRadius: '12px', // 恢复圆角
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // 恢复阴影效果
      }}>
        <div className="header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <span className="back-arrow">←</span> 返回
          </button>
          <h2 className="title">项目会议室</h2>
          <button 
            onClick={handleClear} 
            className="clear-button"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'rgb(52, 60, 207)', // 使用蓝紫色
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <img 
              src="/icons/delete.svg" 
              alt="删除" 
              style={{ 
                width: '16px', 
                height: '16px',
                filter: 'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' // 使SVG颜色与主题色匹配
              }} 
            />
            清除记录
          </button>
        </div>

        <div className="agent-bar">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className="agent-icon"
              style={{
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

        <div className="messages">
          {messages.map((msg, idx) => {
            const sender = getSenderInfo(msg.sender);
            const isUserMessage = msg.sender === 'user';
            const isSystemMessage = msg.sender === 'system';
            
            // 系统消息使用特殊样式
            if (isSystemMessage) {
              return (
                <div key={idx} className="system-message">
                  <div 
                    className="message"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'rgb(52, 60, 207)',
                      border: 'none',
                      borderLeft: 'none', // 明确移除左侧边框
                      boxShadow: 'none'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }
            
            return (
              <div 
                key={idx} 
                className={`message-container ${isUserMessage ? 'user-message' : ''}`}
              >
                {!isUserMessage && (
                  <div className="avatar" style={{backgroundColor: sender.color}}>
                    {sender.avatar}
                  </div>
                )}
                
                <div className="message-wrapper">
                  {/* 发送者名称 - 显示在气泡上方 */}
                  {!isUserMessage && !msg.thinking && (
                    <div className="sender-name" style={{
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      fontSize: '13px',
                      color: '#333'
                    }}>
                      {sender.name}
                    </div>
                  )}
                  
                  {/* 消息气泡 */}
                  <div
                    className="message"
                    style={{
                      backgroundColor: isUserMessage ? 'rgb(52, 60, 207)' : 
                                      msg.thinking ? '#f8f9fa' : 
                                      msg.isError ? '#dc3545' : 
                                      sender.color + '22', // 使用代理颜色的透明版本
                      color: isUserMessage ? '#fff' : '#000',
                      borderLeft: !isUserMessage ? `4px solid ${sender.color}` : 'none',
                      opacity: msg.thinking ? 0.8 : 1,
                    }}
                  >
                    {msg.thinking ? (
                      <div>{msg.text}</div>
                    ) : (
                      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
                    )}
                    
                    {!msg.thinking && (
                      <button 
                        onClick={() => handleCopy(msg.text, idx)}
                        className={`copy-button ${copiedId === idx ? 'copied' : ''}`}
                        title="复制内容"
                      >
                        {copiedId === idx ? '已复制' : '复制'}
                      </button>
                    )}
                  </div>
                  
                  {/* 时间戳 - 显示在气泡下方 */}
                  <div className="message-timestamp" style={{
                    fontSize: '10px',
                    fontStyle: 'italic',
                    color: 'rgb(52, 60, 207)',
                    opacity: 0.8,
                    marginTop: '4px',
                    textAlign: isUserMessage ? 'right' : 'left'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                {isUserMessage && (
                  <div className="avatar" style={{backgroundColor: sender.color}}>
                    {sender.avatar}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isProcessing ? "请等待所有团队成员回复..." : "请输入您的项目需求..."}
            className="input-textarea"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1} // 减少为1行
            style={{
              height: '32px', // 固定高度与发送按钮一致
              overflow: 'auto' // 允许滚动
            }}
          />
          <button 
            onClick={handleSend} 
            className="send-button"
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? '处理中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 移除内联样式对象，因为我们现在使用CSS类
export default MeetingRoom;
