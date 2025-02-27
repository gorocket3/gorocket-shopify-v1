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
            throw new Error(`${response.status} Error (${method} '${url}')`);
        }

        return await response.json();
    } catch (e) {
        console.error(e.message);
        throw { message: e.message };
    }
}
