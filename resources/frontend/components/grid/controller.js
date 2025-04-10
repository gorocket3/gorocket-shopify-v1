import { getCompositionData } from "../../utils/api";
import fetchData from "../../utils/fetch";
import { formatNumberWithCommas } from "../../utils/formats";
import { showError } from "../../utils/toasts";
import getInitialColumns from "./columns";
import COLUMN_PARAMS from "./cols.json";

let pApp, gx, gridDiv, initData, defaultData, filterData, showChangesCallback, startGridCallback, setSelectableCount;
let editedCellCount = 0;

export async function initGrid({ plan_selected_limit, default_per_page, show_changes, start_grid, set_selectable_count }) {
    pApp = new App('', { gridId: "#div-gd" });

    // const is_mobile = document.body.offsetWidth <= 1007;
    const grid_height = 170;
    pApp.ResizeGrid(grid_height);
    pApp.BindSearchEnter('#search_product');

    gridDiv = document.querySelector(pApp.options.gridId);

    initData = await getInitialData();
    defaultData = { plan_selected_limit, per_page: default_per_page };
    showChangesCallback = show_changes;
    startGridCallback = start_grid;
    setSelectableCount = set_selectable_count;
    refreshGrid(initData, defaultData, showChangesCallback, startGridCallback);
}

export function updatePerPage(perPage) {
    if (defaultData) defaultData.per_page = perPage;
    searchProducts();
}

export function searchProducts() {
    let params = getFilterParams(filterData, { per_page: defaultData?.per_page || 25 });

    gx.gridOptions.api.hidePopupMenu();
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
                collections: item.parent.collections,
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
                inventory_quantity: ((item.inventory_quantity || 0) * 1),
                price: ((item.price || 0) * 1),
                compare_at_price: ((item.compare_at_price || 0) * 1),
                taxable: item.taxable ? 'true' : 'false',
                barcode: item.barcode || '',
                weight: ((item.weight || 0) * 1),
            };
            cur_data['prev'] = { ...cur_data };
            return cur_data;
        });

        gx.gridOptions.api.clearRangeSelection();

        if (v.current_page === 1) {
            gx.gridOptions.api.setRowData(result);

            addEditedCellCount(0, true);
        } else {
            gx.gridOptions.api.applyTransaction({ add: result });
        }
    }, 'post');
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
        if (e?.status === 429) {
            shopify.toast.show('Connect request limit exceeded. (Once every 10 minutes)', { isError: true });
        } else {
            shopify.toast.show('An error occurred while connecting products. Please try again.', { isError: true });
        }
        if (errorCallback) errorCallback();
    }
}

export async function saveColumns(e) {
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
        refreshGrid(initData, defaultData, showChangesCallback, startGridCallback);
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

export function getSelectedSeoContents() {
    const rows = gx.gridOptions.api.getSelectedRows();

    if (rows.length < 1) {
        showError('Please select the product(s) for which you want to generate AI SEO information.');
        return null;
    }

    const result = rows.map(row => ({
        id: row.product_id,
        productId: row.product_id,
        title: row.product_name,
        description: row.product_body,
        tags: row.product_tags,
        productType: row.product_type,
    }));

    return [ ...new Map(result.map(item => [item.id, item])).values() ];
}

export async function setSeoContentFromAI(data, callback) {
    gx.gridOptions.api.forEachNode((node) => {
        if (node.data.position > 1) return;

        const row = data.find(row => row.productId === node.data.product_id);
        if (row) {
            node.setDataValue('seo_title', row.seoTitle);
            node.setDataValue('seo_description', row.seoDescription);
        }
    });
    callback();
}

/*
    Private Function
*/

async function refreshGrid(data, defaultData, showChangesModal, startGrid) {
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
        onCellEditingStarted: async (e) => {
            if (e.colDef.field === 'product_tags') {
                const newTags = await handleTagPicker(data.tags, e.value, e.data.product_name);
                const newTagValue = (newTags || []).join(', ');
                if (newTags.length > 0 && newTagValue !== e.value) {
                    e.node.setDataValue(e.colDef.field, newTagValue);
                }
                e.api.stopEditing(true);
            }
        },
        onFilterChanged: (e) => {
            filterData = e.api.getFilterModel();
            searchProducts();
        },
        onGridReady: (e) => {
            startGrid();
        }
    });

    searchProducts();
}

async function getInitialData() {
    return await getCompositionData();
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
    setSelectableCount(editedCellCount);

    if (editedCellCount > 0) {
        shopify.saveBar.show('products-save-bar');
    }

    if (editedCellCount > defaultData.plan_selected_limit) {
        shopify.toast.show('You have reached the edit limit for your current plan. (Maximum: ' + formatNumberWithCommas(defaultData.plan_selected_limit) + ')', { isError: true });
    }
}

function getFilterParams(data, defaultData) {
    let params = [];

    for (const key in defaultData) {
        const paramsKey = COLUMN_PARAMS[key];
        params.push(paramsKey + '=' + defaultData[key]);
    }

    for (const key in data) {
        const col = data[key];
        const paramsKey = COLUMN_PARAMS[key];

        if (col.filterType === 'set') {
            if (paramsKey === 'inventory_management') {
                params.push(paramsKey + '=' + col.values.map(val => val === 'true' ? 'shopify' : '').join(','));
            } else {
                params.push(paramsKey + '=' + col.values.map(val => val === 'true' ? 1 : val === 'false' ? 0 : val).join(','));
            }
        }

        if (col.filterType === 'number') {
            if (col.type === 'inRange') {
                params.push(paramsKey + '_min=' + col.filter);
                params.push(paramsKey + '_max=' + col.filterTo);
            } else if (col.type === 'equals') {
                params.push(paramsKey + '=' + col.filter);
            }
        }

        if (col.filterType === 'text') {
            if (col.type === 'contains') {
                params.push(paramsKey + '=' + col.filter);
            }
        }
    }
    return params.join('&');
}

async function handleTagPicker(tags, value, title) {
    const selectedTags = value.split(', ');

    const sortedTags = tags
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .sort((a, b) => {
            const aSelected = selectedTags.includes(a);
            const bSelected = selectedTags.includes(b);
            return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
        });

    const picker = await shopify.picker({
        heading: `Select ${title}'s Tags`,
        multiple: true,
        headers: [ { content: 'Tags' } ],
        items: sortedTags.map((tag) => ({
            id: tag,
            heading: tag,
            selected: selectedTags.includes(tag),
        }))
    });

    return await picker.selected;
}
