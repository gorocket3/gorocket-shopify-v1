import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Link as PolarisLink,
    Page,
    ResourceItem,
    ResourceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    Tabs,
    Text,
    Thumbnail,
    Tooltip,
} from "@shopify/polaris";
import {
    AlertTriangleIcon,
    DeleteIcon,
    EditIcon,
    ImageIcon,
    MinusIcon,
    PlusIcon,
    ProductIcon,
    RefreshIcon,
    VariantIcon,
} from "@shopify/polaris-icons";
import 'quill/dist/quill.snow.css';
import productAttributes from "../components/grid/attributes.json";
import { FeaturedImage } from "../components/history/featured-image";
import { HtmlViewer } from "../components/history/html-viewer";
import {
    formatNumberWithCommas,
    formatISOStringToReadableDate,
    formatTitleCase,
    formatHistories
} from "../utils/formats";
import { getHistoryData } from "../utils/api";
import { useEffectWithoutInitialState } from "../utils/hooks";

const QUERY_META_KEY = 'get-history-meta';

export default function HistoryPage() {
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const lastQuery = queryClient.getQueryData([ QUERY_META_KEY ]) || {};

    const [ info, setInfo ] = useState({
        tabId: lastQuery.tabId || 0,
        page: lastQuery.page || 1,
        lastPage: lastQuery.lastPage || 1,
        from: lastQuery.from || 0,
        to: lastQuery.to || 0,
        perPage: lastQuery.perPage || 10,
        total: lastQuery.total || 0,
        histories: lastQuery.histories || [],
        loading: (lastQuery.histories || []).length < 1,
        firstLoading: (lastQuery.histories || []).length < 1,
        initLoading: !lastQuery.histories,
        refreshLoading: false,
    });

    async function setHistoryData() {
        const {
            data,
            page: resPage,
            ...pageInfo
        } = await getHistoryData({
            updatedBy: [ '', 'shopify', 'gorocket' ][info.tabId],
            page: info.page,
            perPage: info.perPage
        }); // data, page, lastPage, from, to, perPage, total

        setInfo((info) => ({
            ...info, ...(pageInfo || {}),
            histories: formatHistories(data || []),
            loading: false,
            firstLoading: false,
            initLoading: false,
            refreshLoading: false,
        }));
    }

    useEffectWithoutInitialState(() => {
        queryClient.setQueryData([ QUERY_META_KEY ], {
            tabId: info.tabId,
            page: info.page,
            lastPage: info.lastPage,
            from: info.from,
            to: info.to,
            perPage: info.perPage,
            total: info.total,
            histories: info.histories
        });
    }, [ info.histories ]);

    useEffectWithoutInitialState(() => {
        setHistoryData();
    }, [ info.page, info.tabId ]);

    useEffectWithoutInitialState(() => {
        if (info.refreshLoading) setHistoryData();
    }, [ info.refreshLoading ]);

    useEffect(() => {
        if (info.initLoading) setHistoryData();
        else setInfo(i => ({ ...i, loading: false, firstLoading: false }));
    }, []);

    return (
        <Page
            title="History"
            backAction={{ onAction: () => navigate(-1) }}
        >
            <Box paddingBlockEnd="200">
                <Card padding="100">
                    <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                        <Tabs tabs={[
                            { id: 'all-history-filter-1', content: 'All' },
                            { id: 'shopify-history-filter-1', content: 'In Shopify' },
                            { id: 'gorocket-history-filter-1', content: 'Via App' },
                        ]} selected={info.tabId} onSelect={(num) => setInfo((i => ({ ...i, page: 1, tabId: num, loading: true, firstLoading: true })))}/>
                        <Box paddingInlineEnd="300">
                            <Button icon={RefreshIcon} onClick={() => setInfo(i => ({ ...i, refreshLoading: true }))} loading={info.refreshLoading}/>
                        </Box>
                    </InlineGrid>
                </Card>
            </Box>
            {(info.initLoading || info.firstLoading) ? (
                <Card padding="600">
                    <BlockStack gap="800">
                        <Box paddingBlock="400">
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={3}/>
                            </BlockStack>
                        </Box>
                        <Box paddingBlock="400">
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={3}/>
                            </BlockStack>
                        </Box>
                        <Box paddingBlock="400">
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={3}/>
                            </BlockStack>
                        </Box>
                        <Box paddingBlock="400">
                            <BlockStack gap="400">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={3}/>
                            </BlockStack>
                        </Box>
                    </BlockStack>
                </Card>
            ) : (
                <Card padding="0">
                    <Box paddingBlockStart="600">
                        <ResourceList
                            resourceName={{ singular: 'log', plural: 'logs' }}
                            items={info.histories}
                            loading={info.loading}
                            emptyState={
                                <Box padding="600" paddingBlockEnd="1000">
                                    <InlineStack align="center">
                                        <Text as="p" variant="bodyLg" tone="subdued">No change history exists.</Text>
                                    </InlineStack>
                                </Box>
                            }
                            pagination={{
                                hasPrevious: info.page > 1,
                                hasNext: info.page < info.lastPage,
                                onPrevious: () => setInfo((info) => ({ ...info, page: Math.max(info.page - 1, 1), loading: true })),
                                onNext: () => setInfo((info) => ({ ...info, page: Math.min(info.page + 1, info.lastPage), loading: true })),
                                label: info.total < 1 ? '0 history' : `${info.from || 0}-${info.to || 0} of ${formatNumberWithCommas(info.total)} history`,
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
                                                                    key={'item_' + idx}
                                                                    id={log.id}
                                                                    // media={}
                                                                    accessibilityLabel={`View details for ${log.product_id}`}
                                                                    verticalAlignment="center"
                                                                    disabled={true}
                                                                >
                                                                    <BlockStack gap="300">
                                                                        <InlineGrid columns={{ xs: 1, md: "1fr auto" }} alignItems="center" gap="200">
                                                                            {log.event === 'product_delete' ? (
                                                                                <InlineStack gap="200">
                                                                                    <Thumbnail
                                                                                        source={log.product?.images?.[0]?.src || ImageIcon}
                                                                                        size="extraSmall"
                                                                                        alt={log.product_id}
                                                                                    />
                                                                                    <Text as="h4" variant="bodyLg"
                                                                                          fontWeight="semibold"
                                                                                          tone={log.product ? 'base' : 'subdued'}
                                                                                          textDecorationLine='line-through'>
                                                                                        {log.product ? log.product.title : (log.old_values?.title || 'Deleted Product')}
                                                                                    </Text>
                                                                                    <Box>
                                                                                        <Icon source={DeleteIcon} tone="critical"/>
                                                                                    </Box>
                                                                                </InlineStack>
                                                                            ) : (
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
                                                                                    <Tooltip content={formatTitleCase(log.event.replaceAll('_', ' '))}>
                                                                                        <PolarisLink url={`shopify://admin/products/${log.product_id}` + (log.event === 'product_variant_update' && !!log.variant ? '/variants/' + log.variant.variant_id : '')}>
                                                                                            <Icon source={log.event === 'product_variant_update' ? VariantIcon : ProductIcon}
                                                                                                  tone={log.event === 'product_variant_update' ? 'warning' : 'info'}
                                                                                            />
                                                                                        </PolarisLink>
                                                                                    </Tooltip>
                                                                                </InlineStack>
                                                                            )}
                                                                            <InlineStack gap="200">
                                                                                <Badge progress="complete" tone={log.updated_by === 'gorocket' ? 'magic' : 'success'}>
                                                                                    {{ shopify: 'in shopify', gorocket: 'via app' }[log.updated_by]}
                                                                                </Badge>
                                                                                <Text as="p" variant="bodySm" tone="subdued">
                                                                                    {log.event === 'product_delete' ? 'Removed ' : 'Changed '}
                                                                                    at {formatISOStringToReadableDate(log.updated_at, {
                                                                                        day: false,
                                                                                        year: false,
                                                                                        time: true
                                                                                    })}
                                                                                </Text>
                                                                            </InlineStack>
                                                                        </InlineGrid>
                                                                        {log.event === 'product_delete' ? (
                                                                            <Box
                                                                                paddingBlock="200"
                                                                                paddingInline="300"
                                                                                borderColor="border"
                                                                                borderWidth="025"
                                                                                background="bg-surface-critical">
                                                                                <Text as="p" variant="bodySm" tone="base" breakWord={true}>
                                                                                    This product has been removed.
                                                                                </Text>
                                                                            </Box>
                                                                        ) : (Object.keys(log.old_values).length + Object.keys(log.new_values).length) > 0 ? (
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
                                                                                            <BlockStack key={'changes_' + log.id + changes_idx} gap="200">
                                                                                                <Text as="h6" variant="bodyMd" fontWeight="semibold">
                                                                                                    {productAttributes[key] || key}
                                                                                                </Text>
                                                                                                <BlockStack gap="100">
                                                                                                    <Box
                                                                                                        paddingBlock="200"
                                                                                                        paddingInline="300"
                                                                                                        borderColor="border-critical"
                                                                                                        borderWidth="050">
                                                                                                        <InlineGrid gap="200" columns="20px auto">
                                                                                                            <Box>
                                                                                                                <Icon source={MinusIcon} tone="critical"/>
                                                                                                            </Box>
                                                                                                            <InlineStack blockAlign="center">
                                                                                                                {['featured_image', 'variant_image'].includes(key) ? (
                                                                                                                    <FeaturedImage src={old_value} alt="Old Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050" minWidth="100%" maxWidth="750px">
                                                                                                                        <HtmlViewer id={'changes_old' + log.id + changes_idx} source={old_value}/>
                                                                                                                    </Box>
                                                                                                                ) : (
                                                                                                                    <Text as="p" variant="bodySm" tone="base" breakWord={true}>
                                                                                                                        {['taxable', 'requires_shipping'].includes(key) ? (old_value === 1 ? 'true': 'false') : old_value}
                                                                                                                    </Text>
                                                                                                                )}
                                                                                                            </InlineStack>
                                                                                                        </InlineGrid>
                                                                                                    </Box>
                                                                                                    <Box
                                                                                                        paddingBlock="200"
                                                                                                        paddingInline="300"
                                                                                                        borderColor="border-success"
                                                                                                        borderWidth="050">
                                                                                                        <InlineGrid gap="200" columns="20px auto">
                                                                                                            <Box>
                                                                                                                <Icon source={PlusIcon} tone="success"/>
                                                                                                            </Box>
                                                                                                            <InlineStack blockAlign="center">
                                                                                                                {['featured_image', 'variant_image'].includes(key) ? (
                                                                                                                    <FeaturedImage src={new_value} alt="New Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050" minWidth="100%" maxWidth="750px">
                                                                                                                        <HtmlViewer id={'changes_new' + log.id + changes_idx} source={new_value}/>
                                                                                                                    </Box>
                                                                                                                ) : (
                                                                                                                    <Text as="p" variant="bodySm" tone="base" breakWord={true}>
                                                                                                                        {['taxable', 'requires_shipping'].includes(key) ? (new_value === 1 ? 'true': 'false') : new_value}
                                                                                                                    </Text>
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
                                                                                            Your plan does not allow you to view that information. <PolarisLink monochrome onClick={() => navigate('/plan')}>Check plan</PolarisLink>
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
            )}
        </Page>
    );
}
