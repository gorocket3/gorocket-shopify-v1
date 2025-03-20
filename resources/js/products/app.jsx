import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Pusher from "pusher-js";
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    ActionList,
    AppProvider,
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
    Text
} from '@shopify/polaris';
import { RedoIcon, SearchIcon, SettingsIcon, UndoIcon, XCircleIcon } from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';
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

    useEffect(() => {
        // Grid
        initGrid({ default_per_page: searchPerPage });

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
        </AppProvider>
    );
}

if (document.getElementById('app')) {
    const initial_data = document.getElementById('app').dataset?.initial || '{}';
    const data = JSON.parse(initial_data);
    ReactDOM.createRoot(document.getElementById('app')).render(<App data={data}/>);
}
