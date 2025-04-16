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
import { getPlanData, isFreePlan } from "../utils/api";
import { formatNumberWithCommas } from "../utils/formats";
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
            fullWidth={true}
            backAction={{ onAction: () => navigate(-1) }}
        >
            <Box paddingBlockEnd="400">
                {!info.plans ? (
                    <InlineGrid columns={{ xs: 1, lg: 3 }} gap="400">
                        {[ ...Array(3) ].map((_, index) => (
                            <Card key={index}>
                                <Box paddingBlock="400">
                                    <BlockStack gap="300">
                                        <SkeletonDisplayText size="small"/>
                                        <SkeletonBodyText lines={2}/>
                                    </BlockStack>
                                </Box>
                            </Card>
                        ))}
                    </InlineGrid>
                ) : (
                    <InlineGrid columns={{ xs: 1, lg: info.plans.length }} gap="400">
                        {info.plans.map((plan, index) => (
                            <Card key={'plan_' + index}>
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
                                                {(plan.id !== 1 && !plan.user_plan) && (
                                                    <Button onClick={() => goToChargesPage(plan.id)}
                                                            variant="primary"
                                                            size="large" fullWidth={true}>
                                                        Subscribe Now
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
                                                        title: "Bulk Edit",
                                                        type: "text",
                                                        content: plan.limits.edit_limit === null ? 'Unlimited' : `${formatNumberWithCommas(plan.limits.edit_limit)} times a day`,
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "Selectable Cell Count",
                                                        type: "text",
                                                        content: plan.limits.max_selected_cell === null ? 'Unlimited' : `${formatNumberWithCommas(plan.limits.max_selected_cell)} per save`,
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "AI SEO Generation",
                                                        type: "text",
                                                        content: plan.limits.ai_limit === null ? 'Unlimited' : `${formatNumberWithCommas(plan.limits.ai_limit)} times a day`,
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "Export Products",
                                                        type: "success",
                                                        content: !isFreePlan(plan.id),
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "History Retention",
                                                        type: "text",
                                                        content: plan.limits.history_days === null ? 'Unlimited' : plan.limits.history_days + ' days',
                                                        plan_name: plan.name,
                                                    },
                                                    {
                                                        title: "Shopify History Access",
                                                        type: "success",
                                                        content: !isFreePlan(plan.id),
                                                        plan_name: plan.name,
                                                    },
                                                ]}
                                                renderItem={(item, idx) => {
                                                    const { title, type, content, plan_name } = item;
                                                    // if (type === 'success' && !content) return null;
                                                    return (
                                                        <ResourceItem
                                                            id={idx}
                                                            disabled={true}
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
