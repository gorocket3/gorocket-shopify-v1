import { useEffect, useState } from 'react';
import { getPlanConfirmationUrl } from "./api";
import { showError } from "./toasts";

const storageKey = 'shopify-gorocket-editor';

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
    sessionStorage.setItem(storageKey, JSON.stringify(sessionValue));
}

export function setStorage(key, value, type = 'session') {
    const storage = type === 'session' ? sessionStorage : localStorage;
    const info = JSON.parse(storage.getItem(storageKey)) || {};
    info[key] = value;
    storage.setItem(storageKey, JSON.stringify(info));
}

export function getStorage(key, type = 'session') {
    const storage = type === 'session' ? sessionStorage : localStorage;
    const info = JSON.parse(storage.getItem(storageKey)) || {};
    return info[key] || '';
}
