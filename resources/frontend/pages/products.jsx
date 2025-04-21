import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, SaveBar, TitleBar } from "@shopify/app-bridge-react";
import {
    ActionList,
    Badge,
    BlockStack,
    Box,
    Button,
    ButtonGroup,
    Card,
    ChoiceList,
    Divider,
    Icon,
    InlineGrid,
    InlineStack,
    Link as PolarisLink,
    Page,
    Popover,
    ProgressBar,
    ResourceItem,
    ResourceList,
    Scrollable,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonTabs,
    Tabs,
    Text,
    Thumbnail,
    Tooltip
} from "@shopify/polaris";
import {
    AlertCircleIcon,
    AlertTriangleIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    DeleteIcon,
    EditIcon,
    ImageIcon,
    MagicIcon,
    MinusIcon,
    PlusIcon,
    ProductIcon,
    RedoIcon,
    SearchIcon,
    SettingsIcon,
    SortIcon,
    UndoIcon,
    VariantIcon,
    ViewIcon,
    XCircleIcon
} from "@shopify/polaris-icons";
import ProgressNotifier from "../components/common/progress-notifier";
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
    updatePerPage,
    undoGrid,
    getSelectedSeoContents,
    setSeoContentFromAI,
    clearGlobalData,
    updateSortData,
    setSeoContentFromLog,
} from "../components/grid/controller";
import { ConfirmModal } from "../components/common/confirm-modal";
import { AiSeoModal } from "../components/products/ai-seo-modal";
import { SeoLogModal } from "../components/products/seo-log-modal";
import { getHistoryData, getMyPlanData, generateProductAiSeoContent } from "../utils/api";
import { formatNumberWithCommas, formatISOStringToReadableDate, formatTitleCase } from "../utils/formats";
import { useEffectWithoutInitialState } from "../utils/hooks";
import { showInfo } from "../utils/toasts";

const SORT_OPTIONS = [
    { label: 'Published At', value: 'publish_at' },
    { label: 'Created At', value: 'created_at' },
    { label: 'Updated At', value: 'updated_at' },
    { label: 'Price', value: 'price' },
    { label: 'Compare At Price', value: 'compare_at_price' },
    { label: 'Inventory Quantity', value: 'inventory_quantity' },
    { label: 'Weight', value: 'grams' },
];

export default function ProductsPage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({
        shopId: null,
        planId: null,
        editableLimit: null,
        editableCount: 0,
        selectableLimit: null,
        selectableCount: 0,
        aiSeoLimit: null,
        aiSeoCount: 0,
    });
    const setSelectableCount = (count) => setInfo((info) => ({ ...info, selectableCount: count }));

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
    const [ isGridSetUp, setGridSetUp ] = useState(false);
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
        tabId: 0,
        page: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        perPage: 2,
        total: 0,
        loading: false,
        firstLoading: false,
    });
    const [ histories, setHistories ] = useState([]);

    // Confirm Modal
    const [ confirmType, setConfirmType ] = useState(null);
    const [ selectedRows, setSelectedRows ] = useState(null);

    // AI SEO
    const [ aiSeo, setAiSeo ] = useState({ rows: null, loading: false });
    const resetAiSeo = () => setAiSeo({ rows: null, loading: false });

    // AI SEO Log
    const [ seoLog, setSeoLog ] = useState({
        productId: null,
        productName: null,
        thumbnail: null,
        currentSeo: null,
        logs: {},
        currentLogs: [],
        page: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        perPage: 10,
        total: 0,
        loading: false
    });
    const openSeoLog = ({ productId, productName, thumbnail, title, description }) => setSeoLog((log) => ({
        ...log,
        productId,
        productName,
        thumbnail,
        currentSeo: { title, description },
        logs: {},
        currentLogs: [],
        loading: true
    }));

    // Sort
    const [ sort, setSort ] = useState({ open: false, by: SORT_OPTIONS[0].value, desc: false });
    const toggleSortOpen = (open) => setSort((s) => ({ ...s, open: !s.open }));
    const setSortBy = (by) => setSort((s) => ({ ...s, by }));
    const setSortDesc = (desc) => setSort((s) => ({ ...s, desc }));

    async function initProducts() {
        const planData = await getMyPlanData();

        setInfo((info) => ({
            ...info,
            shopId: planData.shopId,
            planId: planData.planId,
            editableLimit: planData.editableLimit,
            editableCount: planData.editableCount,
            selectableLimit: planData.selectableLimit,
            aiSeoLimit: planData.aiSeoLimit,
            aiSeoCount: planData.aiSeoCount,
        }));
    }

    async function setHistoryData() {
        const { data, page: resPage, ...pageInfo } = await getHistoryData({
            updatedBy: [ '', 'shopify', 'gorocket' ][historyInfo.tabId],
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
            setSelectedRows(rows);
            setConfirmType('delete_product');
        }
    }

    const deleteAfterConfirm = async () => {
        startProductAction('delete');
        removeProducts(selectedRows || [], resetProductAction);
    }

    const connectClick = () => {
        startProductAction('connect');
        connectProducts(resetProductAction);
    }

    const searchClick = () => {
        searchProducts();
        hideSaveBar();
    }

    const hideSaveBar = () => {
        shopify.saveBar.hide('products-save-bar');
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

    function startMakingAiSeo() {
        const rows = getSelectedSeoContents();
        setAiSeo((content) => ({ ...content, rows }));
    }

    async function generateAiSeo(data = []) {
        setAiSeo(cont => ({ ...cont, loading: true }));

        try {
            const result = await Promise.all(
                data.map(async (item) => {
                    const { productId, title, description, tags, productType } = item;
                    const res = await generateProductAiSeoContent({ productId, title, description, tags, productType });
                    return {
                        seoProductId: res.seoProductId,
                        seoTitle: res.seoTitle || '',
                        seoDescription: res.seoDescription || '',
                        error: res.errorMsg,
                    };
                })
            );

            const rows = aiSeo.rows.map((row) => {
                const findRow = result.find(r => r.seoProductId === row.productId);
                if (findRow) {
                    return {
                        ...row,
                        seoTitle: findRow.seoTitle,
                        seoDescription: findRow.seoDescription,
                        active: true,
                        error: findRow.error
                    };
                }
                return row;
            });

            setAiSeo((cont) => ({ ...cont, rows, loading: false }));
        } catch (e) {
            console.error(e);
        }
    }

    function applyAiSeo(data) {
        setSeoContentFromAI(data, () => {
            setAiSeo(cont => ({ ...cont, rows: null }));
        });
    }

    function applyAiSeoFromLog({ productId, title, description }) {
        setSeoContentFromLog({ productId, seoTitle: title, seoDescription: description });
    }

    useEffectWithoutInitialState(() => {
        initGrid({
            plan_id: info.planId,
            plan_selected_limit: info.selectableLimit,
            default_per_page: searchPerPage,
            show_changes: (prd) => setHistoryInfo((info) => ({
                ...info,
                product: prd,
                loading: true,
                firstLoading: true
            })),
            show_seo_logs: (prd) => openSeoLog({
                productId: prd.product_id,
                productName: prd.product_name,
                thumbnail: prd.product_img,
                title: prd.seo_title,
                description: prd.seo_description
            }),
            start_grid: () => setGridSetUp(true),
            set_selectable_count: setSelectableCount,
        });
    }, [ info.shopId ]);

    useEffectWithoutInitialState(() => {
        updatePerPage(searchPerPage);
    }, [ searchPerPage ]);

    useEffectWithoutInitialState(() => {
        updateSortData({ sortBy: sort.by, sortDesc: sort.desc });
    }, [ sort.by, sort.desc ]);

    useEffectWithoutInitialState(() => {
        if (productAction.progress === 100) {
            setTimeout(() => {
                resetProductAction();
                if (productAction.type !== 'update') searchClick();
                else if (info.selectableCount < 1) hideSaveBar();
                showInfo('The operation completed successfully.');
            }, 1000);
        }
    }, [ productAction.progress ]);

    useEffectWithoutInitialState(() => {
        if (productAction.inProgress) {
            productActionInterval.current = setInterval(() => {
                setProductActionDuration((duration) => duration + 1);
            }, 1000);
            setDisableUndo(true);
            setDisableRedo(true);
        } else {
            clearInterval(productActionInterval.current);
            setProductActionDuration(1);
            setDisableUndo(false);
            setDisableRedo(false);

            initProducts(); // update plan info
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
        setHistoryData();
    }, [ historyInfo.page, historyInfo.tabId ]);

    useEffect(() => {
        initProducts();

        return () => {
            if (productActionInterval.current) clearInterval(productActionInterval.current);

            clearGlobalData();
        };
    }, []);

    return (
        <Page
            title="Products"
            fullWidth={true}
            secondaryActions={
                <InlineStack gap="200" blockAlign="center">
                    {/*{(!!productAction.inProgress && productAction.type === 'connect') && (*/}
                    {/*    <InlineStack gap="100">*/}
                    {/*        <Box width="60px">*/}
                    {/*            <ProgressBar progress={Math.max(productAction.progress, 5)} tone="success"/>*/}
                    {/*        </Box>*/}
                    {/*        {productActionDuration >= 30 && (*/}
                    {/*            <div className="cursor-pointer" onClick={resetProductAction}>*/}
                    {/*                <Icon source={XCircleIcon} tone="primary"/>*/}
                    {/*            </div>*/}
                    {/*        )}*/}
                    {/*    </InlineStack>*/}
                    {/*)}*/}
                    {/*<Button variant="secondary"*/}
                    {/*        tone="success"*/}
                    {/*        onClick={connectClick}*/}
                    {/*        disabled={productAction.inProgress}*/}
                    {/*        loading={(productAction.type === 'connect' && productAction.inProgress)}>*/}
                    {/*    Connect*/}
                    {/*</Button>*/}
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
                    {/*{(!!productAction.inProgress && productAction.type === 'update') && (*/}
                    {/*    <InlineStack gap="200">*/}
                    {/*        <Box width="60px">*/}
                    {/*            <ProgressBar progress={Math.max(productAction.progress, 5)} tone="highlight"/>*/}
                    {/*        </Box>*/}
                    {/*        {productActionDuration >= 30 && (*/}
                    {/*            <div className="cursor-pointer" onClick={resetProductAction}>*/}
                    {/*                <Icon source={XCircleIcon} tone="primary"/>*/}
                    {/*            </div>*/}
                    {/*        )}*/}
                    {/*    </InlineStack>*/}
                    {/*)}*/}
                    {/*<Button*/}
                    {/*    variant="primary"*/}
                    {/*    onClick={saveClick}*/}
                    {/*    disabled={productAction.inProgress}*/}
                    {/*    loading={(productAction.type === 'update' && productAction.inProgress)}>*/}
                    {/*    Save*/}
                    {/*</Button>*/}
                </InlineStack>
            }
        >
            <ProgressNotifier
                syncCallback={(d) => updateProductAction(d?.progress || 0)}
                updateCallback={(d) => updateProductAction(d?.progress || 0)}
                deleteCallback={(d) => updateProductAction(d?.progress || 0)}
            />
            <SaveBar id="products-save-bar">
                <button variant="primary" onClick={saveClick} {...((productAction.inProgress && productAction.type === 'update') && { loading: '' })}></button>
                <button onClick={searchClick} disabled={productAction.inProgress && productAction.type === 'update'}></button>
            </SaveBar>
            <div className={!isGridSetUp ? '' : 'hidden'}>
                <Card>
                    <BlockStack gap="300">
                        <Box paddingBlock="200">
                            <SkeletonBodyText lines={1}/>
                        </Box>
                        <Divider/>
                        <Box padding="200" borderWidth="050" borderColor="border">
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                            <SkeletonTabs count={12} fitted/>
                        </Box>
                    </BlockStack>
                </Card>
            </div>
            <div className={isGridSetUp ? '' : 'hidden'}>
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
                                <InlineStack gap="200">
                                    <Badge size="large"
                                           tone={(info.editableCount / info.editableLimit) >= 1 ? 'critical' : ((info.editableCount / info.editableLimit) * 10 >= 8 ? 'warning' : 'enabled')}>
                                        <Text as="strong" fontWeight="bold">{info.editableCount}</Text>/{formatNumberWithCommas(info.editableLimit || 0)} edited
                                    </Badge>
                                    <Badge size="large"
                                           tone={(info.selectableCount / info.selectableLimit) >= 1 ? 'critical' : ((info.selectableCount / info.selectableLimit) * 10 >= 8 ? 'warning' : 'enabled')}>
                                        <Text as="strong" fontWeight="bold">{info.selectableCount}</Text>/{formatNumberWithCommas(info.selectableLimit || 0)} selected
                                    </Badge>
                                    <Badge size="large"
                                           tone={(info.aiSeoCount / info.aiSeoLimit) >= 1 ? 'critical' : ((info.aiSeoCount / info.aiSeoLimit) * 10 >= 8 ? 'warning' : 'enabled')}>
                                        <Text as="strong" fontWeight="bold">{info.aiSeoCount}</Text>/{formatNumberWithCommas(info.aiSeoLimit || 0)} seo generated
                                    </Badge>
                                </InlineStack>
                            </InlineStack>
                            <InlineStack gap="200" align="end" blockAlign="center">
                                <ButtonGroup variant="segmented">
                                    <Button icon={UndoIcon} onClick={undoGridClick} disabled={disableUndo}></Button>
                                    <Button icon={RedoIcon} onClick={redoGridClick} disabled={disableRedo}></Button>
                                </ButtonGroup>
                                <Button icon={MagicIcon} variant="primary" onClick={startMakingAiSeo} disabled={false}>AI SEO</Button>
                                <Popover
                                    active={searchPerPagePopoverActive}
                                    activator={
                                        <Button icon={ViewIcon} onClick={toggleSearchPerPagePopover}>{searchPerPage}</Button>
                                    }
                                    onClose={toggleSearchPerPagePopover}
                                >
                                    <Box padding="300" paddingBlockEnd="050" paddingInlineEnd="800">
                                        <Text as="span" variant="headingMd" fontWeight="regular" alignment="start">Per page</Text>
                                    </Box>
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
                                    active={sort.open}
                                    activator={<Button icon={SortIcon} onClick={toggleSortOpen}></Button>}
                                    onClose={toggleSortOpen}
                                >
                                    <Scrollable shadow style={{ height: '300px' }} focusable scrollbarGutter="stable" scrollbarWidth="thin">
                                        <Box padding="300">
                                            <ChoiceList
                                                title={<Text as="span" variant="headingMd" fontWeight="regular">Sort by</Text>}
                                                choices={SORT_OPTIONS}
                                                selected={sort.by}
                                                onChange={(v) => setSortBy(v)}
                                            />
                                        </Box>
                                        <Divider/>
                                        <Box paddingBlock="200" paddingInline="150">
                                            <BlockStack gap="100">
                                                <Button icon={ArrowUpIcon} variant="tertiary" textAlign="left"
                                                        pressed={!sort.desc} onClick={() => setSortDesc(false)}>
                                                    <Text as="span" fontWeight="regular">Ascending</Text>
                                                </Button>
                                                <Button icon={ArrowDownIcon} variant="tertiary" textAlign="left"
                                                        pressed={sort.desc} onClick={() => setSortDesc(true)}>
                                                    <Text as="span" fontWeight="regular">Descending</Text>
                                                </Button>
                                            </BlockStack>
                                        </Box>
                                    </Scrollable>
                                </Popover>
                                <Popover
                                    active={gridCustomPopoverActive}
                                    activator={<Button icon={SettingsIcon} onClick={toggleGridCustomPopover}></Button>}
                                    onClose={toggleGridCustomPopover}
                                >
                                    <ActionList
                                        actionRole="menuitem"
                                        onActionAnyItem={toggleGridCustomPopover}
                                        items={[
                                            {
                                                content: 'Save Columns',
                                                onAction: () => setConfirmType('save_columns'),
                                                disabled: productAction.inProgress
                                            },
                                            {
                                                content: 'Reset Columns',
                                                onAction: () => setConfirmType('reset_columns'),
                                                disabled: productAction.inProgress
                                            }
                                        ]}
                                    />
                                </Popover>
                                <Button id="search_product"
                                        variant="primary"
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
            </div>
            <AiSeoModal open={!!aiSeo.rows && aiSeo.rows.length > 0} onClose={resetAiSeo} contents={aiSeo.rows || []} onGenerate={generateAiSeo} generateLoading={aiSeo.loading} onApply={applyAiSeo}/>
            <SeoLogModal seoLog={seoLog} setSeoLog={setSeoLog} onApply={applyAiSeoFromLog}/>
            <Modal
                variant="large"
                open={!!historyInfo.product}
                onHide={() => setHistoryInfo((info) => ({ ...info, product: null }))}
            >
                <TitleBar title={`${historyInfo.product?.product_name || ''}'s change history`}></TitleBar>
                <Tabs tabs={[
                    { id: 'all-history-filter-1', content: 'All' },
                    { id: 'shopify-history-filter-1', content: 'In Shopify' },
                    { id: 'gorocket-history-filter-1', content: 'Via App' },
                ]} selected={historyInfo.tabId} onSelect={(num) => setHistoryInfo((i => ({ ...i, page: 1, tabId: num, loading: true })))}/>
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
                                hasNext: historyInfo.page < historyInfo.lastPage,
                                onPrevious: () => setHistoryInfo((hInfo) => ({ ...hInfo, page: Math.max(hInfo.page - 1, 1), loading: true })),
                                onNext: () => setHistoryInfo((hInfo) => ({ ...hInfo, page: Math.min(hInfo.page + 1, hInfo.lastPage), loading: true })),
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
                                                                                <Tooltip content={formatTitleCase(log.event.replaceAll('_', ' '))}>
                                                                                    <PolarisLink url={`shopify://admin/products/${log.product_id}` + (log.event === 'product_variant_update' && !!log.variant ? '/variants/' + log.variant.variant_id : '')}>
                                                                                        <Icon source={log.event === 'product_delete' ? DeleteIcon : (log.event === 'product_variant_update' ? VariantIcon : ProductIcon)}
                                                                                              tone={log.event === 'product_delete' ? 'critical' : (log.event === 'product_variant_update' ? 'warning' : 'info')}
                                                                                        />
                                                                                    </PolarisLink>
                                                                                </Tooltip>
                                                                            </InlineStack>
                                                                            <InlineStack gap="200">
                                                                                <Badge progress="complete" tone={log.updated_by === 'gorocket' ? 'magic' : 'success'}>
                                                                                    {{ shopify: 'in shopify', gorocket: 'via app' }[log.updated_by]}
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
            <ConfirmModal
                open={!!confirmType}
                onClose={() => setConfirmType(null)}
                size="small"
                primaryText={confirmType === 'save_columns' ? 'Save' : (confirmType === 'reset_columns' ? 'Reset' : (confirmType === 'delete_product' ? 'Delete' : ''))}
                primaryTone={confirmType === 'reset_columns' ? 'critical' : ''}
                onPrimary={async () => {
                    setConfirmType(null);

                    switch (confirmType) {
                        case 'save_columns':
                            await saveColumns();
                            break;
                        case 'reset_columns':
                            await resetColumns();
                            break;
                        case 'delete_product':
                            await deleteAfterConfirm();
                            break;
                    }
                }}
            >
                {confirmType === 'save_columns' ? (
                    <InlineStack blockAlign="center" gap="100">
                        <Box>
                            <Icon source={CheckCircleIcon} tone="success"/>
                        </Box>
                        <Text as="p" variant="bodySm">Save your column layout and preferences?</Text>
                    </InlineStack>
                ) : confirmType === 'reset_columns' ? (
                    <InlineStack blockAlign="center" gap="100">
                        <Box>
                            <Icon source={AlertCircleIcon} tone="warning"/>
                        </Box>
                        <Text as="p" variant="bodySm">Reset your column layout to default?</Text>
                    </InlineStack>
                ) : confirmType === 'delete_product' ? (
                    <InlineStack blockAlign="center" gap="100">
                        <Box>
                            <Icon source={AlertCircleIcon} tone="critical"/>
                        </Box>
                        <Text as="p" variant="bodySm">Are you sure you want to
                            delete <strong>{(selectedRows || []).length}</strong> {(selectedRows || []).length < 2 ? 'product' : 'products'}?</Text>
                    </InlineStack>
                ) : ''}
            </ConfirmModal>
        </Page>
    );
}
