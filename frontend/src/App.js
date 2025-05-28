import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import DocumentPage from './pages/DocumentPage';
import MeetingRoom from './pages/MeetingRoom';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页不使用 Layout */}
        <Route path="/" element={<LoginPage />} />

        {/* 以下页面统一使用 Layout 结构 */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard user="管理员" />
            </Layout>
          }
        />
        <Route
          path="/chat/:roleId"
          element={
            <Layout>
              <ChatPage />
            </Layout>
          }
        />
        <Route
          path="/documents"
          element={
            <Layout>
              <DocumentPage />
            </Layout>
          }
        />
        <Route
          path="/meeting"
          element={
            <Layout>
              <MeetingRoom />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
