import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import './ChatPage.css';

const agentConfigs = {
  analyst: {
    endpoint: 'http://localhost:8000/api/requirementgen/',
    bodyField: 'topic',
    responseField: 'requirement',
    color: '#4A6FA5',
    name: '需求分析师',
    avatar: '📋',
  },
  architect: {
    endpoint: 'http://localhost:8000/api/architecture/',
    bodyField: 'requirement_text',
    responseField: 'architecture',
    color: '#6B5B95',
    name: '系统架构师',
    avatar: '🏗️',
  },
  developer: {
    endpoint: 'http://localhost:8000/api/codegen/',
    bodyField: 'module_description',
    responseField: 'code',
    color: '#3F7CAC',
    name: '开发工程师',
    avatar: '💻',
  },
  tester: {
    endpoint: 'http://localhost:8000/api/test/',
    bodyField: 'code',
    responseField: 'test_code',
    color: '#45B8AC',
    name: '测试工程师',
    avatar: '🧪',
  },
};

const agentOrder = ['analyst', 'architect', 'developer', 'tester'];

function ChatPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 获取当前角色配置
  const currentAgent = agentConfigs[roleId] || {};

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const current = history[roleId] || [];

    const index = agentOrder.indexOf(roleId);
    const previousRole = index > 0 ? agentOrder[index - 1] : null;
    const previous = previousRole ? history[previousRole] || [] : [];

    const contextMessages = previous.length
      ? [
          { sender: 'system', text: `🧠 以下是 "${previousRole}" 的最后对话：`, fromPrevious: true },
          ...previous.slice(-3).map(m => ({ ...m, fromPrevious: true }))
        ]
      : [];

    setMessages([...contextMessages, ...current]);
    
    // 聊天页面加载时自动聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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

    const userMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    const loadingMessage = { sender: 'bot', text: '', streaming: true, timestamp: new Date().toISOString() };

    const updated = [...messages, userMessage, loadingMessage];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

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
        
        // 模拟流式输出
        let currentText = '';
        
        for (let i = 0; i < replyText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20)); // 每个字符间隔20ms
          currentText += replyText[i];
          setMessages([...messages, userMessage, { 
            sender: 'bot', 
            text: currentText, 
            streaming: true, 
            timestamp: new Date().toISOString() 
          }]);
        }
        
        const completedMessages = [...messages, userMessage, { 
          sender: 'bot', 
          text: replyText, 
          timestamp: new Date().toISOString() 
        }];
        setMessages(completedMessages);
        saveToLocalStorage(completedMessages);
        setIsLoading(false);
        return;
      }

      const config = agentConfigs[roleId];
      const context = getPreviousSummary();
      const fullInput = context ? `${context}\n当前输入：${input}` : input;

      // 使用fetch API的流式响应
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ [config.bodyField]: fullInput, stream: true }),
      });

      // 创建响应流读取器
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      
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
              streamedText += (data.content || data[config.responseField] || '');
              setMessages([...messages, userMessage, { 
                sender: 'bot', 
                text: streamedText, 
                streaming: true, 
                timestamp: new Date().toISOString() 
              }]);
            }
          }
        } catch (e) {
          // 如果不是JSON格式，直接追加文本
          streamedText += chunk;
          setMessages([...messages, userMessage, { 
            sender: 'bot', 
            text: streamedText, 
            streaming: true, 
            timestamp: new Date().toISOString() 
          }]);
        }
      }
      
      // 完成流式输出后，更新消息状态
      const final = [...messages, userMessage, { 
        sender: 'bot', 
        text: streamedText, 
        timestamp: new Date().toISOString() 
      }];
      setMessages(final);
      saveToLocalStorage(final);
    } catch (err) {
      console.error('处理失败:', err);
      const error = { 
        sender: 'bot', 
        text: '⚠️ 服务器错误，请稍后再试。', 
        timestamp: new Date().toISOString(), 
        isError: true 
      };
      const final = [...messages, userMessage, error];
      setMessages(final);
      saveToLocalStorage(final);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    const all = JSON.parse(localStorage.getItem('chat_history') || '{}');
    delete all[roleId];
    localStorage.setItem('chat_history', JSON.stringify(all));
    setMessages([]);
  };

  const handleCopy = (text, idx) => {
    // 检查clipboard API是否可用
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(idx);
        // 显示复制成功标记2秒
        const button = document.querySelector(`.message-wrapper:nth-child(${idx + 1}) .copy-button`);
        if (button) {
          button.classList.add('copied');
          setTimeout(() => {
            setCopiedId(null);
            button.classList.remove('copied');
          }, 2000);
        }
      }).catch(err => {
        console.error('复制失败:', err);
        fallbackCopy(text, idx);
      });
    } else {
      fallbackCopy(text, idx);
    }
  };

  // 添加备用复制方法
  const fallbackCopy = (text, idx) => {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 确保不会滚动到底部
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // 执行复制命令
      const successful = document.execCommand('copy');
      
      // 清理
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedId(idx);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('备用复制方法失败:', err);
    }
  };

  return (
    <div className="chat-page" style={styles.page}>
      <div className="chat-container" style={styles.chatBox}>
        <div className="chat-header" style={styles.header}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{
              ...styles.backBtn,
              color: 'rgb(52, 60, 207)', // 使用蓝紫色
              transition: 'all 0.2s ease',
            }}
            aria-label="返回仪表盘"
            className="back-button"
          >
            <span style={styles.backArrow}>←</span> 返回
          </button>
          <div style={styles.titleContainer}>
            <div style={{...styles.agentIcon, backgroundColor: currentAgent.color || '#ccc'}}>
              {currentAgent.avatar || '🤖'}
            </div>
            <h2 style={styles.title}>{currentAgent.name || roleId}</h2>
          </div>
          <button 
            onClick={handleClear} 
            style={{
              ...styles.clearBtn,
              color: 'rgb(52, 60, 207)', // 使用蓝紫色
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            aria-label="清除对话"
            className="clear-button"
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

        <div className="messages-container" style={styles.messages}>
          {messages.map((msg, idx) => {
            // 判断是否为用户消息
            const isUserMessage = msg.sender === 'user';
            
            return (
              <div 
                key={idx} 
                className={`message-wrapper ${isUserMessage ? 'user-message' : 'bot-message'}`}
                style={{
                  display: 'flex',
                  flexDirection: isUserMessage ? 'row-reverse' : 'row',
                  gap: '10px',
                  alignItems: 'flex-start',
                  maxWidth: '100%',
                  width: '100%',
                  marginBottom: '24px', // 增加底部边距，为时间戳留出空间
                  position: 'relative', // 添加相对定位，作为时间戳的定位参考
                }}
              >
                {/* 机器人头像 - 只在非用户消息时显示 */}
                {!isUserMessage && msg.sender !== 'system' && (
                  <div 
                    className="avatar bot-avatar"
                    style={{
                      ...styles.avatar, 
                      backgroundColor: msg.fromPrevious ? '#e0e0e0' : (currentAgent.color || '#ccc')
                    }}
                  >
                    {currentAgent.avatar || '🤖'}
                  </div>
                )}
                
                {/* 消息气泡 */}
                <div
                  className={`message-bubble ${msg.streaming ? 'streaming' : ''} ${msg.isError ? 'error-message' : ''} ${msg.sender === 'system' ? 'system-message' : ''}`}
                  style={{
                    ...styles.message,
                    backgroundColor: msg.fromPrevious ? '#f0f0f0' : 
                                    isUserMessage ? 'rgb(52, 60, 207)' : 
                                    msg.sender === 'system' ? '#6c757d' : 
                                    msg.isError ? '#dc3545' : 
                                    '#fff',
                    color: isUserMessage || msg.sender === 'system' ? '#fff' : '#000',
                    borderLeft: !isUserMessage && msg.sender !== 'system' && !msg.fromPrevious ? 
                                `4px solid rgb(52, 60, 207)` : 'none',
                    boxShadow: msg.fromPrevious ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
                    marginLeft: isUserMessage ? 'auto' : '0',
                    marginRight: isUserMessage ? '0' : 'auto',
                    padding: '4px 12px', // 直接设置内边距
                    lineHeight: '1.2', // 直接设置行高
                    minHeight: 'auto', // 允许高度自适应内容
                  }}
                >
                  <div 
                    className="markdown-content" 
                    dangerouslySetInnerHTML={{ __html: marked(msg.text || '') }} 
                    style={{ lineHeight: '1.2' }} // 直接设置行高
                  />
                  
                  <button 
                    onClick={() => handleCopy(msg.text, idx)}
                    className="copy-button"
                    style={{
                      color: isUserMessage ? '#fff' : '#000'
                    }}
                    title="复制内容"
                    aria-label="复制内容"
                  >
                    {copiedId === idx ? '已复制' : '复制'}
                  </button>
                </div>

                {/* 时间戳 - 与气泡对齐 */}
                {msg.timestamp && (
                  <div 
                    className="timestamp"
                    style={{
                      position: 'absolute',
                      fontSize: '10px',
                      fontStyle: 'italic',
                      color: 'rgb(52, 60, 207)',
                      left: isUserMessage ? 'auto' : '12px', // 与机器人气泡左侧对齐
                      right: isUserMessage ? '12px' : 'auto', // 与用户气泡右侧对齐
                      bottom: '-16px', // 紧贴气泡底部
                      zIndex: 10,
                      opacity: 0.8,
                      visibility: 'visible',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        <div className="input-area" style={styles.inputArea}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`向${currentAgent.name || roleId}提问...`}
            style={styles.input}
            className="chat-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading) handleSend();
              }
            }}
            rows={1} // 保持为1行
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className="send-button"
            style={{
              ...styles.sendBtn,
              height: '32px', // 减小高度
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease', // 添加过渡效果
            }}
            disabled={isLoading}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  chatBox: {
    background: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '900px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease', // 添加过渡效果
  },
  backArrow: {
    marginRight: '5px',
    fontSize: '18px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  agentIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    transition: 'all 0.2s ease', // 添加过渡效果
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#f9f9f9',
  },
  messageContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    maxWidth: '100%',
    width: '100%',
  },
  userMessageContainer: {
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '10px',
    alignItems: 'flex-start',
    maxWidth: '100%',
    width: '100%',
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
    padding: '4px 12px', // 进一步减小内边距
    borderRadius: '12px',
    maxWidth: 'calc(100% - 100px)',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    fontSize: '16px', // 增加字体大小，从14px增加到16px
    lineHeight: '1.2', // 进一步减小行高
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    animation: 'fadeIn 0.3s ease-out',
    minHeight: 'auto', // 允许高度自适应内容
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    backgroundColor: '#fff',
    alignItems: 'flex-end', // 使元素底部对齐
  },
  input: {
    flex: 1,
    padding: '6px 10px', // 进一步减小内边距
    borderRadius: '10px',
    border: '1px solid rgb(52, 60, 207)', // 使用指定的蓝紫色边框
    fontSize: '16px', // 增加字体大小，从14px增加到16px
    resize: 'none',
    minHeight: '10px', // 进一步减小最小高度
    maxHeight: '100px',
    fontFamily: 'inherit',
    lineHeight: '1.2', // 减小行高
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: 'rgb(52, 60, 207)', // 使用相同的蓝紫色
    color: '#fff',
    border: 'none',
    height: '32px', // 减小高度
    padding: '0 15px', // 减小左右内边距
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px', // 增加字体大小
    transition: 'all 0.2s ease', // 添加过渡效果
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    zIndex: 2,
  },
  timestamp: {
    position: 'absolute',
    fontSize: '10px',
    fontStyle: 'italic',
    zIndex: 1, // 确保时间戳在其他元素上方
  },
};

export default ChatPage;
