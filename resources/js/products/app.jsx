import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Pusher from "pusher-js";
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu, Modal, TitleBar } from "@shopify/app-bridge-react";
import {
    ActionList,
    AppProvider,
    Badge,
    BlockStack,
    Box,
    Button,
    ButtonGroup,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Page,
    Popover,
    ProgressBar,
    ResourceItem,
    ResourceList,
    Text,
    Thumbnail
} from '@shopify/polaris';
import {
    DeleteIcon,
    EditIcon,
    ImageIcon, MinusIcon, PlusIcon,
    RedoIcon,
    SearchIcon,
    SettingsIcon,
    UndoIcon,
    XCircleIcon
} from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';
import fetchData from "../api/fetch.js";
import productAttributes from "../api/product_attributes.json";
import { formatISOStringToReadableDate, formatNumberWithCommas } from "../util/custom-format.js";
import { useEffectWithoutInitialState } from "../util/custom-hook.js";
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
} from "./grid_controller.js";
import '../../css/app.css';

function App({ data }) {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <ProductApp data={data} redirect={redirect}/>
    )
}

function ProductApp({ data: { shop_id }, redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    // Product Action
    const productActionInterval = useRef();
    const [ productActionDuration, setProductActionDuration ] = useState(1);
    const [ productAction, setProductAction ] = useState({ type: '', progress: 0, in_progress: false });
    const startProductAction = (type) => setProductAction((action) => ({
        ...action,
        type,
        progress: 0,
        in_progress: true
    }));
    const updateProductAction = (progress) => setProductAction((action) => ({
        ...action,
        progress: action.in_progress ? Math.max(action.progress, progress) : action.progress,
    }));
    const resetProductAction = () => setProductAction((action) => ({ ...action, progress: 0, in_progress: false }));

    // Grid Custom
    const [ gridCustomPopoverActive, setGridCustomPopoverActive ] = useState(false);
    const toggleGridCustomPopover = () => setGridCustomPopoverActive((active) => !active);

    // Search
    const [ searchPerPage, setSearchPerPage ] = useState(10);
    const [ searchPerPagePopoverActive, setSearchPerPagePopoverActive ] = useState(false);
    const toggleSearchPerPagePopover = () => setSearchPerPagePopoverActive((active) => !active);

    // Undo/Redo
    const [ disableUndo, setDisableUndo ] = useState(false);
    const [ disableRedo, setDisableRedo ] = useState(false);

    // History
    const [ productLogs, setProductLogs ] = useState([]);
    const [ logsProductInfo, setLogsProductInfo ] = useState(null);
    const [ logsPageInfo, setLogsPageInfo ] = useState({
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        per_page: 2,
        total: 0
    });
    const [ logsLoading, setLogsLoading ] = useState(false);

    const getProductLogs = async () => {
        if (logsLoading) return;
        if (!logsProductInfo) return;

        try {
            const loadingTimeout = setTimeout(() => setLogsLoading(true), 200);

            const params = "product_id=" + logsProductInfo.product_id + "&per_page=" + logsPageInfo.per_page + "&page=" + logsPageInfo.current_page;
            const res = await fetchData({ method: 'GET', url: '/api/history?' + params });
            clearTimeout(loadingTimeout);

            const logs = formatLogs(res?.data || []);

            setProductLogs(logs);
            setLogsPageInfo((info) => ({
                ...info,
                last_page: res?.last_page || 1,
                from: res?.from || 0,
                to: res?.to || 0,
                total: res?.total || 0
            }));
            setLogsLoading(false);
        } catch (e) {
            console.error(e);
            setLogsLoading(false);
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

    useEffectWithoutInitialState(() => {
        if (productAction.progress === 100) {
            setTimeout(() => {
                resetProductAction();
                searchClick();
            }, 1000);
        }
    }, [ productAction.progress ]);

    useEffectWithoutInitialState(() => {
        if (productAction.in_progress) {
            productActionInterval.current = setInterval(() => {
                setProductActionDuration((duration) => duration + 1);
            }, 1000);
        } else {
            clearInterval(productActionInterval.current);
            setProductActionDuration(1);
        }
    }, [ productAction.in_progress ]);

    useEffectWithoutInitialState(() => {
        if (!!logsProductInfo) {
            getProductLogs();
        } else {
            setProductLogs([]);
        }
    }, [ logsProductInfo ]);

    useEffectWithoutInitialState(() => {
        getProductLogs();
    }, [ logsPageInfo.current_page ]);

    useEffect(() => {
        // Grid
        initGrid({ default_per_page: searchPerPage, show_changes: (prd) => setLogsProductInfo(prd) });

        // Pusher
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const channelName = 'gorocket-shop-' + shop_id;
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
                title="Products"
                fullWidth={true}
                primaryAction={{
                    content: 'Save',
                    onAction: saveClick,
                    disabled: productAction.in_progress,
                    loading: (productAction.type === 'update' && productAction.in_progress)
                }}
                secondaryActions={
                    <InlineStack gap="200" blockAlign="center">
                        {(!!productAction.in_progress && productAction.type === 'connect') && (
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
                                disabled={productAction.in_progress}
                                loading={(productAction.type === 'connect' && productAction.in_progress)}>
                            Connect
                        </Button>
                        {(!!productAction.in_progress && productAction.type === 'delete') && (
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
                                disabled={productAction.in_progress}
                                loading={(productAction.type === 'delete' && productAction.in_progress)}>
                            Delete
                        </Button>
                        {(!!productAction.in_progress && productAction.type === 'update') && (
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
                    </InlineStack>
                }
            >
                <Card>
                    <BlockStack gap="200">
                        <InlineGrid columns="1fr auto">
                            <InlineStack gap="200" blockAlign="center">
                                <Text as="h2" variant="bodyLg">
                                    Showing{' '}
                                    <Text as="strong" id="gd-current" tone="success" fontWeight="bold">0</Text> of{' '}
                                    <Text as="strong" id="gd-total" fontWeight="bold">0</Text>{' '}
                                    Products
                                </Text>
                                <Text as="p" variant="bodySm" tone="magic">
                                    [ <Text as="strong" id="gd-checked" fontWeight="bold">0</Text> checked ]
                                </Text>
                            </InlineStack>
                            <InlineStack gap="200">
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
                                        items={[ 10, 20, 50, 100, 200, 500 ].map((item) => ({
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
                                                disabled: productAction.in_progress
                                            },
                                            {
                                                content: 'Reset Columns',
                                                onAction: resetColumns,
                                                disabled: productAction.in_progress
                                            }
                                        ]}
                                    />
                                </Popover>
                                <Button id="search_product"
                                        variant="secondary"
                                        icon={SearchIcon}
                                        accessibilityLabel="Search"
                                        disabled={productAction.in_progress}
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
            </Page>
            <Modal
                variant="base"
                open={!!logsProductInfo}
                onHide={() => setLogsProductInfo(null)}
            >
                <TitleBar title={'The Snowboard' + '\'s change history'}></TitleBar>
                <Box>
                    <ResourceList
                        resourceName={{ singular: 'log', plural: 'logs' }}
                        items={productLogs}
                        emptyState={
                            <Box padding="600">
                                <InlineStack align="center">
                                    <Text as="p" variant="bodyLg" tone="subdued">No change history exists.</Text>
                                </InlineStack>
                            </Box>
                        }
                        loading={logsLoading}
                        pagination={{
                            hasPrevious: logsPageInfo.current_page > 1,
                            hasNext: logsPageInfo.current_page < logsPageInfo.last_page,
                            onPrevious: () => setLogsPageInfo((info) => ({
                                ...info,
                                current_page: Math.max(info.current_page - 1, 1)
                            })),
                            onNext: () => setLogsPageInfo((info) => ({
                                ...info,
                                current_page: Math.min(info.current_page + 1, info.last_page)
                            })),
                            label: `${logsPageInfo.from}-${logsPageInfo.to} of ${formatNumberWithCommas(logsPageInfo.total)} history`,
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
                                                            >
                                                                <BlockStack gap="300">
                                                                    <InlineGrid
                                                                        columns={{ xs: 1, md: "1fr auto" }}
                                                                        alignItems="center"
                                                                        gap="200">
                                                                        <InlineStack gap="200">
                                                                            {log.product ? (
                                                                                <>
                                                                                    <Thumbnail
                                                                                        source={log.event === 'product_variant_update' ? (log.variant?.image?.src || ImageIcon) : (log.product.images?.[0]?.src || ImageIcon)}
                                                                                        size="extraSmall"
                                                                                        alt={log.product_id}
                                                                                    />
                                                                                    <Text as="h4"
                                                                                          variant="bodyLg"
                                                                                          fontWeight="semibold">
                                                                                        {log.event === 'product_variant_update' ? (log.variant?.title || log.product.title) : log.product.title}
                                                                                    </Text>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Thumbnail
                                                                                        source={DeleteIcon}
                                                                                        size="extraSmall"
                                                                                        alt={log.product_id}
                                                                                    />
                                                                                    <Text as="h4"
                                                                                          variant="bodyLg"
                                                                                          fontWeight="semibold"
                                                                                          tone="subdued"
                                                                                          textDecorationLine="line-through">
                                                                                        Deleted Product
                                                                                        ({log.product_id})
                                                                                    </Text>
                                                                                </>
                                                                            )}
                                                                            <Badge progress="complete"
                                                                                   tone={log.event === 'product_delete' ? 'critical' : (log.event === 'product_variant_update' ? 'warning' : 'info')}>
                                                                                {log.event.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}
                                                                            </Badge>
                                                                        </InlineStack>
                                                                        <Text as="p" variant="bodySm"
                                                                              tone="subdued">Changed
                                                                            at {formatISOStringToReadableDate(log.updated_at, {
                                                                                day: false,
                                                                                year: false,
                                                                                time: true
                                                                            })}
                                                                        </Text>
                                                                    </InlineGrid>
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
                                                                                    <BlockStack
                                                                                        key={changes_idx}
                                                                                        gap="200">
                                                                                        <Text as="h6"
                                                                                              variant="bodyMd"
                                                                                              fontWeight="semibold">
                                                                                            {productAttributes[key] || key}
                                                                                        </Text>
                                                                                        <BlockStack gap="100">
                                                                                            <Box
                                                                                                paddingBlockEnd="100"
                                                                                                paddingBlockStart="200"
                                                                                                paddingInline="300"
                                                                                                borderColor="border"
                                                                                                borderWidth="025"
                                                                                                background="bg-surface-critical">
                                                                                                <InlineGrid
                                                                                                    columns="14px auto"
                                                                                                    gap="200"
                                                                                                    alignItems="start">
                                                                                                    <Box>
                                                                                                        <Icon
                                                                                                            source={MinusIcon}
                                                                                                            tone="critical"/>
                                                                                                    </Box>
                                                                                                    <Text as="p"
                                                                                                          variant="bodySm"
                                                                                                          tone="base">{old_value}</Text>
                                                                                                </InlineGrid>
                                                                                            </Box>
                                                                                            <Box
                                                                                                paddingBlockEnd="100"
                                                                                                paddingBlockStart="200"
                                                                                                paddingInline="300"
                                                                                                borderColor="border"
                                                                                                borderWidth="025"
                                                                                                background="bg-surface-success">
                                                                                                <InlineGrid
                                                                                                    columns="14px auto"
                                                                                                    gap="200"
                                                                                                    alignItems="start">
                                                                                                    <Box>
                                                                                                        <Icon
                                                                                                            source={PlusIcon}
                                                                                                            tone="success"/>
                                                                                                    </Box>
                                                                                                    <Text as="p"
                                                                                                          variant="bodySm"
                                                                                                          tone="base">{new_value}</Text>
                                                                                                </InlineGrid>
                                                                                            </Box>
                                                                                        </BlockStack>
                                                                                    </BlockStack>
                                                                                )
                                                                            })}
                                                                        </BlockStack>
                                                                    </Card>
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
            </Modal>
        </AppProvider>
    );
}

if (document.getElementById('app')) {
    const initial_data = document.getElementById('app').dataset?.initial || '{}';
    const data = JSON.parse(initial_data);
    ReactDOM.createRoot(document.getElementById('app')).render(<App data={data}/>);
}
