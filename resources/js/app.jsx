import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    BlockStack,
    Button,
    CalloutCard,
    Card,
    EmptyState,
    FooterHelp,
    InlineGrid,
    InlineStack,
    Link,
    Page,
    ProgressBar,
    Text
} from '@shopify/polaris';
import fetchData from "./api/fetch";
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
        <MainApp redirect={redirect} />
    )
}

function MainApp({ redirect }) {
    const navigate = (url, options = {}) => redirect.dispatch(options.external ? Redirect.Action.REMOTE : Redirect.Action.APP, url);

    const [ introCardDismissed, setIntroCardDismissed ] = useState(false);
    const [ syncLoading, setSyncLoading ] = useState(false);
    const [ syncCompleted, setSyncCompleted ] = useState(false);

    async function syncProducts() {
        try {
            setSyncLoading(true);
            const res = await fetchData({ method: 'POST', url: '/api/products/sync' });
            setSyncCompleted(true);
            setSyncLoading(false);
        } catch (e) {
            alert('An error occurred while connecting products. Please try again.');
        }
    }

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">상품</a>
                <a href="/pricing">결제</a>
                <a href="/settings">설정</a>
                <a href="/help">도움</a>
            </NavMenu>
            <Page
                title="Gorocket Editor"
                secondaryActions={[
                    { content: 'Products', onAction: () => navigate('/products') },
                    { content: 'Pricing', onAction: () => navigate('/pricing') },
                    { content: 'Setting', onAction: () => navigate('/settings') },
                    { content: 'Help', onAction: () => navigate('/help') },
                ]}
            >
                <BlockStack gap="200">
                    {!introCardDismissed &&
                        <CalloutCard
                            title="Connect and manage your products"
                            illustration="https://cdn-icons-png.flaticon.com/128/7603/7603938.png"
                            primaryAction={{ content: 'Manage Products', onAction: () => navigate('/products') }}
                            onDismiss={() => setIntroCardDismissed(true)}
                        >
                            <p>Connect Shopify products and manage them with GoRocket Editor.</p>
                        </CalloutCard>
                    }
                    <InlineGrid gap="200" columns={{ xs: 1, md: 3 }}>
                        <Card>
                            <BlockStack gap="400">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Active plan</Text>
                                    <Button onClick={() => navigate('/pricing')} variant="plain" accessibilityLabel="Upgrade">Upgrade</Button>
                                </InlineGrid>
                                <InlineStack gap="200" blockAlign="end">
                                    <Text as="p" variant="headingXl">Free</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">~2025.12.12</Text>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="200">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Total Product Count</Text>
                                    <Button onClick={() => navigate('/products')} accessibilityLabel="Manage">Manage</Button>
                                </InlineGrid>
                                <Text as="p" variant="headingXl">5,000 <Text as="span" variant="bodySm" tone="subdued">products</Text></Text>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="600">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Product Edit Count</Text>
                                    <Button onClick={() => navigate('/history')} variant="plain" accessibilityLabel="history">History</Button>
                                </InlineGrid>
                                <InlineStack gap="400" blockAlign="center">
                                    <div style={{ width: 70 }}>
                                        <ProgressBar progress={40} size="small" tone={40 > 80 ? 'critical' : 'highlight'} />
                                    </div>
                                    <Text as="p" variant="bodyLg">
                                        <Text as="span" fontWeight="bold">400</Text>
                                        /1,000
                                    </Text>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    <Card>
                        <EmptyState
                            fullWidth={true}
                            heading="Connect and manage your products"
                            action={{
                                content: syncCompleted ? 'Connection Completed!' : 'Connect Products',
                                tone: 'success',
                                onAction: syncProducts,
                                loading: syncLoading,
                                disabled: syncCompleted
                            }}
                            secondaryAction={{ content: 'Manage Products', onAction: () => navigate('/products') }}
                            footerContent={
                                <p>
                                    With <Link monochrome onClick={() => navigate('/billing/2')}>Basic Plan</Link>, you
                                    can integrate and
                                    manage
                                    over 100,000 products.
                                </p>
                            }
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        >
                            <p>
                                Connect Shopify products and manage them with{' '}
                                <Text as="span" tone="success" fontWeight="semibold">GoRocket Editor</Text>
                                .
                            </p>
                        </EmptyState>
                    </Card>
                    <BlockStack inlineAlign='end'>
                        <Button onClick={() => open('https://support.gorocket3.ai')}>
                            Customer Support
                        </Button>
                    </BlockStack>
                    <FooterHelp>
                        &copy; 2025 GoRocket. By using this app, you agree to the <Link url="#">Privacy Policy</Link>.
                    </FooterHelp>
                </BlockStack>
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
