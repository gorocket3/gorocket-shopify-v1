import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider,Page } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

function App() {
    return (
        <AppProvider i18n={{}}>
            <Page
                backAction={{ content: 'Home', url: '/' }}
                title="Setting"
                fullWidth={true}
            >
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
