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
        <SettingApp redirect={redirect} />
    )
}

function SettingApp({ redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">상품</a>
                <a href="/pricing">결제</a>
                <a href="/settings">설정</a>
                <a href="/help">도움</a>
            </NavMenu>
            <Page
                backAction={{ content: 'Home', onAction: () => navigate('/') }}
                title="Setting"
                fullWidth={true}
            >
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
