import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { Box, Card, Text, IndexTable, useIndexResourceState, Button, InlineStack } from "@shopify/polaris";

export function AiSeoModal({ open, onClose, contents, onGenerate, generateLoading, onApply }) {
    const { selectedResources, allResourcesSelected, handleSelectionChange, removeSelectedResources } = useIndexResourceState(contents);

    const onHide = async () => {
        await removeSelectedResources(selectedResources);
        onClose();
    }

    return (
        <Modal
            variant="large"
            open={open}
            onHide={onHide}
        >
            <TitleBar title="AI SEO Information Generator">
                <button variant="primary" onClick={async () => {
                    await onApply(selectedResources.map((productId) => {
                        return contents.find((content) => content.productId === productId);
                    }));
                    removeSelectedResources(selectedResources);
                }}>Apply
                </button>
                <button onClick={onHide}>Cancel</button>
            </TitleBar>
            <Box padding="600">
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
                                           seoTitle,
                                           seoDescription,
                                           active
                                       }, index) => (
                                <IndexTable.Row
                                    id={productId}
                                    key={'seo_' + productId}
                                    selected={selectedResources.includes(productId)}
                                    position={index}
                                >
                                    <IndexTable.Cell>
                                        <Text variant="bodyMd" fontWeight="bold" as="span">
                                            {title}
                                        </Text>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <InlineStack align="center">
                                            <Button onClick={(e) => {
                                                e.stopPropagation();
                                                onGenerate([ { productId, title, description, tags } ]);
                                            }}>
                                                Generate
                                            </Button>
                                        </InlineStack>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell className="ai-seo-table-column-active">
                                        <Text variant="bodyMd" as="span" tone={active ? 'magic' : ''}
                                              fontWeight={active ? 'bold' : ''}>
                                            {seoTitle || ''}
                                        </Text>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell className="ai-seo-table-column-active">
                                        <Text variant="bodyMd" as="span" tone={active ? 'magic' : ''}
                                              fontWeight={active ? 'bold' : ''}>
                                            {seoDescription || ''}
                                        </Text>
                                    </IndexTable.Cell>
                                </IndexTable.Row>
                            ),
                        )}
                    </IndexTable>
                </Card>
            </Box>
        </Modal>
    );
}
