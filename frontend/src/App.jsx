import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
      </Routes>
    </Router>
  );
}

export default App;
