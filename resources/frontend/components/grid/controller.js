import fetchData from "../../utils/fetch";
import { formatNumberWithCommas } from "../../utils/formats";
import getInitialColumns from "./columns.js";

let pApp, gx, gridDiv, initData, defaultData, filterData, showChangesCallback;
let editedCellCount = 0;

export async function initGrid({ plan_selected_limit, default_per_page, show_changes }) {
    pApp = new App('', { gridId: "#div-gd" });

    const is_mobile = document.body.offsetWidth <= 1007;
    const grid_height = is_mobile ? 192 : 170;
    pApp.ResizeGrid(grid_height);
    pApp.BindSearchEnter('#search_product');

    gridDiv = document.querySelector(pApp.options.gridId);

    initData = await getInitialData();
    defaultData = { plan_selected_limit, per_page: default_per_page };
    showChangesCallback = show_changes;
    refreshGrid(initData, defaultData, showChangesCallback);
}

export function searchProducts({ per_page = 25 } = {}) {
    // let params = $('form[name="search"]').serialize();
    let params = 'per_page=' + per_page;

    gx.Request('/api/products', params, 1, function (v) {
        const data = v.data.reduce((a, c, i) => {
            if (c.variants.length < 1) {
                return a.concat({
                    parent_index: i,
                    parent: {
                        ...c,
                        variants_cnt: 1,
                        images: c.images?.sort((x, y) => x.position - y.position) || []
                    }
                });
            }

            return a.concat(c.variants.map((item, index) => {
                const { variants, ...parent } = c;
                return {
                    ...item,
                    parent_index: i,
                    parent: {
                        ...parent,
                        variants_cnt: c.variants.length,
                        images: parent.images?.sort((x, y) => x.position - y.position) || []
                    }
                };
            }).sort((x, y) => x.position - y.position));
        }, []);

        const result = data.map((item, index) => {
            const cur_data = {
                ...item,
                group_id: item.parent.product_id,
                product_name: item.parent.title,
                product_type: item.parent.product_type,
                product_category: item.parent.category,
                product_tags: item.parent.tags,
                product_body: item.parent.body_html,
                product_img: item.parent.featured_image || '',
                product_status: item.parent.status,
                vendor: item.parent.vendor,
                handle: item.parent.handle,
                prev_handle: item.parent.handle,
                seo_title: item.parent.seo_title,
                seo_description: item.parent.seo_description,
                product_published_at: item.parent.published_at,
                product_created_at: item.parent.created_at,
                product_updated_at: item.parent.updated_at,
                option_name: item.title,
                option_img: item.image?.src || '',
                inventory_management: item.inventory_management === 'shopify' ? 'true' : 'false',
                inventory_quantity: ((item.inventory_quantity || 0) * 1).toString(),
                price: ((item.price || 0) * 1).toString(),
                compare_at_price: ((item.compare_at_price || 0) * 1).toString(),
                taxable: item.taxable ? 'true' : 'false',
                barcode: item.barcode || '',
                weight: ((item.weight || 0) * 1).toString(),
            };
            cur_data['prev'] = { ...cur_data };
            return cur_data;
        });

        gx.gridOptions.api.clearRangeSelection();

        if (v.current_page === 1) {
            gx.gridOptions.api.setRowData(result);
            gx.gridOptions.api.setFilterModel(filterData);

            addEditedCellCount(0, true);
        } else {
            gx.gridOptions.api.applyTransaction({ add: result });
        }
    });
}

export function getProductsToUpdate() {
    let selectedRows = gx.gridOptions.api.getSelectedRows();
    if (selectedRows.length < 1) {
        shopify.toast.show('Please select the product(s) to save.', { isError: true });
        return null;
    }

    if (editedCellCount > defaultData.plan_selected_limit) {
        shopify.toast.show('You have reached the edit limit for your current plan. (Maximum: ' + formatNumberWithCommas(defaultData.plan_selected_limit) + ')', { isError: true });
        return null;
    }

    const rows = [];
    selectedRows.forEach((data) => {
        const variant = {
            id: data.variant_id,
            price: parseFloat(data.price || 0),
            compare_at_price: parseFloat(data.compare_at_price || 0),
            inventory_item_id: data.inventory_item_id,
            inventory_management: data.inventory_management === 'true',
            inventory_quantity: parseInt(data.inventory_quantity || 0),
            weight: parseFloat(data.weight || 0),
            weight_unit: data.weight_unit,
            sku: data.sku,
            inventory_policy: data.inventory_policy,
            taxable: [ true, 'true' ].includes(data.taxable),
            barcode: data.barcode,
            requires_shipping: [ true, 'true' ].includes(data.requires_shipping),
            // title: data.option_name,
        }

        const prev = rows.find(row => row.id === data.product_id);

        if (prev) {
            prev.variants.push(variant);
        } else {
            const product = {
                id: data.product_id,
                title: data.product_name,
                status: data.product_status,
                body_html: data.product_body,
                tags: data.product_tags,
                product_type: data.product_type,
                category: data.product_category,
                vendor: data.vendor,
                handle: data.handle,
                seo_title: data.seo_title,
                seo_description: data.seo_description,
            };

            rows.push({ ...product, variants: [ variant ] });
        }
    });
    return rows;
}

export async function saveProducts(rows, limitCallback, errorCallback = null) {
    try {
        await fetchData({ method: 'POST', url: '/api/products/edit', body: { "products": rows } });
    } catch (e) {
        if (e?.status === '429') {
            shopify.toast.show('Update request limit exceeded.', {
                isError: true,
                action: 'Upgrade Plan',
                onAction: limitCallback
            });
        } else {
            shopify.toast.show('An error occurred while updating the product. Please try again.', { isError: true });
        }
        if (errorCallback) errorCallback();
    }
}

export function getProductsToRemove() {
    let rows = gx.gridOptions.api.getSelectedRows();
    if (rows.length < 1) {
        shopify.toast.show('Please select the product(s) to delete.', { isError: true });
        return null;
    }

    rows = rows.map(row => row.parent.product_id);
    rows = [ ...new Set(rows) ];
    return rows;
}

export async function removeProducts(rows, errorCallback = null) {
    fetch(`/api/products/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_ids: rows })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log(data);
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while deleting the product.');
            if (errorCallback) errorCallback();
        });
}

export async function undoGrid() {
    gx.gridOptions.api.undoCellEditing();
    return gx.gridOptions.api.getCurrentUndoSize();
}

export async function redoGrid() {
    gx.gridOptions.api.redoCellEditing();
    return gx.gridOptions.api.getCurrentRedoSize();
}

export async function connectProducts(errorCallback = null) {
    try {
        await fetchData({ method: 'POST', url: '/api/products/sync' });
    } catch (e) {
        if (e?.status === '429') {
            shopify.toast.show('Connect request limit exceeded. (Once every 5 minutes)', { isError: true });
        } else {
            shopify.toast.show('An error occurred while connecting products. Please try again.', { isError: true });
        }
        if (errorCallback) errorCallback();
    }
}

export async function saveColumns(e) {
    if (!confirm("Would you like to save the column information?")) return;

    let column_datalist = gx.gridOptions.api.getColumnDefs();
    let new_column_datalist = [];

    column_datalist.forEach((value) => {
        let value_children = value['children'];
        let newchildren = [];

        if (value['children'] !== undefined) {
            value_children.forEach((val) => {
                newchildren.push({
                    'field': val['field'], 'hide': val['hide'], 'pinned': val['pinned'], 'width': val['width']
                });
            });
        }

        new_column_datalist.push({
            'field': value['field'],
            'hide': value['hide'],
            'pinned': value['pinned'],
            'width': value['width'],
            'children': newchildren
        });
    });

    try {
        const response = await fetch('/api/personal-column', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "columns": new_column_datalist })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const res = await response.json();
        shopify.toast.show('Column information has been save.');
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

export async function resetColumns(e) {
    if (!confirm("Would you like to reset the column information?")) return;

    try {
        const response = await fetch('/api/personal-column', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! Status: ${response.status}`);
        // }

        shopify.toast.show('Column information has been reset.');
        gx.gridOptions.api.destroy();
        refreshGrid(initData, defaultData, showChangesCallback);
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

/*
    Private Function
*/

async function refreshGrid(data, defaultData, showChangesModal) {
    const default_columns = [ ...getInitialColumns(data, showChangesModal, openOnlineStoreLink, addEditedCellCount) ];
    const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

    gx = new HDGrid(gridDiv, my_columns, {
        enableCellSpan: true,
        suppressRowTransform: true,
        rowClassRules: {
            "even": "data.parent_index % 2 !== 0",
        },
        suppressFieldDotNotation: true,
        suppressCopyRowsToClipboard: true,
        suppressClearOnFillReduction: true,
        enableFillHandle: true,
        fillHandleDirection: 'y',
        fillOperation: (e) => {
            if (e.column.colId === 'handle') {
                return e.currentCellValue;
            }
            return false;
        },
        floatingFilter: true,
        undoRedoCellEditing: true,
        undoRedoCellEditingLimit: 100,
        tooltipShowDelay: 200,
        onRowSelected: (event) => {
            if (event.node.data.parent.variants_cnt > 1) {
                gx.gridOptions.api.forEachNode((node) => {
                    if (node.data.product_id === event.node.data.product_id) {
                        node.setSelected(event.node.selected);
                    }
                });
            }
        },
        onFilterChanged: (e) => {
            filterData = e.api.getFilterModel();

            const displayedRows = gx.gridOptions.api.getRenderedNodes().map(node => node.data.product_id);
            // const cnt = [ ...new Set(displayedRows) ].length;
            const cnt = displayedRows.length;
            $("#" + gx.gridCurrent).text(numberWithCommas(cnt));
        },
    });

    searchProducts(defaultData);
}

async function getInitialData() {
    try {
        const { product_types } = await fetchData({ method: 'GET', url: '/api/composition/product-type' });
        const { tags } = await fetchData({ method: 'GET', url: '/api/composition/tags' });
        const { status } = await fetchData({ method: 'GET', url: '/api/composition/status' });
        const { vendor } = await fetchData({ method: 'GET', url: '/api/composition/vendor' });

        return { types: product_types, tags, status, vendor };
    } catch (error) {
        console.error(error);
        return null;
    }
}


async function openOnlineStoreLink(product_id) {
    try {
        gx.ShowCustomLoadingLayer();
        const { preview_url } = await fetchData({
            method: 'GET',
            url: '/api/products/preview-url?product_id=' + product_id
        });
        window.open(preview_url, '_blank');
    } catch (error) {
        console.error(error);
        shopify.toast.show('Incorrect product information.', { isError: true });
    } finally {
        gx.HideCustomLoadingLayer();
    }
}

function addEditedCellCount(num, reset = false) {
    if (reset) editedCellCount = 0;
    else editedCellCount += num;
    document.getElementById('gd-edited').innerText = formatNumberWithCommas(editedCellCount);

    if (editedCellCount > defaultData.plan_selected_limit) {
        shopify.toast.show('You have reached the edit limit for your current plan. (Maximum: ' + formatNumberWithCommas(defaultData.plan_selected_limit) + ')', { isError: true });
    }
}
