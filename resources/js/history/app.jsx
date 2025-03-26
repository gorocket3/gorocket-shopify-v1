import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    Badge,
    BlockStack,
    Box,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Link,
    Page,
    ResourceItem,
    ResourceList,
    Text,
    Thumbnail,
    Tooltip
} from '@shopify/polaris';
import {
    AlertTriangleIcon,
    DeleteIcon,
    EditIcon,
    ImageIcon,
    MinusIcon,
    PlusIcon,
    ProductIcon, VariantIcon
} from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';
import fetchData from "../api/fetch.js";
import productAttributes from "../api/product_attributes.json";
import { formatISOStringToReadableDate, formatNumberWithCommas } from "../util/custom-format.js";
import '../../css/custom-polaris.css';

function App() {
    const params = new URLSearchParams(location.search);
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: params.get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <HistoryApp redirect={redirect} params={{ page: params.get('page') || 1 }}/>
    )
}

function HistoryApp({ redirect, params: { page } }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    // history
    const [ productLogs, setProductLogs ] = useState([]);
    const [ pageInfo, setPageInfo ] = useState({
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        per_page: 10,
        total: 0
    });
    const [ loading, setLoading ] = useState(true);

    const getProductLogs = async () => {
        try {
            const params = "per_page=10&page=" + page;
            return await fetchData({ method: 'GET', url: '/api/history?' + params });
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const formatLogs = (logs) => {
        const groupedLogs = {};

        logs.forEach(log => {
            const dateKey = log.created_at.split('T')[0];
            if (!groupedLogs[dateKey]) {
                groupedLogs[dateKey] = {
                    created_at: dateKey,
                    logs: []
                };
            }

            log.old_values = JSON.parse(log.old_values || '{}');
            log.new_values = JSON.parse(log.new_values || '{}');
            groupedLogs[dateKey].logs.push(log);
        });

        return Object.values(groupedLogs);
    }

    const initProductLogs = async () => {
        const res = await getProductLogs();
        setProductLogs(formatLogs(res?.data || []));
        setPageInfo({
            current_page: res?.current_page || 1,
            last_page: res?.last_page || 1,
            from: res?.from || 0,
            to: res?.to || 0,
            per_page: res?.per_page || 10,
            total: res?.total || 0
        });
        setLoading(false);
    }

    useEffect(() => {
        initProductLogs();
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
                            items={productLogs}
                            emptyState={
                                <Box padding="600" paddingBlockEnd="1000">
                                    <InlineStack align="center">
                                        <Text as="p" variant="bodyLg" tone="subdued">No change history exists.</Text>
                                    </InlineStack>
                                </Box>
                            }
                            loading={loading}
                            pagination={{
                                hasPrevious: pageInfo.current_page > 1,
                                hasNext: pageInfo.current_page < pageInfo.last_page,
                                onPrevious: () => navigate('/history?page=' + (Math.min(pageInfo.current_page - 1, pageInfo.last_page))),
                                onNext: () => navigate('/history?page=' + (pageInfo.current_page + 1)),
                                label: `${pageInfo.from}-${pageInfo.to} of ${formatNumberWithCommas(pageInfo.total)} history`,
                            }}
                            renderItem={(item) => {
                                return (
                                    <Box padding="600" paddingBlockStart="0" paddingBlock="500">
                                        <BlockStack gap="400">
                                            <InlineStack blockAlign="center" gap="200">
                                                <Box>
                                                    <Icon source={EditIcon} tone="subdued"/>
                                                </Box>
                                                <Text as="p" variant="bodyMd" tone="subdued">Changes
                                                    on <strong>{formatISOStringToReadableDate(item.created_at)}</strong></Text>
                                            </InlineStack>
                                            <Box paddingInlineStart="200">
                                                <InlineGrid gap="500" columns="1px auto">
                                                    <Box borderColor="border" borderWidth="025" borderRadius="025"/>
                                                    <Box paddingBlock="200">
                                                        <Card padding="0" roundedAbove="0">
                                                            {item.logs.map((log, idx) => (
                                                                <ResourceItem
                                                                    key={idx}
                                                                    id={log.id}
                                                                    // media={}
                                                                    accessibilityLabel={`View details for ${log.product_id}`}
                                                                    verticalAlignment="center"
                                                                    disabled={true}
                                                                >
                                                                    <BlockStack gap="300">
                                                                        <InlineGrid columns={{ xs: 1, md: "1fr auto" }} alignItems="center" gap="200">
                                                                            <InlineStack gap="200">
                                                                                <Thumbnail
                                                                                    source={log.event === 'product_variant_update' ? (log.variant?.image?.src || ImageIcon) : (log.product?.images?.[0]?.src || ImageIcon)}
                                                                                    size="extraSmall"
                                                                                    alt={log.product_id}
                                                                                />
                                                                                <Text as="h4" variant="bodyLg"
                                                                                      fontWeight="semibold"
                                                                                      tone={log.product ? 'base' : 'subdued'}
                                                                                      textDecorationLine={log.product ? false : 'line-through'}>
                                                                                    {log.product ? `${log.product.title} ${log.variant ? `(${log.variant.title})` : ''}` : 'Deleted Product'}
                                                                                </Text>
                                                                                <Tooltip content={log.event.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}>
                                                                                    <Link url={`shopify://admin/products/${log.product_id}` + (log.event === 'product_variant_update' && !!log.variant ? '/variants/' + log.variant.variant_id : '')}>
                                                                                        <Icon source={log.event === 'product_delete' ? DeleteIcon : (log.event === 'product_variant_update' ? VariantIcon : ProductIcon)}
                                                                                            tone={log.event === 'product_delete' ? 'critical' : (log.event === 'product_variant_update' ? 'warning' : 'info')}
                                                                                        />
                                                                                    </Link>
                                                                                </Tooltip>
                                                                            </InlineStack>
                                                                            <InlineStack gap="200">
                                                                                <Badge progress="complete" tone={log.updated_by === 'gorocket' ? 'magic' : 'success'}>
                                                                                    {log.updated_by}
                                                                                </Badge>
                                                                                <Text as="p" variant="bodySm" tone="subdued">Changed
                                                                                    at {formatISOStringToReadableDate(log.updated_at, {
                                                                                        day: false,
                                                                                        year: false,
                                                                                        time: true
                                                                                    })}
                                                                                </Text>
                                                                            </InlineStack>
                                                                        </InlineGrid>
                                                                        {(Object.keys(log.old_values).length + Object.keys(log.new_values).length) > 0 ? (
                                                                            <Card>
                                                                                <BlockStack gap="400">
                                                                                    {Object.keys(log.old_values).map((key, changes_idx) => {
                                                                                        let old_value = log.old_values[key];
                                                                                        let new_value = log.new_values[key];

                                                                                        if ([ 'price', 'weight', 'compare_at_price' ].includes(key)) {
                                                                                            old_value = formatNumberWithCommas(old_value);
                                                                                            new_value = formatNumberWithCommas(new_value);
                                                                                        }

                                                                                        return (
                                                                                            <BlockStack key={changes_idx} gap="200">
                                                                                                <Text as="h6" variant="bodyMd" fontWeight="semibold">
                                                                                                    {productAttributes[key] || key}
                                                                                                </Text>
                                                                                                <BlockStack gap="100">
                                                                                                    <Box
                                                                                                        paddingBlock="200"
                                                                                                        paddingInline="300"
                                                                                                        borderColor="border"
                                                                                                        borderWidth="025"
                                                                                                        background="bg-surface-critical">
                                                                                                        <InlineGrid gap="200" columns="14px auto">
                                                                                                            <Box>
                                                                                                                <Icon source={MinusIcon} tone="critical"/>
                                                                                                            </Box>
                                                                                                            <InlineStack blockAlign="center">
                                                                                                                {key === 'featured_image' ? (
                                                                                                                    <Thumbnail
                                                                                                                        source={old_value || ImageIcon}
                                                                                                                        size="large"
                                                                                                                        alt="Previous Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050">
                                                                                                                        <div dangerouslySetInnerHTML={{ __html: old_value }}></div>
                                                                                                                    </Box>
                                                                                                                ) : (
                                                                                                                    <Text as="p" variant="bodySm" tone="base" breakWord={true}>{old_value}</Text>
                                                                                                                )}
                                                                                                            </InlineStack>
                                                                                                        </InlineGrid>
                                                                                                    </Box>
                                                                                                    <Box
                                                                                                        paddingBlock="200"
                                                                                                        paddingInline="300"
                                                                                                        borderColor="border"
                                                                                                        borderWidth="025"
                                                                                                        background="bg-surface-success">
                                                                                                        <InlineGrid gap="200" columns="14px auto">
                                                                                                            <Box>
                                                                                                                <Icon source={PlusIcon} tone="success"/>
                                                                                                            </Box>
                                                                                                            <InlineStack blockAlign="center">
                                                                                                                {key === 'featured_image' ? (
                                                                                                                    <Thumbnail
                                                                                                                        source={new_value || ImageIcon}
                                                                                                                        size="large"
                                                                                                                        alt="New Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050">
                                                                                                                        <div dangerouslySetInnerHTML={{ __html: new_value }}></div>
                                                                                                                    </Box>
                                                                                                                ) : (
                                                                                                                    <Text as="p" variant="bodySm" tone="base" breakWord={true}>{new_value}</Text>
                                                                                                                )}
                                                                                                            </InlineStack>
                                                                                                        </InlineGrid>
                                                                                                    </Box>
                                                                                                </BlockStack>
                                                                                            </BlockStack>
                                                                                        )
                                                                                    })}
                                                                                </BlockStack>
                                                                            </Card>
                                                                        ) : (
                                                                            <Box
                                                                                paddingBlock="200"
                                                                                paddingInline="300"
                                                                                borderColor="border"
                                                                                borderWidth="025"
                                                                                background="bg-surface-warning">
                                                                                <InlineStack gap="300" blockAlign="stretch">
                                                                                    <Box>
                                                                                        <Icon source={AlertTriangleIcon} tone="warning"/>
                                                                                    </Box>
                                                                                    <InlineStack blockAlign="center">
                                                                                        <Text as="p" variant="bodySm" tone="base" breakWord={true}>
                                                                                            Your plan does not allow you to view that information. <Link monochrome onClick={() => navigate('/plan')}>Check plan</Link>
                                                                                        </Text>
                                                                                    </InlineStack>
                                                                                </InlineStack>
                                                                            </Box>
                                                                        )}
                                                                    </BlockStack>
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
