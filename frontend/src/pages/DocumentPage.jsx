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
                      <td style={styles.td}>{file.type}</td>
                      <td style={styles.td}>{(file.size / 1024).toFixed(1)} KB</td>
                      <td style={styles.td}>{file.uploadTime}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtnContainer}>
                        <button onClick={() => handlePreview(file)} style={{...styles.actionBtn,backgroundColor:'#d9aa1c'}}>预览</button>
                        <button onClick={() => handleDownload(file)} style={{...styles.actionBtn,backgroundColor:'#2f86d6'}}>下载</button>
                        <button onClick={() => handleDelete(file.id)} style={{...styles.actionBtn, backgroundColor: '#dc3545'}}>删除</button>
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
            <label htmlFor="file-upload" style={styles.uploadLabel}>
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
    gap: '8px', // 按钮之间的间距
    alignItems: 'center', // 可选：垂直对齐
  },
  actionBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: '#007bff',
    color: 'white',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6c757d',
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