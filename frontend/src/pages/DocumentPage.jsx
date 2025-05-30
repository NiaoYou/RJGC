import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './DocumentPage.css';

function DocumentPage() {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const navigate = useNavigate();

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

  const handlePreview = (file) => {
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
                            className="actionBtn preview-btn"
                            style={{...styles.actionBtn}}
                          >预览</button>
                          <button 
                            onClick={() => handleDownload(file)} 
                            className="actionBtn download-btn"
                            style={{...styles.actionBtn}}
                          >下载</button>
                          <button 
                            onClick={() => handleDelete(file.id)} 
                            className="actionBtn delete-btn"
                            style={{...styles.actionBtn}}
                          >删除</button>
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
              {previewFile.encoding === 'text' ? (
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
              ) : (
                <p style={styles.unsupportedFormat}>❌ 暂不支持预览该格式。</p>
              )}
            </div>
            <button onClick={closeModal} style={styles.closeBtn}>关闭</button>
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
    textAlign: 'left',
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
  actionBtnContainer: { // 新增：用于包裹按钮的容器样式
    display: 'flex', // 关键：横向排列
    gap: '10px', // 增加按钮之间的间距
    alignItems: 'center', // 可选：垂直对齐
  },
  actionBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  unsupportedFormat: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#dc3545',
    fontSize: '16px',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default DocumentPage;
