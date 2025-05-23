import React, { useEffect, useState } from 'react';

function DocumentPage() {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('documents');
    if (saved) {
      setFiles(JSON.parse(saved));
    }
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

  const handleDelete = (name) => {
    const updated = files.filter(file => file.name !== name);
    saveToLocal(updated);
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    link.click();
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  return (
    <div style={styles.container}>
      <h2>📂 文档管理</h2>

      <input type="file" multiple onChange={handleUpload} style={styles.input} />

      <table style={styles.table}>
        <thead>
          <tr>
            <th>文件名</th>
            <th>类型</th>
            <th>大小</th>
            <th>上传时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, idx) => (
            <tr key={idx}>
              <td>{file.name}</td>
              <td>{file.type}</td>
              <td>{(file.size / 1024).toFixed(1)} KB</td>
              <td>{file.uploadTime}</td>
              <td>
                <button onClick={() => handlePreview(file)} style={styles.actionBtn}>👁️ 预览</button>
                <button onClick={() => handleDownload(file)} style={styles.actionBtn}>⬇️ 下载</button>
                <button onClick={() => handleDelete(file.name)} style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}>🗑 删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 页面内预览弹窗 */}
      {previewFile && (
        <div style={styles.modalOverlay} onClick={() => setPreviewFile(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '10px' }}>预览：{previewFile.name}</h3>
            {previewFile.encoding === 'text' ? (
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' }}>
                {previewFile.content}
              </pre>
            ) : previewFile.type.startsWith('image/') ? (
              <img src={previewFile.content} alt={previewFile.name} style={{ maxWidth: '100%' }} />
            ) : previewFile.type === 'application/pdf' ? (
              <iframe src={previewFile.content} width="100%" height="500px" title="PDF预览" />
            ) : (
              <p>❌ 暂不支持预览该格式。</p>
            )}
            <button onClick={() => setPreviewFile(null)} style={styles.closeBtn}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'sans-serif',
  },
  input: {
    margin: '16px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  actionBtn: {
    padding: '4px 10px',
    marginRight: '6px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
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
    padding: '20px',
    borderRadius: '12px',
    maxWidth: '80%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
  closeBtn: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default DocumentPage;
