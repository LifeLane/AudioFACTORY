/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { FirebaseProvider } from './services/firebaseContext';
import { LiveblocksProvider } from './services/liveblocksContext';
import { TerminalProvider } from './components/terminal/TerminalContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <LiveblocksProvider>
        <TerminalProvider>
          <App />
        </TerminalProvider>
      </LiveblocksProvider>
    </FirebaseProvider>
  </React.StrictMode>
);