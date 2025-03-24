import ReactDOM from 'react-dom/client';
import createApp from "@shopify/app-bridge";
import { Redirect } from '@shopify/app-bridge/actions';
import { NavMenu } from "@shopify/app-bridge-react";
import {
    AppProvider,
    BlockStack,
    Card,
    InlineGrid,
    Text,
    Page,
    Icon,
    Button,
    Badge,
    InlineStack,
    Layout,
    ResourceList,
    ResourceItem,
    Box,
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
        <PlanApp data={data} redirect={redirect}/>
    )
}

function PlanApp({ data: { plans = [], shop_id }, redirect }) {
    const navigate = (url) => redirect.dispatch(Redirect.Action.APP, url);

    return (
        <AppProvider i18n={{}}>
            <NavMenu>
                <a href="/products">Products</a>
                <a href="/plan">Plan</a>
                <a href="/history">History</a>
            </NavMenu>
            <Page
                backAction={{ content: 'Home', onAction: () => navigate('/') }}
                title="Plan"
            >
                <Box paddingBlockEnd="400">
                    <Layout>
                        {plans.map((plan, index) => (
                            <Layout.Section key={index} variant="oneHalf">
                                <Card>
                                    <Box paddingBlock="400">
                                        <BlockStack gap="200">
                                            <BlockStack gap="200">
                                                <InlineStack gap="200" blockAlign="center">
                                                    <Text as="h2" variant="headingLg">
                                                        {plan.name}
                                                    </Text>
                                                    {plan.user_plan &&
                                                        <Badge tone="success">
                                                            <Text as="span" variant="bodyXs" fontWeight="semibold">IN
                                                                USE</Text>
                                                        </Badge>
                                                    }
                                                    {plan.id === 2 &&
                                                        <Badge tone="critical">
                                                            <Text as="span" variant="bodyXs"
                                                                  fontWeight="semibold">RECOMMENDED</Text>
                                                        </Badge>
                                                    }
                                                </InlineStack>
                                                <Text as='p' variant="heading2xl">
                                                    ${plan.price}
                                                    <Text as='span' variant="bodySm">/{plan.interval}</Text>
                                                </Text>
                                                <Box minHeight="32px">
                                                    {!plan.user_plan && (
                                                        <Button onClick={() => navigate('/billing/' + plan.id)}
                                                                variant="primary"
                                                                size="large" fullWidth={true}>
                                                            Start Now for FREE
                                                        </Button>
                                                    )}
                                                </Box>
                                            </BlockStack>
                                            <Box>
                                                <ResourceList
                                                    resourceName={{ singular: 'plan', plural: 'plans' }}
                                                    items={[
                                                        {
                                                            title: "Overview",
                                                            type: "text",
                                                            content: plan.terms,
                                                            plan_name: plan.name,
                                                        },
                                                        {
                                                            title: "항목1",
                                                            type: "success",
                                                            content: true,
                                                            plan_name: plan.name,
                                                        },
                                                        {
                                                            title: "항목2",
                                                            type: "success",
                                                            content: plan.id === 2,
                                                            plan_name: plan.name,
                                                        },
                                                        {
                                                            title: "항목3",
                                                            type: "success",
                                                            content: true,
                                                            plan_name: plan.name,
                                                        },
                                                    ]}
                                                    renderItem={(item, idx) => {
                                                        const { title, type, content, plan_name } = item;

                                                        return (
                                                            <ResourceItem
                                                                id={idx}
                                                                accessibilityLabel={plan_name + ' ' + title}
                                                                verticalAlignment="center">
                                                                <InlineGrid columns={2}>
                                                                    <Text as="h3" variant="bodyMd"
                                                                          fontWeight="semibold">
                                                                        {title}
                                                                    </Text>
                                                                    <InlineStack align="center">
                                                                        {type === "text" && (
                                                                            <Text as="p"
                                                                                  variant="bodyMd">{content}</Text>
                                                                        )}
                                                                        {type === "success" && (
                                                                            <Icon
                                                                                source={content ? StatusActiveIcon : XCircleIcon}
                                                                                tone={content ? "success" : "critical"}/>
                                                                        )}
                                                                    </InlineStack>
                                                                </InlineGrid>
                                                            </ResourceItem>
                                                        );
                                                    }}
                                                />
                                            </Box>
                                        </BlockStack>
                                    </Box>
                                </Card>
                            </Layout.Section>
                        ))}
                    </Layout>
                </Box>
            </Page>
        </AppProvider>
    );
}

if (document.getElementById('app')) {
    const initial_data = document.getElementById('app').dataset?.initial || '{}';
    const data = JSON.parse(initial_data);
    ReactDOM.createRoot(document.getElementById('app')).render(<App data={data}/>);
}
