import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/timeline-custom.css'
import ReactGA from 'react-ga4';

// --- Google Analytics Initialization ---
const GA_MEASUREMENT_ID = 'G-QXVMKJX1CJ'; // <-- REPLACE WITH YOUR ACTUAL ID
if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-QXVMKJX1CJ') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('Google Analytics initialized.');
} else {
    console.warn('Google Analytics Measurement ID not set. Please replace G-YOUR_MEASUREMENT_ID in src/main.tsx');
}
// --- End Google Analytics Initialization ---

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)