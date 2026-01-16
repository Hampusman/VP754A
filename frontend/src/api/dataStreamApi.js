import {apiGet} from './client.js';

export function getData() {
    return apiGet('api/data')
}
