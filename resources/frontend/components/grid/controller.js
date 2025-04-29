import { getCompositionData, isFreePlan } from "../../utils/api";
import fetchData from "../../utils/fetch";
import { formatNumberWithCommas, sortIgnoreCase } from "../../utils/formats";
import { showError, showInfo } from "../../utils/toasts";
import getInitialColumns from "./columns";
import COLUMN_PARAMS from "./cols.json";

let pApp, gx, gridDiv, initData, defaultData, filterData, showChangesCallback, showSeoLogsCallback, showTagsCallback, startGridCallback, setSelectableCount;
let editedCellCount = 0;
let filterLoading = false;

export async function initGrid({
    plan_id,
    plan_selected_limit,
    default_per_page,
    default_sort_by,
    default_sort_desc,
    show_changes,
    show_seo_logs,
    show_tags,
    start_grid,
    set_selectable_count
}, callback = null) {
    pApp = new App('', { gridId: "#div-gd" });

    // const is_mobile = document.body.offsetWidth <= 1007;
    const grid_height = 170;
    pApp.ResizeGrid(grid_height);
    pApp.BindSearchEnter('#search_product');

    gridDiv = document.querySelector(pApp.options.gridId);

    initData = await getInitialData();
    defaultData = {
        plan_id,
        plan_selected_limit,
        per_page: default_per_page,
        sort_by: default_sort_by,
        sort_dir: default_sort_desc ? 'desc' : 'asc'
    };
    showChangesCallback = show_changes;
    showSeoLogsCallback = show_seo_logs;
    showTagsCallback = show_tags;
    startGridCallback = start_grid;
    setSelectableCount = set_selectable_count;
    refreshGrid(initData, defaultData, showChangesCallback, showSeoLogsCallback, showTagsCallback, startGridCallback);

    if (callback) callback({ tags: initData.tags });
}

export function clearGlobalData() {
    initData = null;
    defaultData = null;
    filterData = null;
}

export function updatePerPage(perPage) {
    if (defaultData) defaultData.per_page = perPage;
    searchProducts();
}

export function updateSortData({ sortBy, sortDesc }) {
    if (defaultData) {
        defaultData.sort_by = sortBy;
        defaultData.sort_dir = sortDesc ? 'desc' : 'asc';
    }
    searchProducts();
}

export function searchProducts() {
    let params = getFilterParams(filterData, {
        per_page: defaultData?.per_page || 25,
        sort_by: defaultData?.sort_by || '',
        sort_dir: defaultData?.sort_dir || ''
    });

    if (gx) gx.gridOptions.api.hidePopupMenu();
    if (gx) gx.Request('/api/products', params, 1, function (v) {
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
            const sortedTags = sortIgnoreCase(item.parent.tags.split(', ')).join(', ');
            const cur_data = {
                ...item,
                group_id: item.parent.product_id,
                logs_count: item.parent.logs_count,
                product_name: item.parent.title,
                collections: item.parent.collections,
                product_type: item.parent.product_type,
                product_category: item.parent.category,
                product_tags: sortedTags,
                product_body: item.parent.body_html,
                product_img: item.parent.featured_image || '',
                product_alt: item.parent.images?.[0]?.alt || '',
                product_status: item.parent.status,
                vendor: item.parent.vendor,
                handle: item.parent.handle,
                seo_logs_count: item.parent.ai_generation_count,
                seo_title: item.parent.seo_title,
                seo_description: item.parent.seo_description,
                seo_grade: item.parent.ai_score?.grade ?? 'bad',
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
        showError('Please select the product(s) to save.');
        return null;
    }

    if (editedCellCount > defaultData.plan_selected_limit) {
        showError('You have reached the edit limit for your current plan. (Maximum: ' + formatNumberWithCommas(defaultData.plan_selected_limit) + ')');
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
            const sortedTags = sortIgnoreCase(data.product_tags.split(', ')).join(', ');
            const product = {
                id: data.product_id,
                title: data.product_name,
                status: data.product_status,
                body_html: data.product_body,
                tags: sortedTags,
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
        gx.gridOptions.api.showLoadingOverlay();
        await fetchData({ method: 'POST', url: '/api/products/edit', body: { "products": rows } });
        resetGridNodes();
    } catch (e) {
        if (e?.status === 429) {
            showError('Update request limit exceeded.', {
                action: 'Upgrade Plan',
                onAction: limitCallback
            });
        } else {
            showError('An error occurred while updating the product. Please try again.');
        }
        if (errorCallback) errorCallback();
    } finally {
        gx.gridOptions.api.hideOverlay();
    }
}

export function getProductsToRemove() {
    let rows = gx.gridOptions.api.getSelectedRows();
    if (rows.length < 1) {
        showError('Please select the product(s) to delete.');
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
            showError('Connect request limit exceeded. (Once every 30 minutes)');
        } else {
            showError('An error occurred while connecting products. Please try again.');
        }
        if (errorCallback) errorCallback();
    }
}

export async function saveColumns(callback) {
    const columnDefs = gx.gridOptions.api.getColumnDefs();
    const newColumnList = [];

    columnDefs.forEach((col) => {
        if (col.children && Array.isArray(col.children)) {
            const children = col.children.map((child) => ({
                field: child.field,
                hide: child.hide,
                pinned: child.pinned,
                width: child.width
            }));

            newColumnList.push({
                headerName: col.headerName || '',
                children
            });
        } else {
            newColumnList.push({
                field: col.field,
                hide: col.hide,
                pinned: col.pinned,
                width: col.width,
                children: []
            });
        }
    });

    try {
        const response = await fetch('/api/personal-column', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ columns: newColumnList })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const res = await response.json();
        showInfo('Column information has been saved.');
        callback();
    } catch (error) {
        console.error('Error saving personal column:', error);
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

        showInfo('Column information has been reset.');
        gx.gridOptions.api.destroy();
        refreshGrid(initData, defaultData, showChangesCallback, showSeoLogsCallback, showTagsCallback, startGridCallback);
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

export function getSelectedSeoContents() {
    const rows = gx.gridOptions.api.getSelectedRows();

    if (rows.length < 1) {
        showInfo('Please select the product(s) for which you want to generate AI SEO information.');
        return null;
    }

    const result = rows.map(row => ({
        id: row.product_id,
        productId: row.product_id,
        title: row.product_name,
        description: row.product_body,
        tags: row.product_tags,
        productType: row.product_type,
        productImg: row.product_img,
        productAlt: row.product_alt
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

export function setSeoContentFromLog({ productId, seoTitle, seoDescription }, callback = null) {
    gx.gridOptions.api.forEachNode((node) => {
        if (node.data.position > 1) return;

        if (productId === node.data.product_id) {
            node.setDataValue('seo_title', seoTitle);
            node.setDataValue('seo_description', seoDescription);
        }
    });
    if (callback) callback();
}

export function resetFilter() {
    gx.gridOptions.api.setFilterModel(null);
}

export function setTags(productId, newTags) {
    const newTagValue = (newTags || []).join(', ');
    gx.gridOptions.api.forEachNode((node) => {
        if (node.data.product_id === productId && newTagValue !== node.data.product_tags) {
            node.setDataValue('product_tags', newTagValue);
        }
    });
}

/*
    Private Function
*/

async function refreshGrid(data, defaultData, showChangesModal, showSeoLogsModal, showTagsModal, startGrid) {
    const default_columns = [ ...getInitialColumns(data, showChangesModal, showSeoLogsModal, showTagsModal, openOnlineStoreLink, addEditedCellCount) ];
    const { empty, columns: my_columns } = await getMyColumns(() => gx, gridDiv, default_columns);

    gx = new HDGrid(gridDiv, my_columns, {
        suppressRowTransform: true,
        rowClassRules: {
            "even": "data.parent_index % 2 !== 0",
        },
        // suppressDragLeaveHidesColumns: true,
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
        getContextMenuItems: (params) => {
            return [
                // ...(params.defaultItems || []),
                "copy",
                "copyWithHeaders",
                "paste",
                "separator",
                isFreePlan(defaultData.plan_id) ? {
                    name: "Export (Not available on current plan)",
                    disabled: true,
                } : "export",
            ];
        },
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
        // onCellEditingStarted: async (e) => {
        //     if (e.colDef.field === 'product_tags') {
        //         const newTags = await handleTagPicker(data.tags, e.value, e.data.product_name);
        //         const newTagValue = (newTags || []).join(', ');
        //         if (newTags.length > 0 && newTagValue !== e.value) {
        //             e.node.setDataValue(e.colDef.field, newTagValue);
        //         }
        //         e.api.stopEditing(true);
        //     }
        // },
        onFilterChanged: (e) => {
            if (filterLoading) {
                filterLoading = false;
                return;
            }

            filterData = setCustomFilter(e.api.getFilterModel());
            searchProducts();

            filterLoading = true;
            e.api.setFilterModel(filterData);
        },
        onGridReady: (e) => {
            startGrid({ columnSaved: !empty });
        }
    });

    searchProducts();
}

function resetGridNodes() {
    const nodes = gx.gridOptions.api.getSelectedNodes();

    nodes.forEach((node) => {
        node.data.prev = { ...node.data };

        if (node.data.product_status_changed) node.setDataValue("product_status_changed", false);
        if (node.data.product_name_changed) node.setDataValue("product_name_changed", false);
        if (node.data.product_type_changed) node.setDataValue("product_type_changed", false);
        if (node.data.product_tags_changed) node.setDataValue("product_tags_changed", false);
        if (node.data.product_body_changed) node.setDataValue("product_body_changed", false);
        if (node.data.vendor_changed) node.setDataValue("vendor_changed", false);
        if (node.data.handle_changed) node.setDataValue("handle_changed", false);
        if (node.data.seo_title_changed) node.setDataValue("seo_title_changed", false);
        if (node.data.seo_description_changed) node.setDataValue("seo_description_changed", false);
        if (node.data.price_changed) node.setDataValue("price_changed", false);
        if (node.data.inventory_quantity_changed) node.setDataValue("inventory_quantity_changed", false);
        if (node.data.inventory_policy_changed) node.setDataValue("inventory_policy_changed", false);
        if (node.data.compare_at_price_changed) node.setDataValue("compare_at_price_changed", false);
        if (node.data.taxable_changed) node.setDataValue("taxable_changed", false);
        if (node.data.barcode_changed) node.setDataValue("barcode_changed", false);
        if (node.data.sku_changed) node.setDataValue("sku_changed", false);
        if (node.data.requires_shipping_changed) node.setDataValue("requires_shipping_changed", false);
        if (node.data.weight_changed) node.setDataValue("weight_changed", false);
        if (node.data.weight_unit_changed) node.setDataValue("weight_unit_changed", false);
    });

    gx.gridOptions.api.deselectAll();
    gx.gridOptions.api.clearRangeSelection();
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
        showError('Incorrect product information.');
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
        showError('You have reached the edit limit for your current plan. (Maximum: ' + formatNumberWithCommas(defaultData.plan_selected_limit) + ')');
    }
}

function getFilterParams(data, defaultFilter) {
    let params = { ...defaultFilter };

    for (const key in data) {
        const col = data[key];
        const paramsKey = COLUMN_PARAMS[key];

        if (col.filterType === 'set') {
            if (paramsKey === 'inventory_management') {
                params[paramsKey] = col.values.length < 1
                    ? null
                    : col.values.map(val => val === 'true' ? 'shopify' : 'none')[0];
            } else {
                if (col.values.length < 1) {
                    params[paramsKey] = '__NONE__';
                } else {
                    const values = col.values.map(val => val === 'true' ? 1 : val === 'false' ? 0 : val);
                    params[paramsKey] = values.length > 1 ? values : values[0];
                }
            }
        }

        if (col.filterType === 'number') {
            if (col.type === 'inRange') {
                params[paramsKey + '_min'] = col.filter;
                params[paramsKey + '_max'] = col.filterTo;
            } else if (col.type === 'equals') {
                params[paramsKey] = col.filter;
            }
        }

        if (col.filterType === 'text') {
            if (col.type === 'blank') {
                params[paramsKey] = '__BLANK__';
            } else if (col.type === 'contains') {
                params[paramsKey] = col.filter;
            } else if ([ 'AND', 'OR' ].includes(col.operator)) {
                if (col.condition1) {
                    const val = [ col.condition1.filter, col.condition2?.filter ].filter(Boolean);
                    params[paramsKey] = val;

                    if (key === 'product_tags') {
                        params['tag_match'] = col.operator === 'AND' ? 'all' : 'any';
                    }
                }
            }
        }
    }
    return params;
}

// async function handleTagPicker(tags, value, title) {
//     const selectedTags = value.split(', ');
//
//     const sortedTags = tags
//         .slice()
//         .sort((a, b) => a.localeCompare(b))
//         .sort((a, b) => {
//             const aSelected = selectedTags.includes(a);
//             const bSelected = selectedTags.includes(b);
//             return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
//         });
//
//     const picker = await shopify.picker({
//         heading: `Select ${title}'s Tags`,
//         multiple: true,
//         headers: [ { content: 'Tags' } ],
//         items: sortedTags.map((tag) => ({
//             id: tag,
//             heading: tag,
//             selected: selectedTags.includes(tag),
//         }))
//     });
//
//     return await picker.selected;
// }

function setCustomFilter(filters) {
    Object.keys(filters).forEach((key) => {

        if (key === 'product_tags') {
            const ft = filters[key];
            if (!!ft.filter) {
                const arr = ft.filter.split(',').map(f => f.trim());
                if (arr.length > 1) {
                    filters[key] = {
                        filterType: "text",
                        operator: "AND",
                        condition1: {
                            filterType: "text",
                            type: "contains",
                            filter: arr[0]
                        },
                        condition2: {
                            filterType: "text",
                            type: "contains",
                            filter: arr[1]
                        }
                    }
                }
            }
        }
    });

    return filters;
}
