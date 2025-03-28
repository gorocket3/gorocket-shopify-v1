import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pusher from "pusher-js";
import {
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
    Link as PolarisLink,
    Page,
    ProgressBar,
    SkeletonBodyText,
    SkeletonDisplayText,
    Text,
    Tooltip
} from "@shopify/polaris";
import { XCircleIcon } from "@shopify/polaris-icons";
import { getDashboardData, getHistoryCountData, getTotalProductCount, syncProducts } from "../utils/api";
import { formatNumberWithCommas } from "../utils/formats";
import { goToChargesPage, useEffectWithoutInitialState } from "../utils/hooks";

export default function HomePage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({
        shopId: null,
        plan: null,
        totalProductCount: 0,
        syncData: null,
        historyCount: 0,
        historyLimit: 0
    });
    const [ introCard, setIntroCard ] = useState({ dismissed: false });
    const setIntroCardDismissed = (dismissed) => setIntroCard((card) => ({ ...card, dismissed }));

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

    async function initDashboard() {
        const dashboardData = await getDashboardData(); // shopId, plan, totalProductCount, syncData
        const historyData = await getHistoryCountData(); // historyCount, historyLimit

        setInfo((info) => ({
            ...info, ...(dashboardData || {}),
            historyCount: historyData?.count || 0,
            historyLimit: historyData?.limit || 0
        }));
    }

    async function setTotalProductCount() {
        const count = await getTotalProductCount();
        setInfo((info) => ({ ...info, totalProductCount: count || 0 }));
    }

    async function handleSyncProducts() {
        try {
            startCustomAction('connect');
            await syncProducts();
        } catch (e) {
            resetCustomAction();
        }
    }

    useEffectWithoutInitialState(() => {
        if (!!info.syncData?.syncing) {
            startCustomAction('connect', info.syncData.progress || 0);
        }
    }, [ info.syncData ]);

    useEffectWithoutInitialState(() => {
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const channelName = 'gorocket-shop-' + info.shopId;
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
    }, [ info.shopId ]);

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
        if (customAction.complete) setTotalProductCount();
    }, [ customAction.complete ]);

    useEffect(() => {
        initDashboard();
    }, []);

    return (
        <Page
            title="Gorocket Editor"
            secondaryActions={[
                { content: 'Products', onAction: () => navigate('/products') },
                { content: 'Plan', onAction: () => navigate('/plan') },
                { content: 'History', onAction: () => navigate('/history') },
            ]}
        >
            <BlockStack gap="200">
                {!introCard.dismissed &&
                    <CalloutCard
                        title="Connect and manage your products"
                        illustration="https://cdn-icons-png.flaticon.com/128/7603/7603938.png"
                        primaryAction={{ content: 'Manage Products', onAction: () => navigate('/products') }}
                        onDismiss={() => setIntroCardDismissed(true)}
                    >
                        <p>Connect Shopify products and manage them with GoRocket Editor.</p>
                    </CalloutCard>
                }
                {!info.plan ? (
                    <InlineGrid gap="200" columns={{ xs: 1, md: 3 }}>
                        <Card>
                            <BlockStack gap="300">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={2}/>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="300">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={2}/>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="300">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={2}/>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                ) : (
                    <InlineGrid gap="200" columns={{ xs: 1, md: 3 }}>
                        <Card>
                            <BlockStack gap="400">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Active plan</Text>
                                    {info.plan.id === 1 && (
                                        <Button onClick={() => navigate('/plan')} variant="plain"
                                                accessibilityLabel="Upgrade">Upgrade</Button>
                                    )}
                                </InlineGrid>
                                <InlineStack gap="200" blockAlign="center">
                                    <Text as="p" variant="headingXl">{info.plan.name}</Text>
                                    {false ?
                                        <Box paddingBlockStart={100}>
                                            <Badge tone="critical">
                                                <Text as="span" variant="bodyXs" fontWeight="semibold">Trial D-?</Text>
                                            </Badge>
                                        </Box>
                                        : (!!info.plan.billing_on &&
                                            <Box paddingBlockStart={100}>
                                                <Badge tone="info">
                                                    <Text as="span" variant="bodyXs"
                                                          fontWeight="semibold">Until {info.plan.billing_on.substring(0, 10).replaceAll('-', '.')}</Text>
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
                                    <Button onClick={() => navigate('/products')}
                                            accessibilityLabel="Manage">Manage</Button>
                                </InlineGrid>
                                <Text as="p" variant="headingXl">{formatNumberWithCommas(info.totalProductCount)} <Text
                                    as="span" variant="bodySm" tone="subdued">products</Text></Text>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="600">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Product Edit Count</Text>
                                    <Button onClick={() => navigate('/history')} variant="plain"
                                            accessibilityLabel="history">History</Button>
                                </InlineGrid>
                                <InlineStack gap="400" blockAlign="center">
                                    <div style={{ width: 70 }}>
                                        <ProgressBar
                                            size="small"
                                            progress={info.historyCount / Math.max(info.historyLimit, 1) * 100}
                                            tone={(info.historyCount / Math.max(info.historyLimit, 1) * 100) > 90 ? 'critical' : 'highlight'}/>
                                    </div>
                                    <Tooltip
                                        active={(info.historyCount / Math.max(info.historyLimit, 1) * 100) > 90}
                                        preferredPosition="below"
                                        width="wide"
                                        content="Upgrading your plan will allow you to edit more products.">
                                        <Text as="p" variant="bodyLg">
                                            <Text as="span"
                                                  fontWeight="bold">{formatNumberWithCommas(info.historyCount)}</Text>
                                            /{formatNumberWithCommas(info.historyLimit)}
                                        </Text>
                                    </Tooltip>
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
                                {info.shopId ? (
                                    <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                                        <Button onClick={() => navigate('/products')}>Manage Products</Button>
                                        {customAction.in_progress ? (
                                            <InlineStack gap="100" blockAlign="center">
                                                <Box width="140px">
                                                    <ProgressBar progress={Math.max(customAction.progress, 3)}
                                                                 tone="success"/>
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
                                                        onClick={handleSyncProducts}
                                                        disabled={customAction.complete}
                                                        loading={customAction.in_progress}>
                                                    {customAction.complete ? 'Completed!' : 'Connect Products'}
                                                </Button>
                                            </Box>
                                        )}
                                    </InlineGrid>
                                ) : (
                                    <InlineGrid columns="1fr auto" alignItems="center">
                                        <Box width="140px">
                                            <SkeletonDisplayText size="small"/>
                                        </Box>
                                        <Box width="140px">
                                            <SkeletonDisplayText size="small"/>
                                        </Box>
                                    </InlineGrid>
                                )}
                            </Box>
                            <p>
                                With <PolarisLink monochrome onClick={() => goToChargesPage()}>Basic Plan</PolarisLink>,
                                you
                                can integrate and
                                manage
                                over 100,000 products.
                            </p>
                        </BlockStack>
                    </Box>
                </Card>
                <Box paddingInline={{ xs: 200, sm: 0 }}>
                    <BlockStack inlineAlign='end'>
                        <Button onClick={() => open('mailto:gorocket33@gmail.com')}>
                            Customer Support
                        </Button>
                    </BlockStack>
                </Box>
                <FooterHelp>
                    &copy; 2025 GoRocket. By using this app, you agree to the <PolarisLink><Link url="#">Privacy
                    Policy</Link></PolarisLink>.
                </FooterHelp>
            </BlockStack>
        </Page>
    );
}
