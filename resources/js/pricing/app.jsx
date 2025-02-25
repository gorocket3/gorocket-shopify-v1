import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    AppProvider,
    BlockStack,
    Card,
    Divider,
    InlineGrid,
    Text,
    Page,
    Icon,
    Button,
    Scrollable
} from '@shopify/polaris';
import { StatusActiveIcon, XCircleIcon } from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';

function App() {
    return (
        <AppProvider i18n={{}}>
            <Page
                backAction={{ content: 'Home', url: '/' }}
                title="Pricing"
                fullWidth={true}
                // secondaryActions={[
                //     { content: 'Print', url: '/print' },
                //     { content: 'Unarchive' },
                //     { content: 'Cancel order' },
                // ]}
                // pagination={{
                //     hasPrevious: true,
                //     hasNext: true,
                // }}
            >
                <Card>
                    <div style={{ height: 'calc(100vh - 130px)' }}>
                        <InlineGrid columns={3}>
                            <Cell/>
                            <Cell fullWidth={true}>
                                <BlockStack gap="100">
                                    <Text as="h2" variant="headingLg">
                                        Free
                                    </Text>
                                    <Text as='p' variant="heading2xl">
                                        $0
                                        <Text as='span' variant="bodySm">/per month</Text>
                                    </Text>
                                    <Button variant="primary" size="large" fullWidth={true}>Start Now for
                                        FREE</Button>
                                </BlockStack>
                            </Cell>
                            <Cell fullWidth={true}>
                                <BlockStack gap="100">
                                    <Text as="h2" variant="headingLg">
                                        Basic
                                    </Text>
                                    <Text as='p' variant="heading2xl">
                                        $29.9
                                        <Text as='span' variant="bodySm">/per month</Text>
                                    </Text>
                                    <Button variant="primary" size="large" fullWidth={true}>Start Now for FREE</Button>
                                </BlockStack>
                            </Cell>
                        </InlineGrid>
                        <Divider/>
                        <InlineGrid columns={3}>
                            <Cell>
                                <BlockStack align="center">
                                    <Text as="h3" variant="headingMd">Overview</Text>
                                </BlockStack>
                            </Cell>
                            <Cell text="The Perfect Product Management Solution for Beginner Store Builders."
                                  textCenter={true}/>
                            <Cell text="For experienced businesses requiring more features and faster support."
                                  textCenter={true}/>
                        </InlineGrid>
                        <Divider/>
                        <Scrollable shadow style={{ height: 'calc(100% - 200px)' }}>
                            <InlineGrid columns={3}>
                                <Cell text="항목1"/>
                                <Cell><Icon source={StatusActiveIcon} tone="success"/></Cell>
                                <Cell><Icon source={StatusActiveIcon} tone="success"/></Cell>
                            </InlineGrid>
                            <Divider/>
                            <InlineGrid columns={3}>
                                <Cell text="항목2"/>
                                <Cell><Icon source={XCircleIcon} tone="critical"/></Cell>
                                <Cell><Icon source={StatusActiveIcon} tone="success"/></Cell>
                            </InlineGrid>
                            <Divider/>
                            <InlineGrid columns={3}>
                                <Cell text="항목3"/>
                                <Cell><Icon source={StatusActiveIcon} tone="success"/></Cell>
                                <Cell><Icon source={StatusActiveIcon} tone="success"/></Cell>
                            </InlineGrid>
                            <Divider/>
                        </Scrollable>
                    </div>
                </Card>
            </Page>
        </AppProvider>
    );
}

const Cell = ({ children, text = '', textCenter = false, fullWidth = false }) => {
    const childrenElement = children ? children :
        <Text as="p" variant="bodyMd" alignment={textCenter ? 'center' : 'start'}>{text}</Text>;

    return (
        <div style={{ padding: '1rem 0.5rem', display: 'flex' }}>
            {fullWidth ? <div style={{ flex: 1 }}>{childrenElement}</div> : childrenElement}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
