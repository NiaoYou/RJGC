import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './DocumentPage.css';
import mammoth from 'mammoth';
import { marked } from 'marked'; 

function DocumentPage() {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const [wordHtml, setWordHtml] = useState('');
  const wordContainerRef = useRef(null);

  useEffect(() => {
    const savedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    setFiles(savedDocuments);
  }, []);

  const saveToLocal = (fileList) => {
    setFiles(fileList);
    localStorage.setItem('documents', JSON.stringify(fileList));
  };

  const handleUpload = (e) => {
    const uploaded = Array.from(e.target.files);

    uploaded.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 更加唯一的ID
          name: file.name,
          type: file.type,
          size: file.size,
          uploadTime: new Date().toLocaleString(),
          content: reader.result,
          encoding: file.type.startsWith('text/') || file.name.endsWith('.md') ? 'text' : 'base64',
        };
        const updated = [...files, fileData];
        saveToLocal(updated);
      };

      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDelete = (id) => {
    const updated = files.filter(file => file.id !== id);
    saveToLocal(updated);
  };

  const handleDownload = (file) => {
    const blob = new Blob([file.content], { type: file.type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 添加调试信息，检查文件内容
  const handlePreview = (file) => {
    console.log("预览文件:", file.name);
    console.log("文件类型:", file.type);
    console.log("文件编码:", file.encoding);
    console.log("文件内容长度:", file.content ? file.content.length : 0);
    console.log("文件内容前100个字符:", file.content ? file.content.substring(0, 100) : "无内容");
    
    setPreviewFile(file);
  };

  const closeModal = () => {
    setPreviewFile(null);
  };

  // 添加一个辅助函数，将MIME类型或文件名转换为简单格式
  const getSimpleFileType = (file) => {
    // 从文件名获取扩展名
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // 从MIME类型获取格式
    let mimeFormat = '';
    if (file.type) {
      // 处理常见MIME类型
      if (file.type.includes('markdown')) return 'Markdown';
      if (file.type.includes('word')) return 'Word';
      if (file.type.includes('pdf')) return 'PDF';
      if (file.type.includes('image')) return file.type.split('/')[1].toUpperCase();
      if (file.type.includes('text/plain')) return 'TXT';
      
      // 从MIME类型中提取格式部分
      mimeFormat = file.type.split('/').pop();
    }
    
    // 优先使用文件扩展名，因为它通常更准确
    switch (fileExtension) {
      case 'md': return 'Markdown';
      case 'docx': return 'Word';
      case 'doc': return 'Word';
      case 'pdf': return 'PDF';
      case 'txt': return 'TXT';
      case 'jpg': case 'jpeg': return 'JPG';
      case 'png': return 'PNG';
      case 'gif': return 'GIF';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'js': return 'JavaScript';
      case 'json': return 'JSON';
      case 'xml': return 'XML';
      case 'csv': return 'CSV';
      case 'xlsx': case 'xls': return 'Excel';
      case 'pptx': case 'ppt': return 'PowerPoint';
      default: return mimeFormat || fileExtension.toUpperCase() || '未知';
    }
  };

  // 切换下拉菜单的函数
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // 添加转换Word文档的函数
  const convertWordToHtml = async (file) => {
    try {
      // 如果文件内容是base64格式
      if (file.content && typeof file.content === 'string' && file.content.startsWith('data:')) {
        // 从base64提取实际数据
        const byteString = atob(file.content.split(',')[1]);
        
        // 转换为ArrayBuffer
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        
        // 使用mammoth转换为HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setWordHtml(result.value);
      } else {
        // 如果是文本内容（如会议记录），直接使用marked转换
        setWordHtml(marked(file.content));
      }
    } catch (error) {
      console.error('转换Word文档失败:', error);
      setWordHtml('<p style="color: red;">转换文档失败，请尝试下载后查看。</p>');
    }
  };

  // 在预览文件变化时调用转换函数
  useEffect(() => {
    if (previewFile && isWordFile(previewFile)) {
      convertWordToHtml(previewFile);
    }
  }, [previewFile]);

  // 添加一个辅助函数，判断文件是否为Word文档
  const isWordFile = (file) => {
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.name.endsWith('.docx') || 
           file.name.endsWith('.doc');
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        <div style={styles.header}>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.backBtn}
            className="back-button"
          >
            <span style={styles.backArrow}>←</span> 返回
          </button>
          <h2 style={styles.title}>文档管理</h2>
          <div style={{width: '80px'}}></div> {/* 占位元素，保持标题居中 */}
        </div>

        <div style={styles.content}>
          {files.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>文件名</th>
                    <th style={styles.th}>类型</th>
                    <th style={styles.th}>大小</th>
                    <th style={styles.th}>上传时间</th>
                    <th style={styles.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} style={styles.tr}>
                      <td style={styles.td}>{file.name}</td>
                      <td style={styles.td}>{getSimpleFileType(file)}</td>
                      <td style={styles.td}>{(file.size / 1024).toFixed(1)} KB</td>
                      <td style={styles.td}>{file.uploadTime}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtnContainer}>
                          <button 
                            onClick={() => handlePreview(file)} 
                            className="icon-btn preview-btn"
                            title="预览"
                            style={styles.iconBtn}
                          >
                            <img 
                              src="/icons/preview.svg" 
                              alt="预览" 
                              style={{ 
                                width: '16px', 
                                height: '16px',
                                filter: 'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' // 使SVG颜色与主题色匹配
                              }} 
                            />
                          </button>
                          <button 
                            onClick={() => handleDownload(file)} 
                            className="icon-btn download-btn"
                            title="下载"
                            style={styles.iconBtn}
                          >
                            <img 
                              src="/icons/download.svg" 
                              alt="下载" 
                              style={{ 
                                width: '16px', 
                                height: '16px',
                                filter: 'invert(23%) sepia(90%) saturate(1352%) hue-rotate(226deg) brightness(89%) contrast(87%)' // 使SVG颜色与主题色匹配
                              }} 
                            />
                          </button>
                          <button 
                            onClick={() => handleDelete(file.id)} 
                            className="icon-btn delete-btn"
                            title="删除"
                            style={styles.iconBtn}
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
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>暂无文档，请上传文件</p>
            </div>
          )}

          <br/>
          <div style={styles.uploadSection}>
            <label htmlFor="file-upload" style={styles.uploadLabel} className="uploadLabel">
              选择文件上传
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleUpload}
              style={styles.fileInput}
            />
          </div>

        </div>
      </div>

      {/* 页面内预览弹窗 */}
      {previewFile && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>预览：{previewFile.name}</h3>
            <div style={styles.modalContent}>
              {previewFile.encoding === 'text' && !isWordFile(previewFile) ? (
                <div style={styles.textPreview}>
                  <ReactMarkdown
                    children={previewFile.content}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            String(children).replace(/\n$/, '')
                          </SyntaxHighlighter>
                        ) : (
                         <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  />
                </div>
              ) : previewFile.type.startsWith('image/') ? (
                <img src={previewFile.content} alt={previewFile.name} style={styles.imagePreview} />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.content} width="100%" height="500px" title="PDF预览" style={styles.pdfPreview} />
              ) : isWordFile(previewFile) ? (
                <div 
                  ref={wordContainerRef}
                  style={styles.wordPreview} 
                  dangerouslySetInnerHTML={{ __html: wordHtml }}
                />
              ) : (
                <p style={styles.unsupportedFormat}>❌ 暂不支持预览该格式。</p>
              )}
            </div>
            <button 
              onClick={closeModal} 
              className="back-button" // 使用与返回按钮相同的类名
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'rgb(52, 60, 207)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                alignSelf: 'flex-end',
                marginTop: '15px'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: 'transparent',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  chatBox: {
    background: '#fff',
    borderRadius: '12px',
    width: '100%', // 已经是90%，保持不变
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
    color: 'rgb(52, 60, 207)',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  backArrow: {
    marginRight: '5px',
    fontSize: '18px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    minWidth: '800px', // 添加最小宽度
    width: '100%', // 确保占满父容器
  },
  uploadSection: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  uploadLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: 'rgb(52, 60, 207)',
    color: 'white',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  fileInput: {
    display: 'none',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  th: {
    padding: '12px 15px',
    textAlign: 'center', // 将文字对齐方式从左对齐改为居中
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    color: '#495057',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 15px',
    fontSize: '14px',
    verticalAlign:'middle',
  },
  actionBtnContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  btnIcon: {
    fontSize: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6c757d',
    width: '100%', // 确保宽度一致
    minHeight: '200px', // 添加最小高度
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e9ecef', // 添加边框使视觉效果更明显
    borderRadius: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '80%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    marginBottom: '15px',
    fontSize: '18px',
    fontWeight: '600',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  modalContent: {
    flex: 1,
    overflow: 'auto',
    marginBottom: '15px',
  },
  textPreview: {
    whiteSpace: 'pre-wrap',
    maxHeight: '500px',
    overflow: 'auto',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: 'monospace',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '500px',
    display: 'block',
    margin: '0 auto',
    borderRadius: '8px',
  },
  pdfPreview: {
    border: '1px solid #eee',
    borderRadius: '8px',
  },
  wordPreview: {
    maxHeight: '500px',
    overflow: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
  },
  unsupportedFormat: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#dc3545',
    fontSize: '16px',
  },
  // 移除原有的closeBtn样式
};

export default DocumentPage;
