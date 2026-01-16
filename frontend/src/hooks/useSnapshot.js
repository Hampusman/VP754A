import {useCallback, useState} from "react";
import {useInterval} from "./useInterval.js";
import {getData} from "../api/dataStreamApi.js";

const INITIAL = {
    time: '',
    pwa: {
        channel1: {voltage: '0.0', current: '0.0'},
        channel2: {voltage: '0.0', current: '0.0'},
        channel3: {voltage: '0.0', current: '0.0'},
        channel4: {voltage: '0.0', current: '0.0'},
    },
    arduino: {
        channels: {
            channel1: {voltage: '0.0', current: ''},
            channel2: {voltage: '0.0', current: ''}
        },
        calibration: {k: '', m: ''},
    },
    error: null,
};

export function useDataSnapshot(pollMs = 50) {
    const [values, setValues] = useState(INITIAL);

    const refresh = useCallback(async () => {
        try {
            const data = await getData();
            if (data?.pwa && Object.values(data.pwa).some(ch => Number(ch?.current) > 1000)) return;

            setValues(prev => ({
                ...prev,
                time: {...prev.time, ...data.time},
                pwa: {...prev.pwa, ...data.pwa},
                arduino: {...prev.arduino, ...data.arduino},
                error: null,
            }));
        } catch (e) {
            setValues(prev => ({...prev, error: e}));
        }
    }, []);

    useInterval(refresh, pollMs);

    return {values, refresh, setValues};
}
