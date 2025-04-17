import { useEffect, useState } from 'react';
import { getPlanConfirmationUrl, cancelPlan } from "./api";
import {showError, showInfo} from "./toasts";

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

export async function goToChargesPage(planId = 2, navigate) {
    if (planId === 1) {
        const result = await cancelPlan();
        if (result) {
            const until = result.active_until?.split(' ')[0]?.replace(/-/g, '.');
            const days = result.remaining_days;

            showInfo(`Your plan was cancelled. Ends ${until} (${days} day${days > 1 ? 's' : ''} left).`);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } else {
            showError('Failed to cancel your plan. Please try again.');
        }
    } else {
        try {
            const { url } = await getPlanConfirmationUrl({ planId, host: getStorage('host') });
            window.open(url, "_top");
        } catch (e) {
            showError('Failed to get confirmation URL. Please try again.');
        }
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
