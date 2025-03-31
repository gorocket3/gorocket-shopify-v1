import fetchData from "./fetch";
import { showError } from "./toasts";

export async function getDashboardData() {
    try {
        const { shop_id, plan, total_product_count, sync_data } = await fetchData({
            method: 'GET',
            url: '/api/dashboard'
        });
        return { shopId: shop_id, plan, totalProductCount: total_product_count, syncData: sync_data };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getTotalProductCount() {
    try {
        const { count } = await fetchData({ method: 'GET', url: '/api/products/count' });
        return count;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getPlanData() {
    try {
        const { shop_id, plans } = await fetchData({
            method: 'GET',
            url: '/api/plans'
        });
        return { shopId: shop_id, plans };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getMyPlanData() {
    try {
        const { shop_id, plan_id, plan_selected_limit } = await fetchData({
            method: 'GET',
            url: '/api/plans/info'
        });
        return { shopId: shop_id, planId: plan_id, planSelectedLimit: plan_selected_limit };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getPlanConfirmationUrl({ planId, host }) {
    try {
        const { confirmation_url: url } = await fetchData({
            method: 'POST',
            url: '/api/plans/confirm',
            body: { plan_id: planId, host }
        });
        return { url };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getHistoryData({ productId = '', page, perPage }) {
    try {
        const params = `per_page=${perPage}&page=${page}&product_id=${productId}`;
        const { data, current_page, last_page, from, to, per_page, total } = await fetchData({
            method: 'GET',
            url: '/api/history?' + params
        });
        return { data, page: current_page, lastPage: last_page, from, to, perPage: per_page, total };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getHistoryCountData() {
    try {
        const { count, limit } = await fetchData({ method: 'GET', url: '/api/history/count' });
        return { count, limit };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function syncProducts() {
    try {
        await fetchData({ method: 'POST', url: '/api/products/sync' });
    } catch (e) {
        console.error(e);
        if (e?.status === '429') {
            showError('Connect request limit exceeded. (Once every 5 minutes)');
        } else {
            showError('An error occurred while connecting products. Please try again.');
        }
        throw e;
    }
}

