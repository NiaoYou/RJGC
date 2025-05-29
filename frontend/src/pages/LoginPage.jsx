import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const navigate = useNavigate();

  // 生成背景气泡效果
  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = [];
      for (let i = 0; i < 20; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 150 + 50,
          left: Math.random() * 100,
          top: Math.random() * 100,
          animationDuration: Math.random() * 20 + 10,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
      setBubbles(newBubbles);
    };
    
    generateBubbles();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      navigate('/dashboard');
    } else {
      alert('请输入邮箱和密码');
    }
  };

  return (
    <div style={styles.container}>
      {/* 背景气泡 */}
      {bubbles.map(bubble => (
        <div 
          key={bubble.id}
          style={{
            ...styles.bubble,
            width: bubble.size + 'px',
            height: bubble.size + 'px',
            left: bubble.left + '%',
            top: bubble.top + '%',
            animationDuration: bubble.animationDuration + 's',
            opacity: bubble.opacity,
          }}
        />
      ))}
      
      <div style={styles.contentWrapper}>
        {/* 左侧欢迎文字 */}
        <div style={styles.welcomeSection}>
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>DevHub</span>
          </div>
          <h1 style={styles.welcomeTitle}>AI协同开发平台</h1>
          <p style={styles.welcomeText}>
            一个基于多智能体协作的软件工程平台，覆盖从需求分析、架构设计、软件开发、测试部署的全流程，让AI助力您的团队提升开发效率。
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📋</span>
              <span style={styles.featureText}>智能需求分析</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🏗️</span>
              <span style={styles.featureText}>自动架构设计</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>👨‍💻</span>
              <span style={styles.featureText}>代码智能生成</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🧪</span>
              <span style={styles.featureText}>自动化测试</span>
            </div>
          </div>
        </div>
        
        {/* 右侧登录卡片 */}
        <div style={styles.loginCard}>
          <h2 style={styles.loginTitle}>登录</h2>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>电子邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入电子邮箱"
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.formOptions}>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="rememberMe" style={styles.checkboxLabel}>记住我</label>
              </div>
              <a href="" style={styles.forgotPassword}>忘记密码?</a>
            </div>
            
            <button type="submit" style={styles.loginButton}>
              登 录
            </button>
          </form>
          
          <p style={styles.registerPrompt}>
            还没有账号? <a href="#" style={styles.registerLink}>立即注册</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    // background: 'linear-gradient(135deg,rgb(149, 153, 231),rgb(79, 87, 243))',
    background: 'linear-gradient(135deg,rgb(58, 60, 102),rgb(52, 60, 207))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.2)',
    animation: 'float linear infinite',
    zIndex: 0,
  },
  contentWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1200px',
    zIndex: 1,
    gap: '40px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  welcomeSection: {
    flex: '1',
    minWidth: '300px',
    color: 'white',
    padding: '20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  logoIcon: {
    fontSize: '2.5rem',
    marginRight: '0.5rem',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  welcomeTitle: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  welcomeText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    marginBottom: '2rem',
  },
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
    marginTop: '1rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '10px 15px',
    borderRadius: '10px',
    backdropFilter: 'blur(5px)',
  },
  featureIcon: {
    fontSize: '1.2rem',
    marginRight: '8px',
  },
  featureText: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  loginCard: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(15px)',
    padding: '2.5rem',
    borderRadius: '30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  loginTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '2rem',
    textAlign: 'center',
    textShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '500',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  input: {
    width: '100%',
    padding: '0.9rem',
    fontSize: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: '0.5rem',
    accentColor: 'white',
  },
  checkboxLabel: {
    fontSize: '0.9rem',
    color: 'white',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  forgotPassword: {
    fontSize: '0.9rem',
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  loginButton: {
    width: '100%',
    padding: '0.9rem',
    background: 'rgba(52, 60, 207, 0.53)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  registerPrompt: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'white',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  registerLink: {
    color: 'white',
    textDecoration: 'underline',
    fontWeight: 'bold',
    transition: 'opacity 0.3s ease',
  },
};

// 添加全局样式
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes float {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-1000px) rotate(720deg); }
  }
  
  input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  input:focus {
    border-color: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2) !important;
  }
  
  a:hover {
    opacity: 0.8 !important;
  }
  
  button:hover {
    background: rgba(255, 255, 255, 0.35) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
  }
  
  @media (max-width: 768px) {
    .contentWrapper {
      flex-direction: column;
      gap: 30px;
    }
    
    .welcomeTitle {
      font-size: 2.5rem;
      text-align: center;
    }
    
    .welcomeText {
      text-align: center;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;
