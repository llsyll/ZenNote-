
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element to mount to. Check if <div id='root'></div> exists in index.html");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Rendering Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h1 style="color: #ef4444;">应用启动失败</h1>
        <p>这可能是由于网络原因导致资源加载失败，请尝试刷新页面。</p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: left; font-size: 12px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}
