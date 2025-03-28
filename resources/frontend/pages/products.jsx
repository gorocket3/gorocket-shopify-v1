import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pusher from "pusher-js";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
    ActionList,
    Badge,
    BlockStack,
    Box,
    Button,
    ButtonGroup,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Link as PolarisLink,
    Page, Popover,
    ProgressBar,
    ResourceItem,
    ResourceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    Text,
    Thumbnail,
    Tooltip
} from "@shopify/polaris";
import {
    AlertTriangleIcon,
    DeleteIcon,
    EditIcon,
    ImageIcon, MinusIcon, PlusIcon, ProductIcon,
    RedoIcon,
    SearchIcon,
    SettingsIcon,
    UndoIcon, VariantIcon,
    XCircleIcon
} from "@shopify/polaris-icons";
import productAttributes from "../components/grid/attributes.json";
import {
    connectProducts,
    getProductsToRemove,
    getProductsToUpdate,
    initGrid,
    redoGrid,
    removeProducts,
    resetColumns,
    saveColumns,
    saveProducts,
    searchProducts,
    undoGrid
} from "../components/grid/controller";
import { getHistoryData, getMyPlanData } from "../utils/api";
import { formatNumberWithCommas, formatISOStringToReadableDate } from "../utils/formats";
import { useEffectWithoutInitialState } from "../utils/hooks";

export default function ProductsPage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({ shopId: null, planSelectedLimit: null });

    // Action
    const productActionInterval = useRef();
    const [ productActionDuration, setProductActionDuration ] = useState(1);
    const [ productAction, setProductAction ] = useState({ type: '', progress: 0, inProgress: false });
    const startProductAction = (type, progress = 0) => setProductAction((action) => ({
        ...action,
        type,
        progress,
        inProgress: true
    }));
    const updateProductAction = (progress) => setProductAction((action) => ({
        ...action,
        progress: action.inProgress ? Math.max(action.progress, progress) : action.progress,
    }));
    const resetProductAction = () => setProductAction((action) => ({ ...action, progress: 0, inProgress: false }));

    // Grid Custom
    const [ gridCustomPopoverActive, setGridCustomPopoverActive ] = useState(false);
    const toggleGridCustomPopover = () => setGridCustomPopoverActive((active) => !active);

    // Search
    const [ searchPerPage, setSearchPerPage ] = useState(25);
    const [ searchPerPagePopoverActive, setSearchPerPagePopoverActive ] = useState(false);
    const toggleSearchPerPagePopover = () => setSearchPerPagePopoverActive((active) => !active);

    // Undo/Redo
    const [ disableUndo, setDisableUndo ] = useState(false);
    const [ disableRedo, setDisableRedo ] = useState(false);

    // History
    const [ historyInfo, setHistoryInfo ] = useState({
        product: null,
        page: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        perPage: 10,
        total: 0,
        loading: false,
        firstLoading: false,
    });
    const [ histories, setHistories ] = useState([]);

    async function initProducts() {
        const planData = await getMyPlanData(); // shopId, planId, planSelectedLimit

        setInfo((info) => ({ ...info, shopId: planData.shopId, planSelectedLimit: planData.planSelectedLimit }));
    }

    async function setHistoryData() {
        const { data, page: resPage, ...pageInfo } = await getHistoryData({
            productId: historyInfo.product?.product_id,
            page: historyInfo.page,
            perPage: historyInfo.perPage
        }); // data, page, lastPage, from, to, perPage, total

        setHistories(formatHistories(data || []));
        setHistoryInfo((info) => ({ ...info, ...(pageInfo || {}), loading: false, firstLoading: false }));
    }

    const saveClick = () => {
        const rows = getProductsToUpdate();
        if (rows) {
            startProductAction('update');
            saveProducts(rows, () => navigate('/plan'), resetProductAction);
        }
    }

    const deleteClick = () => {
        const rows = getProductsToRemove();
        if (rows) {
            startProductAction('delete');
            removeProducts(rows, resetProductAction);
        }
    }

    const connectClick = () => {
        startProductAction('connect');
        connectProducts(resetProductAction);
    }

    const searchClick = () => {
        searchProducts({ per_page: searchPerPage });
    }

    const undoGridClick = () => {
        const cnt = undoGrid();
        if (cnt < 1) {
            // setDisableUndo(true);
        }
    }

    const redoGridClick = () => {
        const cnt = redoGrid();
        if (cnt < 1) {
            // setDisableRedo(true);
        }
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

    useEffectWithoutInitialState(() => {
        initGrid({
            plan_selected_limit: info.planSelectedLimit,
            default_per_page: searchPerPage,
            show_changes: (prd) => setHistoryInfo((info) => ({ ...info, product: prd, loading: true, firstLoading: true }))
        });

        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const channelName = 'gorocket-shop-' + info.shopId;
        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const channel = pusher.subscribe(channelName);

        channel.bind('product-update', function (d) {
            updateProductAction(d?.data?.progress || 0);
        });
        channel.bind('product-delete', function (d) {
            updateProductAction(d?.data?.progress || 0);
        });
        channel.bind('product-sync', function (d) {
            updateProductAction(d?.data?.progress || 0);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();

            clearInterval(productActionInterval.current);
        };
    }, [ info.shopId ]);

    useEffectWithoutInitialState(() => {
        if (productAction.progress === 100) {
            setTimeout(() => {
                resetProductAction();
                searchClick();
            }, 1000);
        }
    }, [ productAction.progress ]);

    useEffectWithoutInitialState(() => {
        if (productAction.inProgress) {
            productActionInterval.current = setInterval(() => {
                setProductActionDuration((duration) => duration + 1);
            }, 1000);
        } else {
            clearInterval(productActionInterval.current);
            setProductActionDuration(1);
        }
    }, [ productAction.inProgress ]);

    useEffectWithoutInitialState(() => {
        if (!!historyInfo.product) {
            setHistoryData();
        } else {
            setHistories([]);
        }
    }, [ historyInfo.product ]);

    useEffectWithoutInitialState(() => {
        setHistories();
    }, [ historyInfo.page ]);

    useEffect(() => {
        initProducts();
    }, []);

    return (
        <Page
            title="Products"
            fullWidth={true}
            secondaryActions={
                <InlineStack gap="200" blockAlign="center">
                    {(!!productAction.inProgress && productAction.type === 'connect') && (
                        <InlineStack gap="100">
                            <Box width="60px">
                                <ProgressBar progress={Math.max(productAction.progress, 5)} tone="success"/>
                            </Box>
                            {productActionDuration >= 30 && (
                                <div className="cursor-pointer" onClick={resetProductAction}>
                                    <Icon source={XCircleIcon} tone="primary"/>
                                </div>
                            )}
                        </InlineStack>
                    )}
                    <Button variant="secondary"
                            tone="success"
                            onClick={connectClick}
                            disabled={productAction.inProgress}
                            loading={(productAction.type === 'connect' && productAction.inProgress)}>
                        Connect
                    </Button>
                    {(!!productAction.inProgress && productAction.type === 'delete') && (
                        <InlineStack gap="100">
                            <Box width="60px">
                                <ProgressBar progress={Math.max(productAction.progress, 5)} tone="critical"/>
                            </Box>
                            {productActionDuration >= 30 && (
                                <div className="cursor-pointer" onClick={resetProductAction}>
                                    <Icon source={XCircleIcon} tone="primary"/>
                                </div>
                            )}
                        </InlineStack>
                    )}
                    <Button variant="secondary"
                            tone="critical"
                            onClick={deleteClick}
                            disabled={productAction.inProgress}
                            loading={(productAction.type === 'delete' && productAction.inProgress)}>
                        Delete
                    </Button>
                    {(!!productAction.inProgress && productAction.type === 'update') && (
                        <InlineStack gap="200">
                            <Box width="60px">
                                <ProgressBar progress={Math.max(productAction.progress, 5)} tone="highlight"/>
                            </Box>
                            {productActionDuration >= 30 && (
                                <div className="cursor-pointer" onClick={resetProductAction}>
                                    <Icon source={XCircleIcon} tone="primary"/>
                                </div>
                            )}
                        </InlineStack>
                    )}
                    <Button
                        variant="primary"
                        onClick={saveClick}
                        disabled={productAction.inProgress}
                        loading={(productAction.type === 'update' && productAction.inProgress)}>
                        Save
                    </Button>
                </InlineStack>
            }
        >
            <Card>
                <BlockStack gap="200">
                    <InlineGrid columns={{ xs: 1, md: "1fr auto" }} gap="200">
                        <InlineStack gap="200" blockAlign="center">
                            <Text as="h2" variant="bodyLg">
                                Showing{' '}
                                <Text as="strong" id="gd-current" tone="success" fontWeight="bold">0</Text> of{' '}
                                <Text as="strong" id="gd-total" fontWeight="bold">0</Text>{' '}
                                Product Variants
                            </Text>
                            <Text as="p" variant="bodySm" tone="magic">
                                [ <Text as="strong" id="gd-edited" fontWeight="bold">0</Text>/{formatNumberWithCommas(info.planSelectedLimit)} edited ]
                            </Text>
                        </InlineStack>
                        <InlineStack gap="200" align="end" blockAlign="center">
                            <ButtonGroup variant="segmented">
                                <Button icon={UndoIcon} onClick={undoGridClick} disabled={disableUndo}></Button>
                                <Button icon={RedoIcon} onClick={redoGridClick} disabled={disableRedo}></Button>
                            </ButtonGroup>
                            <Popover
                                active={searchPerPagePopoverActive}
                                activator={
                                    <Button onClick={toggleSearchPerPagePopover} disclosure>
                                        <Text as="span" fontWeight="regular">view</Text> {searchPerPage}
                                    </Button>
                                }
                                onClose={toggleSearchPerPagePopover}
                            >
                                <ActionList
                                    actionRole="menuitem"
                                    onActionAnyItem={toggleSearchPerPagePopover}
                                    items={[ 25, 50, 100, 200, 500 ].map((item) => ({
                                        content: item,
                                        onAction: () => setSearchPerPage(item),
                                        active: searchPerPage === item
                                    }))}
                                />
                            </Popover>
                            <Popover
                                active={gridCustomPopoverActive}
                                activator={<Button icon={SettingsIcon}
                                                   onClick={toggleGridCustomPopover}
                                                   disclosure></Button>}
                                onClose={toggleGridCustomPopover}
                            >
                                <ActionList
                                    actionRole="menuitem"
                                    onActionAnyItem={toggleGridCustomPopover}
                                    items={[
                                        {
                                            content: 'Save Columns',
                                            onAction: saveColumns,
                                            disabled: productAction.inProgress
                                        },
                                        {
                                            content: 'Reset Columns',
                                            onAction: resetColumns,
                                            disabled: productAction.inProgress
                                        }
                                    ]}
                                />
                            </Popover>
                            <Button id="search_product"
                                    variant="secondary"
                                    icon={SearchIcon}
                                    accessibilityLabel="Search"
                                    disabled={productAction.inProgress}
                                    onClick={searchClick}>
                                Search
                            </Button>
                        </InlineStack>
                    </InlineGrid>
                    <div className="table-responsive">
                        <div id="div-gd" className="ag-theme-balham"></div>
                    </div>
                </BlockStack>
            </Card>
            <Modal
                variant="large"
                open={!!historyInfo.product}
                onHide={() => setHistoryInfo((info) => ({ ...info, product: null }))}
            >
                <TitleBar title={'The Snowboard' + '\'s change history'}></TitleBar>
                {historyInfo.firstLoading ? (
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
                        </BlockStack>
                    </Card>
                ) : (
                    <Box>
                        <ResourceList
                            resourceName={{ singular: 'log', plural: 'logs' }}
                            items={histories}
                            emptyState={
                                <Box padding="600">
                                    <InlineStack align="center">
                                        <Text as="p" variant="bodyLg" tone="subdued">No change history exists.</Text>
                                    </InlineStack>
                                </Box>
                            }
                            loading={historyInfo.loading}
                            pagination={{
                                hasPrevious: historyInfo.page > 1,
                                hasNext: historyInfo.page < historyInfo.last_page,
                                onPrevious: () => setHistoryInfo((info) => ({ ...info, page: Math.max(info.page - 1, 1), loading: true })),
                                onNext: () => setHistoryInfo((info) => ({ ...info, page: Math.min(info.page + 1, info.lastPage), loading: true })),
                                label: `${historyInfo.from || 0}-${historyInfo.to || 0} of ${formatNumberWithCommas(historyInfo.total)} history`,
                            }}
                            renderItem={(item, index) => {
                                return (
                                    <Box key={index} padding="600">
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
                                                                                    {log.product ? (log.event === 'product_variant_update' ? (log.variant?.title || log.product.title) : log.product.title) : 'Deleted Product'}
                                                                                </Text>
                                                                                <Tooltip content={log.event.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}>
                                                                                    <PolarisLink url={`shopify://admin/products/${log.product_id}` + (log.event === 'product_variant_update' && !!log.variant ? '/variants/' + log.variant.variant_id : '')}>
                                                                                        <Icon source={log.event === 'product_delete' ? DeleteIcon : (log.event === 'product_variant_update' ? VariantIcon : ProductIcon)}
                                                                                              tone={log.event === 'product_delete' ? 'critical' : (log.event === 'product_variant_update' ? 'warning' : 'info')}
                                                                                        />
                                                                                    </PolarisLink>
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
                )}
            </Modal>
        </Page>
    );
}
