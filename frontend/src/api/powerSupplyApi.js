import {apiPost} from "./client.js";

export function getState(psu) {
    return apiPost(`api/psu/${psu}/state`)
}

export function toggleState(psu) {
    return apiPost(`api/psu/${psu}/toggle`)
}


export function setVoltage(psu, value) {
    return apiPost(`api/psu/${psu}/set/voltage`, value);
}


export function setCurrent(psu, value) {
    return apiPost(`api/psu/${psu}/set/current`, value);
}
