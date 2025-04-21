import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    CalloutCard,
    Card,
    Icon,
    Image,
    InlineGrid,
    InlineStack,
    Link as PolarisLink,
    MediaCard,
    Page,
    ProgressBar,
    SkeletonBodyText,
    SkeletonDisplayText,
    Text,
    Tooltip,
    VideoThumbnail
} from "@shopify/polaris";
import { XCircleIcon } from "@shopify/polaris-icons";
import ProgressNotifier from "../components/common/progress-notifier";
import { getDashboardData, getMyPlanData, getPlanData, getTotalProductCount, syncProducts } from "../utils/api";
import { formatNumberWithCommas } from "../utils/formats";
import { getStorage, goToChargesPage, setStorage, useEffectWithoutInitialState } from "../utils/hooks";

export default function HomePage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({
        shopId: null,
        plan: null,
        totalProductCount: 0,
        syncData: null,
        historyCount: 0,
        historyLimit: 0,
        aiSeoCount: 0,
        aiSeoLimit: 0,
    });
    const [ allPlans, setAllPlans ] = useState([]);
    const [ introCard, setIntroCard ] = useState({ banner1: true, banner2: true });

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
        const banner1 = getStorage('index-banner1', 'local') !== 'dismiss';
        const banner2 = getStorage('index-banner2', 'local') !== 'dismiss';
        setIntroCard((card) => ({ ...card, banner1, banner2 }));

        const dashboardData = await getDashboardData(); // shopId, plan, totalProductCount, syncData
        const planData = await getMyPlanData(); // shopId, planId, editableLimit, editableCount, selectableLimit, aiSeoLimit, aiSeoCount

        setInfo((info) => ({
            ...info, ...(dashboardData || {}),
            historyCount: planData?.editableCount || 0,
            historyLimit: planData?.editableLimit || 0,
            aiSeoCount: planData?.aiSeoCount || 0,
            aiSeoLimit: planData?.aiSeoLimit || 0,
        }));

        const allPlansData = await getPlanData();
        setAllPlans(allPlansData.plans || []);
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
        if (!introCard.banner1) {
            setStorage('index-banner1', 'dismiss', 'local');
        }
    }, [ introCard.banner1 ]);

    useEffectWithoutInitialState(() => {
        if (!introCard.banner2) {
            setStorage('index-banner2', 'dismiss', 'local');
        }
    }, [ introCard.banner2 ]);

    useEffectWithoutInitialState(() => {
        if (!!info.syncData?.syncing) {
            startCustomAction('connect', info.syncData.progress || 0);
        }
    }, [ info.syncData ]);

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

        return () => {
            if (customActionInterval.current) clearInterval(customActionInterval.current);
        };
    }, []);

    return (
        <Page
            title="Gorocket Editor"
            secondaryActions={[
                { content: 'Products', onAction: () => navigate('/products') },
                { content: 'History', onAction: () => navigate('/history') },
                { content: 'Plan', onAction: () => navigate('/plan') }
            ]}
        >
            <ProgressNotifier syncCallback={(d) => updateCustomAction(d?.progress || 0)}/>
            <BlockStack gap="200">
                {introCard.banner1 &&
                    <CalloutCard
                        title="Connect and manage your products"
                        illustration="https://cdn-icons-png.flaticon.com/128/7603/7603938.png"
                        primaryAction={{ content: 'Manage Products', onAction: () => navigate('/products') }}
                        // onDismiss={() => setIntroCard((card) => ({ ...card, banner1: false }))}
                    >
                        <p>Connect Shopify products and manage them with GoRocket Editor.</p>
                    </CalloutCard>
                }
                {introCard.banner2 && (
                    <Box>
                        <MediaCard
                            size="small"
                            title="Getting Started with GoRocket Editor"
                            primaryAction={{
                                content: 'Learn more',
                                onAction: () => window.open('https://youtu.be/zt2i6OD8T0w?si=2x10QGgHLLsD3yxR', '_blank'),
                            }}
                            description={`A quick guide to using GoRocket Editor for managing your Shopify product content. Learn how to edit descriptions, manage tags, and customize HTML—step by step.`}
                            popoverActions={[ {
                                content: 'Dismiss',
                                onAction: () => setIntroCard((card) => ({ ...card, banner2: false }))
                            } ]}
                        >
                            <VideoThumbnail
                                videoLength={256}
                                thumbnailUrl="http://i3.ytimg.com/vi/zt2i6OD8T0w/hqdefault.jpg?width=1850"
                                onClick={() => window.open('https://youtu.be/zt2i6OD8T0w?si=2x10QGgHLLsD3yxR', '_blank')}
                            />
                        </MediaCard>
                    </Box>
                )}
                {!info.plan ? (
                    <InlineGrid gap="200" columns={{ xs: 1, md: 2, lg: 4 }}>
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
                        <Card>
                            <BlockStack gap="300">
                                <SkeletonDisplayText size="small"/>
                                <SkeletonBodyText lines={2}/>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                ) : (
                    <InlineGrid gap="200" columns={{ xs: 1, md: 2, lg: 4 }}>
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
                                    {!!info.plan.billing_on && (
                                        <Box paddingBlockStart={100}>
                                            <Badge tone={info.plan.status === 'CANCELLED' ? 'critical' : 'info'}>
                                                <Text as="span" variant="bodyXs" fontWeight="semibold">
                                                    {info.plan.status === 'CANCELLED'
                                                        ? `Ends ${info.plan.billing_on.substring(0, 10).replaceAll('-', '.')}`
                                                        : `Renews ${info.plan.billing_on.substring(0, 10).replaceAll('-', '.')}`
                                                    }
                                                </Text>
                                            </Badge>
                                        </Box>
                                    )}
                                </InlineStack>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="200">
                                <Text as="h2" variant="headingMd">Total Product Count</Text>
                                <Box paddingBlockStart={200}>
                                    <Text as="p" variant="headingXl">{formatNumberWithCommas(info.totalProductCount)} <Text
                                        as="span" variant="bodySm" tone="subdued">products</Text></Text>
                                </Box>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="600">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Bulk Edit</Text>
                                    <Button onClick={() => navigate('/history')} variant="plain"
                                            accessibilityLabel="history">History</Button>
                                </InlineGrid>
                                <InlineStack gap="400" blockAlign="center">
                                    <div style={{ width: 70 }}>
                                        <ProgressBar
                                            size="small"
                                            progress={info.historyCount / Math.max(info.historyLimit, 1) * 100}
                                            tone={(info.historyCount / Math.max(info.historyLimit, 1) * 10) >= 8 ? 'critical' : 'primary'}/>
                                    </div>
                                    <Tooltip
                                        active={(info.historyCount / Math.max(info.historyLimit, 1) * 10) >= 8}
                                        preferredPosition="below"
                                        width="wide"
                                        content={
                                            <Box padding="200">
                                                <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                                                    <Text as="span">
                                                        Upgrade your plan if you need additional bulk editing features.
                                                    </Text>
                                                    <Button variant="primary" onClick={() => navigate('/plan')}>Upgrade</Button>
                                                </InlineGrid>
                                            </Box>
                                        }>
                                        <Text as="p" variant="bodyLg">
                                            <Text as="span"
                                                  fontWeight="bold">{formatNumberWithCommas(info.historyCount)}</Text>
                                            /{formatNumberWithCommas(info.historyLimit)}
                                        </Text>
                                    </Tooltip>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="600">
                                <Text as="h2" variant="headingMd">AI SEO Generation</Text>
                                <InlineStack gap="400" blockAlign="center">
                                    <div style={{ width: 70 }}>
                                        <ProgressBar
                                            size="small"
                                            progress={info.aiSeoCount / Math.max(info.aiSeoLimit, 1) * 100}
                                            tone={(info.aiSeoCount / Math.max(info.aiSeoLimit, 1) * 10) >= 8 ? 'critical' : 'primary'}/>
                                    </div>
                                    <Tooltip
                                        active={(info.aiSeoCount / Math.max(info.aiSeoLimit, 1) * 10) >= 8}
                                        preferredPosition="below"
                                        width="wide"
                                        content={
                                            <Box padding="200">
                                                <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                                                    <Text as="span">
                                                        Upgrade your plan if you need additional AI SEO generation.
                                                    </Text>
                                                    <Button variant="primary" onClick={() => navigate('/plan')}>Upgrade</Button>
                                                </InlineGrid>
                                            </Box>
                                        }>
                                        <Text as="p" variant="bodyLg">
                                            <Text as="span"
                                                  fontWeight="bold">{formatNumberWithCommas(info.aiSeoCount)}</Text>
                                            /{formatNumberWithCommas(info.aiSeoLimit)}
                                        </Text>
                                    </Tooltip>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                )}
                <Card>
                    <Box>
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
                                                <Text as="span" variant="bodySm" tone="success" fontWeight="bold" style={{ minWidth: '32px', textAlign: 'right', letterSpacing: '-0.2px' }}>
                                                    {Math.round(Math.max(customAction.progress, 3))}%
                                                </Text>
                                                {customActionDuration >= 180 && (
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
                            {info.plan?.id && info.plan.id < 3 && (() => {
                                const nextPlan = allPlans.find(p => p.id === (info.plan.id + 1));
                                return (
                                    <p>
                                        With the <PolarisLink monochrome onClick={() => goToChargesPage(nextPlan?.id || null)}>
                                        {nextPlan?.name || ''} Plan
                                        </PolarisLink>, you can perform up to {formatNumberWithCommas(nextPlan?.limits?.edit_limit || 0)} bulk edits and generate up to {formatNumberWithCommas(nextPlan?.limits?.ai_limit || 0)} AI SEO per day.
                                    </p>
                                );
                            })()}
                            <Box width="100%" paddingBlockStart="800">
                                <BlockStack inlineAlign='end'>
                                    <Button onClick={() => open('mailto:support@gorocket3.ai')}>
                                        <Text as="span" tone="subdued">Contact us</Text>
                                    </Button>
                                </BlockStack>
                            </Box>
                        </BlockStack>
                    </Box>
                </Card>
                <Box paddingBlock={{ xs: 1000, md: 0 }}></Box>
            </BlockStack>
        </Page>
    );
}
