import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/timeline-custom.css'
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-QXVMKJX1CJ';

if (GA_MEASUREMENT_ID && !GA_MEASUREMENT_ID.includes('YOUR_MEASUREMENT_ID')) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('Google Analytics initialized.');
} else {
    console.warn('Google Analytics Measurement ID not set. Please replace G-YOUR_MEASUREMENT_ID in src/main.tsx');
}


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)