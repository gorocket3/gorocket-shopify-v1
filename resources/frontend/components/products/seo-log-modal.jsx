import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
    Box,
    Card,
    Text,
    DataTable,
    BlockStack,
    InlineGrid,
    Button,
    Thumbnail,
    SkeletonDisplayText,
    SkeletonBodyText,
    InlineStack,
    Badge
} from "@shopify/polaris";
import { getProductAiSeoLogs } from "../../utils/api";
import { formatISOStringToReadableDate, formatNumberWithCommas } from "../../utils/formats";
import { useEffectWithoutInitialState } from "../../utils/hooks";

export function SeoLogModal({ seoLog, setSeoLog, onApply }) {
    const setSeoLogPage = (page) => setSeoLog((log) => ({ ...log, page, loading: true }));
    const closeSeoLog = () => setSeoLog((log) => ({ ...log, productId: null, page: 1 }));

    const applySeo = async (title, description) => {
        await onApply({ productId: seoLog.productId, title, description });
        closeSeoLog();
    }

    const getSeoLogs = async () => {
        if (!!seoLog.logs[seoLog.page]) {
            const currentLogs = seoLog.logs[seoLog.page];
            setSeoLog((log) => ({
                ...log, ...(currentLogs.pageInfo || {}),
                currentLogs: currentLogs.data,
                loading: false
            }));
            return;
        }

        const { data, page: resPage, ...pageInfo } = await getProductAiSeoLogs({
            productId: seoLog.productId,
            perPage: seoLog.perPage,
            page: seoLog.page
        });
        const customData = data.map((item) => {
            return [ {
                id: item.id,
                createdAt: formatISOStringToReadableDate(item.created_at, { time: true }),
                title: item.title,
                description: item.description,
            } ];
        });
        setSeoLog((log) => ({
            ...log,
            ...(pageInfo || {}),
            logs: { ...log.logs, [log.page]: { data: customData, pageInfo } },
            currentLogs: customData,
            loading: false
        }));
    }

    useEffectWithoutInitialState(() => {
        if (!!seoLog.productId) getSeoLogs();
    }, [ seoLog.productId, seoLog.page ]);

    return (
        <Modal
            variant="large"
            open={!!seoLog.productId}
            onHide={closeSeoLog}
        >
            <TitleBar title="AI SEO Generation Log"></TitleBar>
            <Box padding="400">
                <Box paddingBlockEnd="400">
                    <InlineGrid columns="auto 1fr" gap="200" alignItems="center">
                        <Thumbnail source={seoLog.thumbnail || ''} alt={''} size="small"/>
                        <Text as="h4" variant="bodyLg">{seoLog.productName || ''}</Text>
                    </InlineGrid>
                </Box>
                <Card padding="0">
                    <DataTable
                        columnContentTypes={[ 'text' ]}
                        headings={[]}
                        hideScrollIndicator={true}
                        increasedTableDensity={true}
                        stickyHeader={true}
                        totals={[ '' ]}
                        totalsName={{ singular: `Totals ${seoLog.total}`, plural: `Totals ${seoLog.total}` }}
                        pagination={{
                            hasPrevious: seoLog.page > 1,
                            hasNext: seoLog.page < seoLog.lastPage,
                            onPrevious: () => setSeoLogPage(Math.max(seoLog.page - 1, 1)),
                            onNext: () => setSeoLogPage(Math.min(seoLog.page + 1, seoLog.lastPage)),
                            label: seoLog.total < 1 ? '0 logs' : `${seoLog.from || 0}-${seoLog.to || 0} of ${formatNumberWithCommas(seoLog.total)} logs`,
                        }}
                        rows={seoLog.loading ? [ [ (
                            <>
                                <Box paddingInline="200" paddingBlock="400">
                                    <BlockStack gap="400">
                                        <SkeletonDisplayText size="small"/>
                                        <SkeletonBodyText lines={2}/>
                                    </BlockStack>
                                </Box>
                                <Box paddingInline="200" paddingBlock="400">
                                    <BlockStack gap="400">
                                        <SkeletonDisplayText size="small"/>
                                        <SkeletonBodyText lines={2}/>
                                    </BlockStack>
                                </Box>
                            </>
                        ) ] ] : seoLog.currentLogs.map(item => {
                            const { createdAt, title, description } = item[0];
                            return [
                                <Box padding="100">
                                    <BlockStack gap="100">
                                        <InlineGrid columns="1fr auto" gap="200" alignItems="center">
                                            <InlineStack gap="200">
                                                <Text as="span" tone="subdued">{createdAt}</Text>
                                                <div
                                                    className={seoLog.currentSeo.title === title && seoLog.currentSeo.description === description ? '' : 'hidden'}>
                                                    <Badge tone="magic">
                                                        <Text as="span" variant="bodyXs" fontWeight="semibold"
                                                              tone="magic">Applied</Text>
                                                    </Badge>
                                                </div>
                                            </InlineStack>
                                            <div
                                                className={seoLog.currentSeo.title === title && seoLog.currentSeo.description === description ? 'hidden' : ''}>
                                                <Button size="micro"
                                                        onClick={() => applySeo(title, description)}>Apply</Button>
                                            </div>
                                        </InlineGrid>
                                        <Text as="p" fontWeight="semibold" breakWord>{title}</Text>
                                        <Box paddingBlockStart="300">
                                            <Text as="span" breakWord>{description}</Text>
                                        </Box>
                                    </BlockStack>
                                </Box>
                            ];
                        })}
                    />
                </Card>
            </Box>
        </Modal>
    );
}
