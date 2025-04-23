import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
    Box,
    Card,
    Text,
    IndexTable,
    useIndexResourceState,
    Button,
    InlineStack,
    BlockStack,
    Badge,
    InlineError
} from "@shopify/polaris";
import { formatNumberWithCommas } from "../../utils/formats";

export function AiSeoModal({ open, onClose, contents, aiQuota, onGenerate, generateLoading, onApply }) {
    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection
    } = useIndexResourceState(contents);

    const onHide = async () => {
        await clearSelection();
        onClose();
    }

    const getApplyContents = () => {
        return selectedResources
            .map((productId) => contents.find((content) => content.productId === productId && !content.error))
            .filter((content => !!content));
    }

    return (
        <Modal
            variant="large"
            open={open}
            onHide={onHide}
        >
            <TitleBar title="AI SEO Information Generator">
                <button variant="primary" disabled={selectedResources.length < 1} onClick={async () => {
                    await onApply(getApplyContents());
                    clearSelection();
                }}>Apply
                </button>
                <button onClick={onHide}>Cancel</button>
            </TitleBar>
            <Box padding="400">
                <BlockStack gap="400">
                    <InlineStack gap="200" blockAlign="center">
                        <Badge size="large" tone={(aiQuota.count / aiQuota.limit) >= 1 ? 'critical' : ((aiQuota.count / aiQuota.limit) * 10 >= 8 ? 'warning' : 'enabled')}>
                            <Text as="strong" fontWeight="bold">
                                {aiQuota.count}
                            </Text>/{formatNumberWithCommas(aiQuota.limit || 0)} seo generated
                        </Badge>
                        {(aiQuota.count / aiQuota.limit) >= 1 ? (
                            <InlineError message="You’ve reached the limit for your current plan. Upgrade plan to keep going without restrictions." fieldID="ai-seo-error-message" />
                        ) : (aiQuota.count / aiQuota.limit) * 10 >= 8 ? (
                            <InlineError message="You’re close to the limit for your current plan. Upgrade plan to keep going without restrictions." fieldID="ai-seo-error-message" />
                        ) : ''}
                    </InlineStack>
                    <Card padding="0">
                        <IndexTable
                            resourceName={{ singular: 'content', plural: 'contents' }}
                            itemCount={contents.length}
                            promotedBulkActions={[
                                {
                                    content: 'Selected Generate',
                                    onAction: () => onGenerate(selectedResources.map((productId) => {
                                        const content = contents.find((content) => content.productId === productId);
                                        return {
                                            productId: content.productId,
                                            title: content.title,
                                            description: content.description,
                                            tags: content.tags,
                                            productType: content.productType,
                                            productImg: content.productImg,
                                            productAlt: content.productAlt
                                        };
                                    }))
                                }
                            ]}
                            selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                            onSelectionChange={handleSelectionChange}
                            loading={generateLoading}
                            headings={[
                                { title: 'Product Name' },
                                { title: 'Generate', alignment: 'center' },
                                { title: 'AI SEO Title' },
                                { title: 'AI SEO Description' },
                            ]}
                        >
                            {contents.map(({
                                               productId,
                                               title,
                                               description,
                                               tags,
                                               productType,
                                               productImg,
                                               productAlt,
                                               seoTitle,
                                               seoDescription,
                                               error,
                                               active
                                           }, index) => (
                                    <IndexTable.Row
                                        id={productId}
                                        key={'seo_' + productId}
                                        selected={selectedResources.includes(productId)}
                                        position={index}
                                        tone={error ? 'critical' : (!!seoTitle && !!seoDescription ? 'success' : '')}
                                    >
                                        <IndexTable.Cell className="index-col col-md">
                                            <Text variant="bodyMd" fontWeight="bold" as="span">
                                                {title}
                                            </Text>
                                        </IndexTable.Cell>
                                        <IndexTable.Cell className="index-col col-sm">
                                            <InlineStack align="center">
                                                <Button onClick={(e) => {
                                                    e.stopPropagation();
                                                    onGenerate([ { productId, title, description, tags, productType, productImg, productAlt } ], () => {
                                                        if (!selectedResources.includes(productId)) {
                                                            selectedResources.push(productId);
                                                        }
                                                    });
                                                }}>
                                                    Generate
                                                </Button>
                                            </InlineStack>
                                        </IndexTable.Cell>
                                        {error ? (
                                            <IndexTable.Cell colSpan={2} className="blinking">
                                                <Text variant="bodyMd" as="span" tone="critical">
                                                    Failed ({error || '-'})
                                                </Text>
                                            </IndexTable.Cell>
                                        ) : (
                                            <>
                                                <IndexTable.Cell className="index-col col-md">
                                                    <Text variant="bodyMd" as="span" tone={active ? 'magic' : ''}
                                                          fontWeight={active ? 'bold' : ''}>
                                                        {seoTitle || ''}
                                                    </Text>
                                                </IndexTable.Cell>
                                                <IndexTable.Cell className="index-col col-lg">
                                                    <Text variant="bodyMd" as="span" tone={active ? 'magic' : ''}
                                                          fontWeight={active ? 'bold' : ''}>
                                                        {seoDescription || ''}
                                                    </Text>
                                                </IndexTable.Cell>
                                            </>
                                        )}
                                    </IndexTable.Row>
                                ),
                            )}
                        </IndexTable>
                    </Card>
                </BlockStack>
            </Box>
        </Modal>
    );
}
