import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Page,
    ResourceItem,
    ResourceList, SkeletonBodyText, SkeletonDisplayText,
    Text,
} from "@shopify/polaris";
import { CheckIcon, StatusActiveIcon, XCircleIcon } from "@shopify/polaris-icons";
import { getPlanData } from "../utils/api";
import { goToChargesPage } from "../utils/hooks";

export default function PlanPage() {
    const navigate = useNavigate();

    const [ info, setInfo ] = useState({ shopId: null, plan: null });

    async function initPlan() {
        const planData = await getPlanData(); // shopId, plans

        setInfo((info) => ({ ...info, ...(planData || {}) }));
    }

    useEffect(() => {
        initPlan();
    }, []);

    return (
        <Page
            title="Plan"
            backAction={{ onAction: () => navigate(-1) }}
        >
            <Box paddingBlockEnd="400">
                {!info.plans ? (
                    <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
                        <Card>
                            <Box paddingBlock="400">
                                <BlockStack gap="300">
                                    <SkeletonDisplayText size="small"/>
                                    <SkeletonBodyText lines={2}/>
                                </BlockStack>
                            </Box>
                        </Card>
                        <Card>
                            <Box paddingBlock="400">
                                <BlockStack gap="300">
                                    <SkeletonDisplayText size="small"/>
                                    <SkeletonBodyText lines={2}/>
                                </BlockStack>
                            </Box>
                        </Card>
                    </InlineGrid>
                ) : (
                    <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
                        {info.plans.map((plan, index) => (
                            <Card key={index}>
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
                                                {(plan.id === 2 && !plan.user_plan) && (
                                                    <Button onClick={() => goToChargesPage()}
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
                                                        title: "Edit count",
                                                        type: "text",
                                                        content: plan.limits.edit_limit + ' times per day',
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "History viewing period",
                                                        type: "text",
                                                        content: plan.limits.history_days + ' days',
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "Shopify's history viewing",
                                                        type: "success",
                                                        content: plan.id !== 1,
                                                        plan_name: plan.name,
                                                    },
                                                ]}
                                                renderItem={(item, idx) => {
                                                    const { title, type, content, plan_name } = item;

                                                    if (type === 'success' && !content) return null;

                                                    return (
                                                        <ResourceItem
                                                            id={idx}
                                                            accessibilityLabel={plan_name + ' ' + title}
                                                            verticalAlignment="center">
                                                            <InlineGrid columns={2}>
                                                                <InlineStack gap="100" blockAlign="center" wrap={false}>
                                                                    {title !== 'Overview' && (
                                                                        <Box>
                                                                            <Icon source={CheckIcon} tone="success"/>
                                                                        </Box>
                                                                    )}
                                                                    <Text as="h3" variant="bodyMd"
                                                                          fontWeight="semibold">
                                                                        {title}
                                                                    </Text>
                                                                </InlineStack>
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
                        ))}
                    </InlineGrid>
                )}
            </Box>
        </Page>
    );
}
