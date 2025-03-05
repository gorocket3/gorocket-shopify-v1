import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Pusher from "pusher-js";
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    BlockStack,
    Box,
    Button,
    CalloutCard,
    Card,
    FooterHelp,
    Image,
    InlineGrid,
    InlineStack,
    Link,
    Page,
    ProgressBar,
    Text
} from '@shopify/polaris';
import fetchData from "./api/fetch";
import '@shopify/polaris/build/esm/styles.css';

function App({ data }) {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <MainApp data={data} redirect={redirect} />
    )
}

function MainApp({ data: { shop_id, plan, total_product_count }, redirect }) {
    const navigate = (url, options = {}) => redirect.dispatch(options.external ? Redirect.Action.REMOTE : Redirect.Action.APP, url);

    const [ introCardDismissed, setIntroCardDismissed ] = useState(false);
    const [ syncProgress, setSyncProgress ] = useState(0);
    const [ syncLoading, setSyncLoading ] = useState(false);
    const [ syncCompleted, setSyncCompleted ] = useState(false);

    async function syncProducts() {
        try {
            setSyncLoading(true);
            const res = await fetchData({ method: 'POST', url: '/api/products/sync' });
        } catch (e) {
            alert('An error occurred while connecting products. Please try again.');
        }
    }

    useEffect(() => {
        const pusherKey = "9d0419d5d7a8c8eaa4d3";
        const channelName = 'gorocket-shop-' + shop_id;
        const pusher = new Pusher(pusherKey, { cluster: "ap3" });

        const channel = pusher.subscribe(channelName);
        channel.bind('product-sync', function (d) {
            setSyncProgress(d?.data?.progress || 0);
        });

        return () => {
            pusher.unsubscribe(channelName);
        };
    }, []);

    useEffect(() => {
        if (syncProgress === 100 && syncLoading) {
            setTimeout(() => {
                setSyncCompleted(true);
                setSyncLoading(false);
            }, 1000);
        }
    }, [ syncProgress ]);

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
                    {!!plan && (
                        <InlineGrid gap="200" columns={{ xs: 1, md: 3 }}>
                            <Card>
                                <BlockStack gap="400">
                                    <InlineGrid columns="1fr auto">
                                        <Text as="h2" variant="headingMd">Active plan</Text>
                                        <Button onClick={() => navigate('/pricing')} variant="plain" accessibilityLabel="Upgrade">Upgrade</Button>
                                    </InlineGrid>
                                    <InlineStack gap="200" blockAlign="end">
                                        <Text as="p" variant="headingXl">{plan.name}</Text>
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
                                    <Text as="p" variant="headingXl">{total_product_count.toLocaleString('en-US')} <Text as="span" variant="bodySm" tone="subdued">products</Text></Text>
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
                    )}
                    <Card>
                        <Box paddingBlockEnd="800">
                            <BlockStack inlineAlign="center" gap="100">
                                <Image alt='Empty Products'
                                       source={'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}/>
                                <Text as="h2" variant="headingMd">Connect and manage your products</Text>
                                <p className="animated-stripes">
                                    Connect Shopify products and manage them with{' '}
                                    <Text as="span" tone="success" fontWeight="semibold">GoRocket Editor</Text>
                                    .
                                </p>
                                <Box padding="400">
                                    <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                                        <Button onClick={() => navigate('/products')}>Manage Products</Button>
                                        <Box width="140px">
                                            {syncLoading ? (
                                                <ProgressBar progress={Math.max(syncProgress, 3)} tone="success"/>
                                            ) : (
                                                <Button variant="primary" tone="success" fullWidth={true}
                                                        onClick={syncProducts}
                                                        disabled={syncCompleted}
                                                        loading={syncLoading}>
                                                    {syncCompleted ? 'Completed!' : 'Connect Products'}
                                                </Button>
                                            )}
                                        </Box>
                                    </InlineGrid>
                                </Box>
                                <p>
                                    With <Link monochrome onClick={() => navigate('/billing/2')}>Basic Plan</Link>, you
                                    can integrate and
                                    manage
                                    over 100,000 products.
                                </p>
                            </BlockStack>
                        </Box>
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

if (document.getElementById('app')) {
    const initial_data = document.getElementById('app').dataset?.initial || '{}';
    const data = JSON.parse(initial_data);
    ReactDOM.createRoot(document.getElementById('app')).render(<App data={data}/>);
}
