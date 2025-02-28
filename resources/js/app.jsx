import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
    AppProvider,
    BlockStack,
    Button,
    CalloutCard,
    Card,
    EmptyState,
    FooterHelp,
    InlineGrid,
    InlineStack,
    Link,
    Page,
    ProgressBar,
    Text
} from '@shopify/polaris';
import fetchData from "./api/fetch";
import '@shopify/polaris/build/esm/styles.css';

function App() {
    const [ introCardDismissed, setIntroCardDismissed ] = useState(false);
    const [ syncLoading, setSyncLoading ] = useState(false);
    const [ syncCompleted, setSyncCompleted ] = useState(false);

    async function syncProducts() {
        try {
            setSyncLoading(true);
            const res = await fetchData({ method: 'POST', url: '/api/products/sync' });
            setSyncCompleted(true);
            setSyncLoading(false);
        } catch (e) {
            alert('An error occurred while connecting products. Please try again.');
        }
    }

    return (
        <AppProvider i18n={{}}>
            <Page
                title="Gorocket Editor"
                secondaryActions={[
                    { content: 'Products', url: '/products' },
                    { content: 'Pricing', url: '/pricing' },
                    { content: 'Setting', url: '/settings' },
                    { content: 'Help', url: '/help' },
                ]}
            >
                <BlockStack gap="200">
                    {!introCardDismissed &&
                        <CalloutCard
                            title="Connect and manage your products"
                            illustration="https://cdn-icons-png.flaticon.com/128/7603/7603938.png"
                            primaryAction={{ content: 'Manage Products', url: '/products' }}
                            onDismiss={() => setIntroCardDismissed(true)}
                        >
                            <p>Connect Shopify products and manage them with GoRocket Editor.</p>
                        </CalloutCard>
                    }
                    <InlineGrid gap="200" columns={{ xs: 1, md: 3 }}>
                        <Card>
                            <BlockStack gap="400">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Active plan</Text>
                                    <Button url="/pricing" variant="plain" accessibilityLabel="Upgrade">Upgrade</Button>
                                </InlineGrid>
                                <InlineStack gap="200" blockAlign="end">
                                    <Text as="p" variant="headingXl">Free</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">~2025.12.12</Text>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="200">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Total Product Count</Text>
                                    <Button url="/products" accessibilityLabel="Manage">Manage</Button>
                                </InlineGrid>
                                <Text as="p" variant="headingXl">5,000 <Text as="span" variant="bodySm" tone="subdued">products</Text></Text>
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="600">
                                <InlineGrid columns="1fr auto">
                                    <Text as="h2" variant="headingMd">Product Edit Count</Text>
                                    <Button url="/pricing" variant="plain" accessibilityLabel="history">history</Button>
                                </InlineGrid>
                                <InlineStack gap="400" blockAlign="center">
                                    <div style={{ width: 70 }}>
                                        <ProgressBar progress={40} size="small" tone={40 > 80 ? 'critical' : 'highlight'} />
                                    </div>
                                    <Text as="p" variant="bodyLg">
                                        <Text as="span" fontWeight="bold">400</Text>
                                        /1,000
                                    </Text>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    <Card>
                        <EmptyState
                            fullWidth={true}
                            heading="Connect and manage your products"
                            action={{
                                content: syncCompleted ? 'Connection Completed!' : 'Connect Products',
                                tone: 'success',
                                onAction: syncProducts,
                                loading: syncLoading,
                                disabled: syncCompleted
                            }}
                            secondaryAction={{ content: 'Manage Products', url: '/products' }}
                            footerContent={
                                <p>
                                    With <Link monochrome url="/billing/2">Basic Plan</Link>, you can integrate and
                                    manage
                                    over 100,000 products.
                                </p>
                            }
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        >
                            <p>
                                Connect Shopify products and manage them with{' '}
                                <Text as="span" tone="success" fontWeight="semibold">GoRocket Editor</Text>
                                .
                            </p>
                        </EmptyState>
                    </Card>
                    <BlockStack inlineAlign='end'>
                        <Button url='mailto:support@gorocket.ai'>
                            Customer Support
                        </Button>
                    </BlockStack>
                    <FooterHelp>
                        &copy; 2025 GoRocket. By using this app, you agree to the <Link url="#">Privacy Policy</Link>.
                    </FooterHelp>
                </BlockStack>
            </Page>
        </AppProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
