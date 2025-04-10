import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { toast, Toaster } from "sonner";
import { getSyncStatusData } from "../../utils/api";
import { useEffectWithoutInitialState } from "../../utils/hooks";

export default function ProgressNotifier({ syncCallback, updateCallback, deleteCallback }) {
    const [ info, setInfo ] = useState({ shopId: null, syncing: false, progress: 0, bulking: null, channelName: null });
    const [ pusher, setPusher ] = useState(null);
    const [ channel, setChannel ] = useState(null);
    const [ loadingToast, setLoadingToast ] = useState({ id: null, dismiss: false });

    async function init() {
        const res = await getSyncStatusData(); // shopId, syncing, progress, bulking

        if (res) {
            const { shopId, syncing, progress, bulking } = res;
            setInfo((info) => ({ shopId, syncing, progress, bulking, channelName: 'gorocket-shop-' + shopId }));
        }
    }

    function updateBulking({ progress = 0, bulking = null } = {}) {
        setInfo((info) => ({
            ...info,
            progress: info.bulking === 100 ? info.progress : progress,
            bulking: info.bulking === 100 ? info.bulking : bulking
        }));
    }

    useEffectWithoutInitialState(() => {
        const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const pusherHost = import.meta.env.VITE_PUSHER_HOST;
        const pusherPort = import.meta.env.VITE_PUSHER_PORT;
        const pusherUseTLS = import.meta.env.VITE_PUSHER_USE_TLS === 'true';

        setPusher(new Pusher(pusherKey, {
            cluster: pusherCluster,
            wsHost: pusherHost,
            wsPort: pusherPort,
            wssPort: pusherPort,
            forceTLS: pusherUseTLS,
            enabledTransports: [ 'ws', 'wss' ]
        }));
    }, [ info.shopId ]);

    useEffectWithoutInitialState(() => {
        setChannel(pusher.subscribe(info.channelName));
    }, [ pusher ]);

    useEffectWithoutInitialState(() => {
        channel.bind('product-sync', function (d) {
            updateBulking(d?.data);
            if (syncCallback) syncCallback(d?.data);
        });
        channel.bind('product-update', function (d) {
            if (updateCallback) updateCallback(d?.data);
        });
        channel.bind('product-delete', function (d) {
            if (deleteCallback) deleteCallback(d?.data);
        });
    }, [ channel ]);

    useEffectWithoutInitialState(() => {
        if (!loadingToast.id && (info.progress === 100 || info.bulking === 1)) {
            const tst = toast.loading('Processing additional data...', {
                style: {
                    color: '#ffffff',
                    background: '#1a1a1a',
                }
            });
            setLoadingToast((lt) => ({ ...lt, id: tst }));
        } else if (loadingToast.id && info.bulking === 100) {
            toast.dismiss(loadingToast.id);
            setLoadingToast((lt) => ({ ...lt, id: null, dismiss: true }));
        }
    }, [ info.progress, info.bulking ]);

    useEffectWithoutInitialState(() => {
        if (loadingToast.dismiss) {
            toast.dismiss(loadingToast.id);
            toast.success('Additional data processed successfully.', { duration: 2000 });
        }
    }, [ loadingToast.dismiss ]);

    useEffect(() => {
        init();

        return () => {
            if (channel) channel.unbind();
            if (pusher) pusher.unsubscribe();
            toast.dismiss();
        };
    }, []);

    return <Toaster position="bottom-center" richColors/>;
}
