import {apiPost} from './client.js';

export function getCalibration(saveFile) {
    return apiPost('api/calibrate', {saveFile});
}
