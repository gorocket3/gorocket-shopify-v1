import React from 'react';
import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import { AppProvider, Page } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

function App() {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <HistoryApp redirect={redirect} />
    )
}

function HistoryApp({ redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">Products</a>
                <a href="/plan">Plan</a>
                <a href="/history">History</a>
            </NavMenu>
            <Page
                backAction={{ content: 'Home', onAction: () => navigate('/') }}
                title="History"
                fullWidth={true}
            >
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
