import { useEffect, useState } from 'react';
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
    Card,
    InlineGrid,
    InlineStack,
    Page,
    Popover,
    ProgressBar,
    Text
} from '@shopify/polaris';
import { SearchIcon, SettingsIcon } from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';
import {
    getProductsToRemove,
    getProductsToUpdate,
    initGrid,
    removeProducts,
    resetColumns,
    saveColumns,
    saveProducts,
    searchProducts
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

    const initProductAction = { type: '', progress: 0, in_progress: false };
    const [ productAction, setProductAction ] = useState({ ...initProductAction });
    const [ gridCustomPopoverActive, setGridCustomPopoverActive ] = useState(false);

    const toggleGridCustomPopover = () => setGridCustomPopoverActive((active) => !active);

    const saveClick = () => {
        const rows = getProductsToUpdate();
        if (rows) {
            setProductAction({ type: "update", progress: 0, in_progress: true });
            saveProducts(rows, () => setProductAction({ ...initProductAction }));
        }
    }

    const deleteClick = () => {
        const rows = getProductsToRemove();
        if (rows) {
            setProductAction({ type: "delete", progress: 0, in_progress: true });
            removeProducts(rows, () => setProductAction({ ...initProductAction }));
        }
    }

    useEffect(() => {
        if (productAction.progress === 100) {
            setTimeout(() => {
                setProductAction({ ...initProductAction });
                searchProducts();
            }, 1000);
        }
    }, [ productAction ]);

    useEffect(() => {
        // Grid
        initGrid();

        // Pusher
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const channelName = 'gorocket-shop-' + shop_id;
        const pusher = new Pusher(pusherKey, { cluster: "ap3" });
        const channel = pusher.subscribe(channelName);
        channel.bind('product-update', function (d) {
            setProductAction({ type: "update", progress: d?.data?.progress || 0, in_progress: true });
        });
        channel.bind('product-delete', function (d) {
            setProductAction({ type: "delete", progress: d?.data?.progress || 0, in_progress: true });
        });

        return () => {
            pusher.unsubscribe(channelName);
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
                        {(!!productAction.in_progress && productAction.type === 'delete') && (
                            <Box width="60px">
                                <ProgressBar progress={Math.max(productAction.progress, 5)} tone="critical" />
                            </Box>
                        )}
                        <Button variant="secondary"
                                tone="critical"
                                onClick={deleteClick}
                                disabled={productAction.in_progress}
                                loading={(productAction.type === 'delete' && productAction.in_progress)}>
                            Delete
                        </Button>
                        {(!!productAction.in_progress && productAction.type === 'update') && (
                            <Box width="60px">
                                <ProgressBar progress={Math.max(productAction.progress, 5)} tone="success" />
                            </Box>
                        )}
                    </InlineStack>
                }
            >
                <Card>
                    <BlockStack gap="200">
                        <InlineGrid columns="1fr auto">
                            <Text as="h2" variant="bodyLg">
                                Showing{' '}
                                <Text as="strong" id="gd-current" tone="success" fontWeight="bold">0</Text> of{' '}
                                <Text as="strong" id="gd-total" fontWeight="bold">0</Text>{' '}
                                Products
                            </Text>
                            <InlineStack gap="100">
                                <Button id="search_product"
                                        variant="secondary"
                                        icon={SearchIcon}
                                        accessibilityLabel="Search"
                                        disabled={productAction.in_progress}
                                        onClick={searchProducts}>
                                    Search
                                </Button>
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
