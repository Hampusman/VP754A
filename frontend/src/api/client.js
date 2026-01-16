// export const API_BASE = 'http://192.168.1.110:8000'
export const API_BASE = 'http://192.168.0.204:8000'


export async function apiGet(path) {
    const response = await fetch(`${API_BASE}/${path}`)
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return response.json()
}

export async function apiPost(path, body = null) {
    const response = await fetch(`${API_BASE}/${path}`, {
        method: 'POST',
        headers: body ? {'Content-Type': 'application/json'} : undefined,
        body: body ? JSON.stringify(body) : null,
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return response.json()
}