import { Modal, Text, BlockStack, InlineStack, Icon } from "@shopify/polaris";
import {CheckIcon, AlertCircleIcon} from "@shopify/polaris-icons";

export function ConfirmModal({
     open,
     onClose,
     title,
     content,
     primaryText,
     onPrimary,
     type = 'default'
 }) {
    const iconMap = {
        save: {
            icon: CheckIcon,
            tone: 'primary'
        },
        reset: {
            icon: AlertCircleIcon,
            tone: 'warning'
        }
    };
    const iconInfo = iconMap[type] || null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <InlineStack gap="200" blockAlign="center">
                    {iconInfo && (
                        <Icon source={iconInfo.icon} tone={iconInfo.tone} />
                    )}
                    <Text variant="headingMd" as="h2">{title}</Text>
                </InlineStack>
            }
            padding="600"
            primaryAction={{
                content: primaryText,
                onAction: onPrimary,
                tone: iconInfo?.tone === 'warning' ? 'warning' : 'primary',
            }}
            secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
        >
            <Modal.Section>
                <BlockStack gap="300">
                    <Text variant="bodyLg" as="p" tone="subdued">
                        {content}
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
