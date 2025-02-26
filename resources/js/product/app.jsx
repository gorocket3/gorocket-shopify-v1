import '@shopify/polaris/build/esm/styles.css';
import { AppProvider } from '@shopify/polaris';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <AppProvider i18n={{}}></AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
