import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Pusher from "pusher-js";
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    Badge,
    BlockStack,
    Box,
    Button,
    CalloutCard,
    Card,
    FooterHelp,
    Icon,
    Image,
    InlineGrid,
    InlineStack,
    Link,
    Page,
    ProgressBar,
    Text
} from '@shopify/polaris';
import { XCircleIcon } from "@shopify/polaris-icons";
import fetchData from "./api/fetch";
import '@shopify/polaris/build/esm/styles.css';
import { useEffectWithoutInitialState } from "./util/custom-hook.js";

function App({ data }) {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <MainApp data={data} redirect={redirect}/>
    )
}

function MainApp({ data: { shop_id, plan, total_product_count, sync_data }, redirect }) {
    const navigate = (url, options = {}) => redirect.dispatch(options.external ? Redirect.Action.REMOTE : Redirect.Action.APP, url);

    // Action
    const customActionInterval = useRef();
    const [ customActionDuration, setCustomActionDuration ] = useState(1);
    const [ customAction, setCustomAction ] = useState({ type: '', progress: 0, in_progress: false, complete: false });
    const startCustomAction = (type, progress = 0) => setCustomAction((action) => ({
        ...action,
        type,
        progress,
        in_progress: true
    }));
    const updateCustomAction = (progress) => setCustomAction((action) => ({
        ...action,
        progress: action.in_progress ? Math.max(action.progress, progress) : action.progress,
    }));
    const resetCustomAction = (complete = false) => setCustomAction((action) => ({
        ...action,
        progress: 0,
        in_progress: false,
        complete
    }));

    // Info
    const [ totalProductCount, setTotalProductCount ] = useState(total_product_count);

    // UI
    const [ introCardDismissed, setIntroCardDismissed ] = useState(false);

    async function syncProducts() {
        try {
            startCustomAction('connect');
            await fetchData({ method: 'POST', url: '/api/products/sync' });
        } catch (e) {
            if (e?.status === '429') {
                alert('Connect request limit exceeded.');
            } else {
                alert('An error occurred while connecting products. Please try again.');
            }
            resetCustomAction();
        }
    }

    async function getProductsTotalCount() {
        try {
            const res = await fetchData({ method: 'GET', url: '/api/products/count' });
            return res?.count || 0;
        } catch (e) {
            return null;
        }
    }

    async function setProductsTotalCount() {
        const count = await getProductsTotalCount();
        setTotalProductCount(count || 0);
    }

    useEffectWithoutInitialState(() => {
        if (customAction.progress === 100) {
            setTimeout(() => {
                resetCustomAction(true);
            }, 1000);
        }
    }, [ customAction.progress ]);

    useEffectWithoutInitialState(() => {
        if (customAction.in_progress) {
            customActionInterval.current = setInterval(() => {
                setCustomActionDuration((duration) => duration + 1);
            }, 1000);
        } else {
            clearInterval(customActionInterval.current);
            setCustomActionDuration(1);
        }
    }, [ customAction.in_progress ]);

    useEffectWithoutInitialState(() => {
        if (customAction.complete) setProductsTotalCount();
    }, [ customAction.complete ]);

    useEffect(() => {
        // Sync data
        if (!!sync_data?.syncing) {
            startCustomAction('connect', sync_data.progress || 0);
        }

        // Pusher
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const channelName = 'gorocket-shop-' + shop_id;
        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const channel = pusher.subscribe(channelName);

        channel.bind('product-sync', function (d) {
            updateCustomAction(d?.data?.progress || 0);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();

            clearInterval(customActionInterval.current);
        };
    }, []);

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">Products</a>
                <a href="/plan">Plan</a>
                <a href="/history">History</a>
            </NavMenu>
            <Page
                title="Gorocket Editor"
                secondaryActions={[
                    { content: 'Products', onAction: () => navigate('/products') },
                    { content: 'Plan', onAction: () => navigate('/plan') },
                    { content: 'History', onAction: () => navigate('/history') },
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
                                        <Button onClick={() => navigate('/plan')} variant="plain" accessibilityLabel="Upgrade">Upgrade</Button>
                                    </InlineGrid>
                                    <InlineStack gap="200" blockAlign="center">
                                        <Text as="p" variant="headingXl">{plan.name}</Text>
                                        {false ?
                                            <Box paddingBlockStart={100}>
                                                <Badge tone="critical">
                                                    <Text as="span" variant="bodyXs" fontWeight="semibold">Trial D-20</Text>
                                                </Badge>
                                            </Box>
                                            : (!!plan.billing_on &&
                                                <Box paddingBlockStart={100}>
                                                    <Badge tone="info">
                                                        <Text as="span" variant="bodyXs" fontWeight="semibold">Until {plan.billing_on.substring(0, 10).replaceAll('-', '.')}</Text>
                                                    </Badge>
                                                </Box>
                                            )
                                        }
                                    </InlineStack>
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="200">
                                    <InlineGrid columns="1fr auto">
                                        <Text as="h2" variant="headingMd">Total Product Count</Text>
                                        <Button onClick={() => navigate('/products')} accessibilityLabel="Manage">Manage</Button>
                                    </InlineGrid>
                                    <Text as="p" variant="headingXl">{totalProductCount.toLocaleString('en-US')} <Text as="span" variant="bodySm" tone="subdued">products</Text></Text>
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
                                        {customAction.in_progress ? (
                                            <InlineStack gap="100" blockAlign="center">
                                                <Box width="140px">
                                                    <ProgressBar progress={Math.max(customAction.progress, 3)} tone="success"/>
                                                </Box>
                                                {customActionDuration >= 30 && (
                                                    <div style={{ cursor: 'pointer' }}
                                                         onClick={() => resetCustomAction()}>
                                                        <Icon source={XCircleIcon} tone="primary"/>
                                                    </div>
                                                )}
                                            </InlineStack>
                                        ) : (
                                            <Box width="140px">
                                                <Button variant="primary" tone="success" fullWidth={true}
                                                        onClick={syncProducts}
                                                        disabled={customAction.complete}
                                                        loading={customAction.in_progress}>
                                                    {customAction.complete ? 'Completed!' : 'Connect Products'}
                                                </Button>
                                            </Box>
                                        )}
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
