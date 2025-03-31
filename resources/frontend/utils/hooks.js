import { useEffect, useState } from 'react';

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

export function goToChargesPage(planId = 2) {
    window.open(`/apps/${import.meta.env.VITE_APP_NAME}/billing/${planId}`, "_top");
}
