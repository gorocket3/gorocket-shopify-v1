import { useCallback } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { getPolarisTranslations } from "../../utils/i18nUtils";

function AppBridgeLink({ url, children, external, ...rest }) {
    const handleClick = useCallback(() => window.open(url, "_self"), [ url ]);

    const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/;

    if (external || IS_EXTERNAL_LINK_REGEX.test(url)) {
        return (
            <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    }

    return (
        <a {...rest} onClick={handleClick}>
            {children}
        </a>
    );
}

export default function PolarisProvider({ children }) {
    const translations = getPolarisTranslations();

    return (
        <AppProvider i18n={translations} linkComponent={AppBridgeLink}>
            {children}
        </AppProvider>
    );
}
