import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    BlockStack,
    Box,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Link as PolarisLink,
    Page,
    ResourceItem,
    ResourceList, SkeletonBodyText, SkeletonDisplayText,
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
    VariantIcon,
} from "@shopify/polaris-icons";
import 'quill/dist/quill.snow.css';
import productAttributes from "../components/grid/attributes.json";
import { FeaturedImage } from "../components/history/featured-image";
import { HtmlViewer } from "../components/history/html-viewer";
import { formatNumberWithCommas, formatISOStringToReadableDate, formatTitleCase } from "../utils/formats";
import { getHistoryData } from "../utils/api";

export default function HistoryPage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({
        shopId: null,
        page: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        perPage: 10,
        total: 0,
        loading: true,
        firstLoading: true,
    });
    const [ histories, setHistories ] = useState([]);

    async function setHistoryData() {
        const { data, page: resPage, ...pageInfo } = await getHistoryData({ page: info.page, perPage: info.perPage }); // data, page, lastPage, from, to, perPage, total

        setHistories(formatHistories(data || []));
        setInfo((info) => ({ ...info, ...(pageInfo || {}), loading: false, firstLoading: false }));
    }

    function formatHistories(logs) {
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

    useEffect(() => {
        setHistoryData();
    }, [ info.page ]);

    return (
        <Page
            title="History"
            backAction={{ onAction: () => navigate(-1) }}
        >
            {info.firstLoading ? (
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
                            items={histories}
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
                                label: `${info.from}-${info.to} of ${formatNumberWithCommas(info.total)} history`,
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
                                                                                    {log.updated_by}
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
                                                                                                                {key === 'featured_image' ? (
                                                                                                                    <FeaturedImage src={old_value} alt="Old Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050" minWidth="100%" maxWidth="750px">
                                                                                                                        <HtmlViewer id={'changes_old' + log.id + changes_idx} source={old_value}/>
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
                                                                                                        borderColor="border-success"
                                                                                                        borderWidth="050">
                                                                                                        <InlineGrid gap="200" columns="20px auto">
                                                                                                            <Box>
                                                                                                                <Icon source={PlusIcon} tone="success"/>
                                                                                                            </Box>
                                                                                                            <InlineStack blockAlign="center">
                                                                                                                {key === 'featured_image' ? (
                                                                                                                    <FeaturedImage src={new_value} alt="New Image"/>
                                                                                                                ) : key === 'body_html' ? (
                                                                                                                    <Box paddingBlockEnd="050" minWidth="100%" maxWidth="750px">
                                                                                                                        <HtmlViewer id={'changes_new' + log.id + changes_idx} source={new_value}/>
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
