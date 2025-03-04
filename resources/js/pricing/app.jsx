import React from 'react';
import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
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
    Scrollable,
    Badge,
    InlineStack
} from '@shopify/polaris';
import { StatusActiveIcon, XCircleIcon } from "@shopify/polaris-icons";
import '@shopify/polaris/build/esm/styles.css';

function App({ data }) {
    const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get("host"),
        forceRedirect: true
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);

    return (
        <PricingApp data={data} redirect={redirect} />
    )
}

function PricingApp({ data: { plans = [], shop_id }, redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">상품</a>
                <a href="/pricing">결제</a>
                <a href="/settings">설정</a>
                <a href="/help">도움</a>
            </NavMenu>
            <Page
                backAction={{ content: 'Home', onAction: () => navigate('/') }}
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
                            {plans.map((plan, index) => (
                                <Cell key={index} fullWidth={true}>
                                    <BlockStack gap="100">
                                        <InlineStack gap="200" blockAlign="center">
                                            <Text as="h2" variant="headingLg">
                                                {plan.name}
                                            </Text>
                                            {plan.user_plan &&
                                                <Badge tone="success">
                                                    <Text as="span" variant="bodyXs" fontWeight="semibold">IN USE</Text>
                                                </Badge>
                                            }
                                            {plan.id === 2 &&
                                                <Badge tone="critical">
                                                    <Text as="span" variant="bodyXs" fontWeight="semibold">RECOMMENDED</Text>
                                                </Badge>
                                            }
                                        </InlineStack>
                                        <Text as='p' variant="heading2xl">
                                            ${plan.price}
                                            <Text as='span' variant="bodySm">/{plan.interval}</Text>
                                        </Text>
                                        {!plan.user_plan && (
                                            <Button onClick={() => navigate('/billing/' + plan.id)} variant="primary" size="large" fullWidth={true}>
                                                Start Now for FREE
                                            </Button>
                                        )}
                                    </BlockStack>
                                </Cell>
                            ))}
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

if (document.getElementById('app')) {
    const initial_data = document.getElementById('app').dataset?.initial || '{}';
    const data = JSON.parse(initial_data);
    ReactDOM.createRoot(document.getElementById('app')).render(<App data={data} />);
}
