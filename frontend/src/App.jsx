import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? <Dashboard username={user} /> : <LoginPage onLogin={setUser} />}
    </div>
  );
}

export default App;
