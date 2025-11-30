import React from 'react';
import ReactDOM from 'react-dom/client';
import '@lynx-js/web-core/index.css';
import '@lynx-js/web-elements/index.css';
import '@lynx-js/web-core';
import '@lynx-js/web-elements/all';
import './types/lynx';

// Get the bundle URL from the Lynx project
const LYNX_BUNDLE_URL = '/assets/main.web.bundle';

const App: React.FC = () => {
  return (
    <lynx-view
      style={{ height: '100vh', width: '100vw' }}
      url={LYNX_BUNDLE_URL}
    />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
