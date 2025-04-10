import fetchData from "./fetch";
import { showError } from "./toasts";

export async function getSyncStatusData() {
    try {
        const { shop_id, syncing, progress, bulking } = await fetchData({
            method: 'GET',
            url: '/api/sync-status/'
        });
        return { shopId: shop_id, syncing, progress, bulking };
    } catch (e) {
        console.error(e);
        return null;
    }
}

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

export async function getMyPlanData(onlyCount = false) {
    try {
        const { shop_id, plan_id, limits, counts } = await fetchData({
            method: 'GET',
            url: '/api/plans/info' + (onlyCount ? '?only_count=true' : '')
        });
        return {
            shopId: shop_id,
            planId: plan_id,
            editableLimit: limits.edit_limit,
            editableCount: counts.edit_count,
            selectableLimit: limits.max_selected_cell,
            aiSeoLimit: limits.ai_limit,
            aiSeoCount: counts.ai_count,
        };
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

export async function getTotalProductCount() {
    try {
        const { count } = await fetchData({ method: 'GET', url: '/api/products/count' });
        return count;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function syncProducts() {
    try {
        await fetchData({ method: 'POST', url: '/api/products/sync' });
    } catch (e) {
        if (e?.status === '429') {
            showError('Connect request limit exceeded. (Once every 30 minutes)');
        } else {
            showError('An error occurred while connecting products. Please try again.');
            console.log(`${e?.status} Error (${e.method} ${e.url})`, e?.response);
        }
        throw e;
    }
}

export async function getProductAiSeoContent({ productId, title, description, tags, productType }) {
    try {
        const { product_id: seoProductId, title: seoTitle, description: seoDescription } = await fetchData({
            method: 'POST',
            url: '/api/generate-seo',
            body: { product_id: productId, title, description, tags, product_type: productType }
        });
        return { seoProductId, seoTitle, seoDescription };
    } catch (e) {
        return { seoProductId: productId, errorMsg: e.response.error || e.response.message };
    }
}

export async function getCompositionData() {
    try {
        const {
            product_type: { product_types },
            tags: { tags },
            status: { status },
            vendor: { vendor }
        } = await fetchData({ method: 'GET', url: '/api/composition/init' });
        return { types: product_types, tags, status, vendor };
    } catch (e) {
        console.error(e);
        return null;
    }
}
