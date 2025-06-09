import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import './MeetingRoom.css';


import { Document, Paragraph, Packer } from 'docx';
// 删除这两行
// import { HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';

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
  const  navigate = useNavigate();
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
      document.body.style.overflow = originalBodyOverflow || 'auto';
      document.documentElement.style.overflow = originalHtmlOverflow || 'auto';
    };
  }, []);

  useEffect(() => {
    // 加载历史记录
    const history = JSON.parse(localStorage.getItem('meeting_history') || '[]');
    if (history.length > 0) {
      setMessages(history);
      
      // 检查最后一条消息是否是系统提示，确定当前活动的agent
      const lastMsg = history[history.length - 1];
      if (lastMsg.sender === 'system' && lastMsg.isPrompt) {
        // 从提示消息中提取当前agent
        const agentName = lastMsg.text.match(/让(.*?)修改/)?.[1];
        if (agentName) {
          const agent = agents.find(a => a.name === agentName);
          if (agent) {
            setCurrentAgent(agent.id);
          }
        }
      } else if (lastMsg.sender !== 'user' && lastMsg.sender !== 'system') {
        // 如果最后一条消息是agent的，设置为当前agent
        setCurrentAgent(lastMsg.sender);
      }
    } else {
      // 初始化为空消息列表，不显示欢迎消息
      setMessages([]);
      setCurrentAgent(null);
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
    
    // 检查是否是"下一位"指令
    if (input.trim().toLowerCase() === "下一位" || 
        input.trim().includes("下一位") || 
        input.trim().includes("继续") ||
        input.trim().includes("next")) {
      
      // 找出当前agent的索引
      const currentIndex = agents.findIndex(a => a.id === currentAgent);
      if (currentIndex >= 0 && currentIndex < agents.length - 1) {
        // 移动到下一个agent
        await startAgentFlow(updatedMessages, currentIndex + 1);
      } else if (currentIndex === agents.length - 1) {
        // 已经是最后一个agent
        const endMsg = {
          sender: 'system',
          text: '✅ 所有专家已完成发言。您可以继续提问，或使用"生成会议总结"功能整理会议成果。',
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, endMsg];
        setMessages(finalMessages);
        saveToLocalStorage(finalMessages);
        setCurrentAgent(null);
      }
    } else if (currentAgent) {
      // 用户对当前agent的反馈，让当前agent继续回复
      setIsProcessing(true);
      
      // 添加"正在思考"消息
      const thinkingMsg = {
        sender: currentAgent,
        text: `${agents.find(a => a.id === currentAgent).avatar} 正在思考...`,
        timestamp: new Date().toISOString(),
        thinking: true
      };
      
      let msgs = [...updatedMessages, thinkingMsg];
      setMessages(msgs);
      
      // 调用API获取回复
      try {
        const agent = agents.find(a => a.id === currentAgent);
        const config = agentConfigs[currentAgent];
        
        // 获取所有历史消息作为上下文
        const context = msgs
          .filter(m => !m.thinking)
          .map(m => {
            const sender = m.sender === 'user' ? '用户' : 
                          agents.find(a => a.id === m.sender)?.name || m.sender;
            return `${sender}: ${m.text}`;
          })
          .join('\n\n');
        
        // 创建一个空的回复消息
        const agentMsg = {
          sender: currentAgent,
          text: '',
          timestamp: new Date().toISOString(),
          streaming: true
        };
        
        // 替换"正在思考"为空的回复消息
        msgs = msgs.filter(m => !(m.sender === currentAgent && m.thinking));
        msgs = [...msgs, agentMsg];
        setMessages(msgs);
        
        // 使用fetch API的流式响应
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({ 
            [config.bodyField]: context, 
            stream: true,
            mode: 'meeting_room'  // 指定为会议室模式
          }),
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
                  if (m.sender === currentAgent && m.streaming) {
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
              if (m.sender === currentAgent && m.streaming) {
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
          if (m.sender === currentAgent && m.streaming) {
            return {
              ...m,
              streaming: false
            };
          }
          return m;
        });
        
        setMessages([...msgs]);
        saveToLocalStorage(msgs);
        
        // 添加系统提示，询问用户是否满意
        const promptMsg = {
          sender: 'system',
          text: `${agent.avatar} ${agent.name}已完成回复。您可以：\n1. 提供反馈意见让${agent.name}修改\n2. 输入"下一位"让下一位专家继续`,
          timestamp: new Date().toISOString(),
          isPrompt: true
        };
        
        msgs = [...msgs, promptMsg];
        setMessages(msgs);
        saveToLocalStorage(msgs);
        
        setIsProcessing(false);
        
      } catch (err) {
        console.error(`${currentAgent} 处理失败:`, err);
        
        // 替换"正在思考"或流式消息为错误消息
        msgs = msgs.filter(m => !(m.sender === currentAgent && (m.thinking || m.streaming)));
        const errorMsg = {
          sender: currentAgent,
          text: `⚠️ 抱歉，我在处理时遇到了问题。`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        msgs = [...msgs, errorMsg];
        setMessages(msgs);
        saveToLocalStorage(msgs);
        
        setIsProcessing(false);
      }
    } else {
      // 如果没有当前agent或是新会话，从第一个agent开始
      await startAgentFlow(updatedMessages, 0);
    }
  };

  const startAgentFlow = async (currentMessages, startIndex = 0) => {
    let msgs = [...currentMessages];
    setIsProcessing(true);
    
    // 只让当前agent发言
    if (startIndex < agents.length) {
      const agent = agents[startIndex];
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
        
        // 添加系统提示，询问用户是否满意
        const promptMsg = {
          sender: 'system',
          text: `${agent.avatar} ${agent.name}已完成回复。您可以：\n1. 提供反馈意见让${agent.name}修改\n2. 输入"下一位"让下一位专家继续`,
          timestamp: new Date().toISOString(),
          isPrompt: true
        };
        
        msgs = [...msgs, promptMsg];
        setMessages(msgs);
        saveToLocalStorage(msgs);
        
        // 设置当前等待用户对哪个agent的反馈
        setCurrentAgent(agent.id);
        setIsProcessing(false);
        
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
        
        // 继续下一个agent
        setIsProcessing(false);
      }
    } else {
      // 所有agent都已发言
      setCurrentAgent(null);
      setIsProcessing(false);
      
      // 添加会议结束提示
      const endMsg = {
        sender: 'system',
        text: '✅ 所有专家已完成发言。您可以继续提问，或使用"生成会议总结"功能整理会议成果。',
        timestamp: new Date().toISOString()
      };
      
      msgs = [...msgs, endMsg];
      setMessages(msgs);
      saveToLocalStorage(msgs);
    }
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有会议记录吗？')) {
      localStorage.removeItem('meeting_history');
      // 清除后显示空消息列表，不显示欢迎消息
      setMessages([]);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(idx);
      // 显示复制成功标记2秒
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  const getSenderInfo = (senderId) => {
    if (senderId === 'user') return { name: '您', avatar: '👤', color: '#007bff' };
    return agents.find(a => a.id === senderId) || { name: senderId, avatar: '👾', color: '#6c757d' };
  };


const handleExportToWord = () => {
  // 调试：打印所有消息
  console.log("所有消息:", messages);
  
  // 查找会议总结 - 使用更可靠的方式
  let summaryMessage = messages.find(msg => msg.sender === 'system' && msg.isSummary);
  
  // 如果找不到带isSummary标记的消息，尝试查找最后一个非导出选项的系统消息
  if (!summaryMessage) {
    const systemMessages = messages.filter(msg => 
      msg.sender === 'system' && 
      !msg.isExportOptions && 
      !msg.thinking &&
      !msg.isError
    );
    
    if (systemMessages.length > 0) {
      summaryMessage = systemMessages[systemMessages.length - 1];
      console.log("使用最后一个系统消息作为总结:", summaryMessage);
    }
  }
  
  console.log("找到的会议总结:", summaryMessage);
  
  if (!summaryMessage) {
    alert("请先生成会议总结");
    return;
  }
  
  if (!summaryMessage.text || summaryMessage.text.trim() === '') {
    alert("会议总结内容为空，无法导出");
    return;
  }
  
  // 创建Word文档
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 主标题
        new Paragraph({
          text: "项目会议总结"
        }),
        // 空行
        new Paragraph({}),
        // 总结内容 - 按段落分割
        ...summaryMessage.text.split('\n').map(para => 
          new Paragraph({
            text: para
          })
        )
      ]
    }]
  });

  // 生成并保存Word文件
  Packer.toBlob(doc).then(blob => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `项目会议总结_${timestamp}.docx`;
    
    // 直接触发下载
    saveAs(blob, fileName);
    
    // 同时保存到localStorage以便在文档管理页面查看
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      const base64data = reader.result;
      
      const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
      savedDocuments.push({
        id: Date.now().toString(),
        name: fileName,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: blob.size,
        uploadTime: new Date().toLocaleString(),
        content: base64data,
        encoding: 'base64'
      });
      
      localStorage.setItem('documents', JSON.stringify(savedDocuments));
      console.log("文档已保存到localStorage");
    };
    
    alert("✅文档已下载并保存到文档管理页面!");
  });
};

  // md
  const handleExportToMarkdown = () => {
    // 查找会议总结 - 使用更可靠的方式
    let summaryMessage = messages.find(msg => msg.sender === 'system' && msg.isSummary);
  
    // 如果找不到带isSummary标记的消息，尝试查找最后一个非导出选项的系统消息
    if (!summaryMessage) {
      const systemMessages = messages.filter(msg => 
        msg.sender === 'system' && 
        !msg.isExportOptions && 
        !msg.thinking &&
        !msg.isError
      );
    
      if (systemMessages.length > 0) {
        summaryMessage = systemMessages[systemMessages.length - 1];
        console.log("使用最后一个系统消息作为总结:", summaryMessage);
      }
    }
  
    if (!summaryMessage) {
      alert("请先生成会议总结");
      return;
    }
  
    if (!summaryMessage.text || summaryMessage.text.trim() === '') {
      alert("会议总结内容为空，无法导出");
      return;
    }
  
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `项目会议总结_${timestamp}.md`;
    const markdownContent = `# 项目会议总结 (${timestamp})\n\n${summaryMessage.text}`;

    // 创建blob并直接触发下载
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    saveAs(blob, fileName);
    
    // 同时保存到localStorage以便在文档管理页面查看
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    savedDocuments.push({
      id: Date.now().toString(),
      name: fileName,
      type: 'text/markdown',
      size: markdownContent.length,
      uploadTime: new Date().toLocaleString(),
      content: markdownContent,
      encoding: 'text',
    });
    localStorage.setItem('documents', JSON.stringify(savedDocuments));
    console.log("Markdown文档已保存到localStorage");
    
    alert("✅文档已下载并保存到文档管理页面!");
  };

// 辅助函数：将十六进制颜色转换为RGB格式
  const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
};

// 添加会议总结功能
const handleGenerateSummary = async () => {
  if (messages.length < 3 || isProcessing) {
    alert("会议内容太少或正在处理中，无法生成总结");
    return;
  }
  
  setIsProcessing(true);
  
  try {
    // 收集所有消息作为上下文
    const context = messages
      .filter(m => !m.thinking && !m.isError)
      .map(m => {
        const sender = m.sender === 'user' ? '用户' : 
                      agents.find(a => a.id === m.sender)?.name || m.sender;
        return `${sender}: ${m.text}`;
      })
      .join('\n\n');
    
    // 创建一个"正在生成总结"的消息
    const summaryMsg = {
      sender: 'system',
      text: '🔄 正在生成会议总结...',
      timestamp: new Date().toISOString(),
      thinking: true
    };
    
    let msgs = [...messages, summaryMsg];
    setMessages(msgs);
    
    // 调用API生成总结
    const response = await fetch('http://localhost:8000/api/agent/stream', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ 
        role: 'analyst', 
        input_text: '请根据以上会议内容，生成一份完整的会议总结，包括最终确定的需求、架构、开发计划和测试方案。不要简单复制对话内容，而是提炼出最终达成一致的方案。', 
        mode: 'meeting_summary',
        context: context
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API响应错误: ${response.status}`);
    }
    
    // 替换"正在生成"为空的总结消息
    msgs = msgs.filter(m => !(m.sender === 'system' && m.thinking));
    const finalSummaryMsg = {
      sender: 'system',
      text: '',
      timestamp: new Date().toISOString(),
      streaming: true,
      isSummary: true  // 确保这个标记存在
    };
    
    msgs = [...msgs, finalSummaryMsg];
    setMessages(msgs);
    
    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let summaryText = '';  // 用于累积总结文本
    
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
            const content = data.content || '';
            summaryText += content;  // 累积总结文本
            
            // 更新消息文本
            msgs = msgs.map(m => {
              if (m.sender === 'system' && m.streaming) {
                return {
                  ...m,
                  text: summaryText,  // 使用累积的文本
                  isSummary: true  // 确保标记存在
                };
              }
              return m;
            });
            
            setMessages([...msgs]);
          }
        }
      } catch (e) {
        console.error("解析响应出错:", e);
        // 如果不是JSON格式，直接追加文本
        const content = chunk;
        summaryText += content;
        
        msgs = msgs.map(m => {
          if (m.sender === 'system' && m.streaming) {
            return {
              ...m,
              text: summaryText,
              isSummary: true
            };
          }
          return m;
        });
        
        setMessages([...msgs]);
      }
    }
    
    // 完成流式输出后，更新消息状态
    msgs = msgs.map(m => {
      if (m.sender === 'system' && m.streaming) {
        const updatedMsg = {
          ...m,
          streaming: false,
          isSummary: true  // 确保标记存在
        };
        console.log("会议总结生成完成:", updatedMsg.text);
        return updatedMsg;
      }
      return m;
    });
    
    setMessages([...msgs]);
    saveToLocalStorage(msgs);
    
    // 检查总结内容是否为空
    const generatedSummary = msgs.find(m => m.sender === 'system' && m.isSummary);
    if (!generatedSummary || !generatedSummary.text || generatedSummary.text.trim() === '') {
      throw new Error("生成的会议总结内容为空");
    }
    
    // 添加导出选项提示
    const exportOptionsMsg = {
      sender: 'system',
      text: '✅ 会议总结已生成。您可以选择导出格式：',
      timestamp: new Date().toISOString(),
      isExportOptions: true
    };
    
    msgs = [...msgs, exportOptionsMsg];
    setMessages(msgs);
    saveToLocalStorage(msgs);
    
  } catch (err) {
    console.error('生成会议总结失败:', err);
    
    // 添加错误消息
    const errorMsg = {
      sender: 'system',
      text: `⚠️ 生成会议总结失败: ${err.message}`,
      timestamp: new Date().toISOString(),
      isError: true
    };
    
    const updatedMsgs = messages.filter(m => !(m.sender === 'system' && m.thinking));
    setMessages([...updatedMsgs, errorMsg]);
    saveToLocalStorage([...updatedMsgs, errorMsg]);
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="meeting-page-container">
      <div className="meeting-chat-box">
        <div className="meeting-header">
          <button onClick={() => navigate('/dashboard')} className="meeting-back-button">
            <span>←</span> 返回
          </button>
          <h2 className="meeting-title">项目会议室</h2>
          <button onClick={handleClear} className="meeting-clear-button">
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

        <div className="meeting-agent-bar">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={`meeting-agent-icon ${currentAgent === agent.id ? 'active' : ''}`}
              style={{
                backgroundColor: agent.color
              }}
              title={agent.name}
            >
              {agent.avatar}
            </div>
          ))}
        </div>

        <div className="meeting-messages">
          {messages.map((msg, idx) => {
            const sender = getSenderInfo(msg.sender);
            const isUserMessage = msg.sender === 'user';
            
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
                  {!isUserMessage && !msg.thinking && (
                    <div className="sender-name">{sender.name}</div>
                  )}
                  
                  <div
                    className={`message ${msg.thinking ? 'thinking' : ''} ${msg.isError ? 'error' : ''} ${msg.isPrompt ? 'prompt' : ''} ${msg.isSummary ? 'summary' : ''} ${msg.isExportOptions ? 'export-options' : ''}`}
                    style={{
                      borderLeftColor: !isUserMessage ? sender.color : 'transparent'
                    }}
                  >
                    {msg.thinking ? (
                      <div>{msg.text}</div>
                    ) : msg.isExportOptions ? (
                      <div className="export-buttons">
                        <div>✅ 会议总结已生成。您可以选择导出格式：</div>
                        <div className="export-options-buttons">
                          <button onClick={handleExportToMarkdown} className="export-button">
                            Markdown格式
                          </button>
                          <button onClick={handleExportToWord} className="export-button">
                            Word格式
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
                    )}
                    
                    {!msg.thinking && !msg.isPrompt && !msg.isExportOptions && (
                      <button 
                        onClick={() => handleCopy(msg.text, idx)}
                        className={`copy-button ${copiedId === idx ? 'copied' : ''}`}
                      >
                        {copiedId === idx ? '已复制' : '复制'}
                      </button>
                    )}
                  </div>
                  
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        <div className="meeting-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isProcessing 
                ? "请等待专家回复..." 
                : currentAgent 
                  ? `请对${agents.find(a => a.id === currentAgent)?.name || '专家'}的回复提供反馈，或输入"下一位"继续` 
                  : "请输入您的项目需求..."
            }
            className="input-textarea"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button 
            onClick={handleSend} 
            className="send-button"
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '发送'}
          </button>

          <button
            onClick={handleGenerateSummary}
            className="send-button"
            disabled={isProcessing || messages.length < 3}>
            生成会议总结
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
