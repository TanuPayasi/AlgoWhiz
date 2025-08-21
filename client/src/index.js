import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import './App.css';

const rootElement = document.getElementById('root');
if(rootElement)
{
  const root = ReactDOM.createRoot(rootElement);
  root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
}
else{
  console.error("Root element not found.");
}