import { useEffect, useState } from 'react';
import { getPlanConfirmationUrl } from "./api";
import { showError } from "./toasts";

export function useEffectWithoutInitialState(callback, state) {
    const [ init, setInit ] = useState(true);

    useEffect(() => {
        if (init) {
            setInit(false);
        } else {
            callback();
        }
    }, state);
}

export async function goToChargesPage(planId = 2) {
    try {
        const { url } = await getPlanConfirmationUrl({ planId, host: getStorage('host') });
        window.open(url, "_top");
    } catch (e) {
        showError('Failed to get confirmation URL. Please try again.');
    }
}

export function initStorage() {
    const host = new URLSearchParams(location.search).get("host");
    const sessionValue = { host };
    sessionStorage.setItem("shopify-gorocket-editor", JSON.stringify(sessionValue));
}

export function getStorage(key, type = 'session') {
    const storage = type === 'session' ? sessionStorage : localStorage;
    const info = JSON.parse(storage.getItem('shopify-gorocket-editor')) || {};
    return info[key] || '';
}
