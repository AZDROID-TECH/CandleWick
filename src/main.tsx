import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import WebApp from '@twa-dev/sdk'

// Initialize Telegram WebApp
WebApp.ready();
WebApp.expand();

// Set language based on Telegram user
if (WebApp.initDataUnsafe.user?.language_code === 'az') {
    // Already default
} else if (WebApp.initDataUnsafe.user?.language_code) {
    // Switch to English or other supported langs if needed
    // For now simple logic
    // import i18n from './i18n';
    // i18n.changeLanguage('en'); 
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
