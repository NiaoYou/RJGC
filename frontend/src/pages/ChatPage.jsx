import React, { useState, useEffect, useRef } from 'react';
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
    // 保存原始滚动状态
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // 进入聊天页面时修改滚动行为
    document.body.classList.add('chat-page');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // 离开聊天页面时恢复原始状态
    return () => {
      document.body.classList.remove('chat-page');
      document.body.style.overflow = originalBodyOverflow || 'auto';
      document.documentElement.style.overflow = originalHtmlOverflow || 'auto';
    };
  }, []);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '{}');
    const current = history[roleId] || [];

    const index = agentOrder.indexOf(roleId);
    const previousRole = index > 0 ? agentOrder[index - 1] : null;
    const previous = previousRole ? history[previousRole] || [] : [];

    // 创建上下文消息
    let contextMessages = [];
    
    // 如果有上一个角色的对话，添加提示和对话内容
    if (previous.length) {
      // 添加提示消息
      contextMessages.push({ 
        sender: 'system', 
        text: `🧠 我已获取您与${agentConfigs[previousRole]?.name || previousRole}的最近3条对话内容`, 
        fromPrevious: true 
      });
      
      // 添加上一个角色的对话内容
      contextMessages = [
        ...contextMessages,
        ...previous.slice(-3).map(m => ({ ...m, fromPrevious: true }))
      ];
    }

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
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(idx);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="chat-page-container">
      <div className="chat-box">
        <div className="chat-header">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <span>←</span> 返回
          </button>
          <div className="title-container">
            <div 
              className="agent-icon"
              style={{backgroundColor: currentAgent.color || '#ccc'}}
            >
              {currentAgent.avatar || '🤖'}
            </div>
            <h2 className="chat-title">{currentAgent.name || roleId}</h2>
          </div>
          <button 
            onClick={handleClear} 
            className="clear-button"
          >
            <img 
              src="/icons/delete.svg" 
              alt="删除" 
              style={{ 
                width: '16px', 
                height: '16px',
                filter: 'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' 
              }} 
            />
            清除记录
          </button>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => {
            // 判断是否为用户消息
            const isUserMessage = msg.sender === 'user';
            
            return (
              <div 
                key={idx} 
                className={`message-wrapper ${isUserMessage ? 'user-message' : 'bot-message'}`}
              >
                {/* 机器人头像 - 只在非用户消息时显示 */}
                {!isUserMessage && msg.sender !== 'system' && (
                  <div 
                    className="avatar bot-avatar"
                    style={{
                      backgroundColor: msg.fromPrevious ? '#e0e0e0' : (currentAgent.color || '#ccc')
                    }}
                  >
                    {currentAgent.avatar || '🤖'}
                  </div>
                )}
                
                {/* 消息气泡 */}
                <div
                  className={`message-bubble ${msg.streaming ? 'streaming' : ''} ${msg.isError ? 'error-message' : ''} ${msg.sender === 'system' ? 'system-message' : ''}`}
                >
                  <div 
                    className="markdown-content" 
                    dangerouslySetInnerHTML={{ __html: marked(msg.text || '') }} 
                  />
                  
                  <button 
                    onClick={() => handleCopy(msg.text, idx)}
                    className={`copy-button ${copiedId === idx ? 'copied' : ''}`}
                  >
                    {copiedId === idx ? '已复制' : '复制'}
                  </button>
                </div>

                {/* 时间戳 */}
                {msg.timestamp && (
                  <div className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        <div className="input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`向${currentAgent.name || roleId}提问...`}
            className="chat-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading) handleSend();
              }
            }}
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className="send-button"
            disabled={isLoading}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
