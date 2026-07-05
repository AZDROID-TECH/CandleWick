import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'boxicons/css/boxicons.min.css'
import './index.css'
import './i18n'
import { initializeTelegramApp } from './utils/telegram'

initializeTelegramApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
