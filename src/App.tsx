import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MainApp } from './pages/MainApp';
import { Toaster } from './components/ui/sonner';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <MainApp />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
