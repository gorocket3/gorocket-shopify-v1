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
            throw new Error(JSON.stringify({
                status: response.status,
                method: method,
                url: url,
                response: await response.json()
            }));
        }

        return await response.json();
    } catch (e) {
        throw JSON.parse(e.message);
    }
}
