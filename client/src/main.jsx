import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './contexts/socketContext.js';

const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

// 🔹 Remove the static loader from index.html once React is ready
const startupLoader = document.getElementById('startup-loader');
if (startupLoader) {
  startupLoader.remove();
}
