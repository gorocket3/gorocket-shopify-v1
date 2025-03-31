export default async function fetchData({ url, method = 'GET', headers = {}, body, contentType = 'json' }) {
    try {
        if (!!body && contentType === 'json') body = JSON.stringify(body);
        if (!headers) headers = {};
        if (contentType === 'json') headers['Content-Type'] = 'application/json';

        const response = await fetch(url, {
            method: method,
            // credentials: 'include',
            headers: { ...headers },
            body
        });

        if (!response.ok) {
            throw new Error(`${response.status}||${method}||${url}`);
        }

        return await response.json();
    } catch (e) {
        const error = (e?.message || '').split('||');
        throw { status: error[0] || 0, method: error[1] || '', url: error[2] || '' };
    }
}
