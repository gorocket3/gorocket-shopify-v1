import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    BlockStack,
    Box,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Page,
    ResourceItem,
    ResourceList,
    Text,
    Thumbnail
} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import fetchData from "../api/fetch.js";
import { formatISOStringToReadableDate } from "../util/custom-format.js";

function App() {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <HistoryApp redirect={redirect}/>
    )
}

function HistoryApp({ redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    // history
    const [ productHistory, setProductHistory ] = useState([]);

    const getHistory = async () => {
        try {
            const res = await fetchData({ method: 'GET', url: '/api/history' });
            console.log(res);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        // getHistory();
    }, []);

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
            >
                <Card padding="0">
                    <Box paddingBlockStart="600">
                        <ResourceList
                            resourceName={{ singular: 'log', plural: 'logs' }}
                            items={[
                                {
                                    created_at: "2025-03-18T03:11:59.000000Z",
                                    logs: [
                                        {
                                            id: 3,
                                            user_id: 2,
                                            product_id: 1236,
                                            event: "product_delete",
                                            updated_at: "2025-03-18T03:11:59.000000Z",
                                            updated_by: "gorocket"
                                        },
                                        {
                                            id: 3,
                                            user_id: 2,
                                            product_id: 1235,
                                            event: "product_update",
                                            old_values: "{\"tags\": \"222, 555\"}",
                                            new_values: "{\"tags\": \"333, 555, Snowboard\"}",
                                            updated_at: "2025-03-18T03:11:59.000000Z",
                                            updated_by: "shopify"
                                        },
                                        {
                                            id: 2,
                                            user_id: 2,
                                            product_id: 1235,
                                            event: "product_update",
                                            old_values: '{\"body_html\": \"\", \"tags\": \"\"}',
                                            new_values: '{\"body_html\": \"<span style=\\\"color:red;\\\">test<span style=\\\"color:blue;\\\">1</span></span>\", \"tags\": \"333, 555, Snowboard\"}',
                                            updated_at: "2025-03-18T03:11:37.000000Z",
                                            updated_by: "gorocket"
                                        },
                                        {
                                            id: 1,
                                            user_id: 2,
                                            product_id: 1234,
                                            event: "product_update",
                                            old_values: "{\"tags\": \"333, 555, Snowboard\"}",
                                            new_values: "{\"tags\": \"222, 555\"}",
                                            updated_at: "2025-03-18T03:11:33.000000Z",
                                            updated_by: "gorocket"
                                        },
                                    ]
                                },
                                {
                                    created_at: "2025-03-16T23:59:59.000000Z",
                                    logs: [
                                        {
                                            id: 3,
                                            user_id: 2,
                                            product_id: 1235,
                                            event: "product_update",
                                            old_values: "{\"tags\": \"222, 555\"}",
                                            new_values: "{\"tags\": \"333, 555, Snowboard\"}",
                                            updated_at: "2025-03-16T23:59:59.000000Z",
                                            updated_by: "shopify"
                                        },
                                        {
                                            id: 2,
                                            user_id: 2,
                                            product_id: 1235,
                                            event: "product_update",
                                            old_values: '{\"body_html\": \"\", \"tags\": \"\"}',
                                            new_values: '{\"body_html\": \"<span style=\\\"color:red;\\\">test<span style=\\\"color:blue;\\\">1</span></span>\", \"tags\": \"333, 555, Snowboard\"}',
                                            updated_at: "2025-03-16T03:11:37.000000Z",
                                            updated_by: "gorocket"
                                        },
                                        {
                                            id: 1,
                                            user_id: 2,
                                            product_id: 1234,
                                            event: "product_update",
                                            old_values: "{\"tags\": \"333, 555, Snowboard\"}",
                                            new_values: "{\"tags\": \"222, 555\"}",
                                            updated_at: "2025-03-16T03:11:33.000000Z",
                                            updated_by: "gorocket"
                                        },
                                    ]
                                }
                            ]}
                            pagination={{
                                hasPrevious: true,
                                hasNext: true,
                                onPrevious: () => {
                                },
                                onNext: () => {
                                },
                            }}
                            renderItem={(item) => {
                                const { created_at, logs } = item;
                                // console.log(JSON.parse(logs[1]?.new_values || '{}'));

                                return (
                                    <Box padding="600" paddingBlockStart="0" paddingBlock="500">
                                        <BlockStack gap="400">
                                            <InlineStack blockAlign="center" gap="200">
                                                <Box>
                                                    <Icon source={EditIcon} tone="subdued"/>
                                                </Box>
                                                <Text as="p" variant="bodyMd" tone="subdued">Changes
                                                    on <strong>{formatISOStringToReadableDate(created_at)}</strong></Text>
                                            </InlineStack>
                                            <Box paddingInlineStart="200">
                                                <InlineGrid gap="500" columns="1px auto">
                                                    <Box borderColor="border" borderWidth="025" borderRadius="025"/>
                                                    <Box paddingBlock="200">
                                                        <Card padding="0" roundedAbove="0">
                                                            {logs.map((log, idx) => (
                                                                <ResourceItem
                                                                    key={idx}
                                                                    id={log.id}
                                                                    media={<Thumbnail
                                                                        source={log.event === 'product_update' ? "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg" : DeleteIcon}
                                                                        size="small"
                                                                        alt={log.product_id}
                                                                    />}
                                                                    accessibilityLabel={`View details for ${log.product_id}`}
                                                                    verticalAlignment="center"
                                                                >
                                                                    <Box paddingBlockEnd="100">
                                                                        <Text as="h4" variant="bodyLg"
                                                                              fontWeight="semibold"
                                                                              tone={log.event === 'product_update' ? 'success' : 'critical'}>
                                                                            {log.event === 'product_update' ? '#update' : '#delete'}
                                                                            {' '}
                                                                            <Text as="span" variant="bodyMd"
                                                                                  fontWeight="bold" tone="base">
                                                                                {log.product_id}
                                                                            </Text>
                                                                        </Text>
                                                                    </Box>
                                                                    <Text as="p" variant="bodySm" tone="subdued">
                                                                        {log.user_id} changed
                                                                        on {formatISOStringToReadableDate(log.updated_at, {
                                                                        day: false,
                                                                        year: false,
                                                                        time: true
                                                                    })}
                                                                    </Text>
                                                                </ResourceItem>
                                                            ))}
                                                        </Card>
                                                    </Box>
                                                </InlineGrid>
                                            </Box>
                                        </BlockStack>
                                    </Box>
                                );
                            }}
                        />
                    </Box>
                </Card>
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
