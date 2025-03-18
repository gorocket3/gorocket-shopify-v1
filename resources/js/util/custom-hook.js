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
