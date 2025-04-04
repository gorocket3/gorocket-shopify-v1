import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { Box } from "@shopify/polaris";

export function ConfirmModal(
    { children, open, onClose, size = 'base', title = 'Confirm', primaryText, primaryTone = '', onPrimary }
) {
    return (
        <Modal
            variant={size}
            open={open}
            onHide={onClose}
        >
            <TitleBar title="Conformation">
                <button variant="primary" onClick={onPrimary}>{primaryText}</button>
                <button onClick={onClose}>Cancel</button>
            </TitleBar>
            <Box padding="600">
                {children}
            </Box>
        </Modal>
    );
}
