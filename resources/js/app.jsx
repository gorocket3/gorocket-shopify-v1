import '@shopify/polaris/build/esm/styles.css';
import { AppProvider, Button } from '@shopify/polaris';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <AppProvider i18n={{}}>
            <Button onClick={() => window.location.href='mailto:support@gorocket.ai'}>
                Customer Support
            </Button>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
