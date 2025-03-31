export function showInfo(message, options = {}) {
    shopify.toast.show(message, options);
}

export function showError(message, options = {}) {
    shopify.toast.show(message, { ...options, isError: true });
}
