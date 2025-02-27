import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, BlockStack, Button, Card, EmptyState, FooterHelp, Link, Page, Text } from '@shopify/polaris';
import fetchData from "./api/fetch";
import '@shopify/polaris/build/esm/styles.css';

function App() {
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
