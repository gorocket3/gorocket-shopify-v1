import fetchData from "../api/fetch.js";
import getInitialColumns from "./columns.js";

let pApp, gx, gridDiv, initData, defaultData;

export async function initGrid({ default_per_page }) {
    pApp = new App('', { gridId: "#div-gd" });

    pApp.ResizeGrid(170);
    pApp.BindSearchEnter('#search_product');

    gridDiv = document.querySelector(pApp.options.gridId);

    initData = await getInitialData();
    defaultData = { per_page: default_per_page };
    refreshGrid(initData, defaultData);
}

export function searchProducts({ per_page = 10 } = {}) {
    // let params = $('form[name="search"]').serialize();
    let params = 'per_page=' + per_page;

    gx.Request('/api/products', params, 1, function (v) {
        const data = v.data.reduce((a, c, i) => {
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
            return {
                ...item,
                group_id: item.parent.product_id,
                product_name: item.parent.title,
                product_type: item.parent.product_type,
                product_tags: item.parent.tags,
                product_body: item.parent.body_html,
                product_img: (item, item.parent.images[0]?.src || ''),
                product_status: item.parent.status,
                vendor: item.parent.vendor,
                handle: item.parent.handle,
                prev_handle: item.parent.handle,
                product_published_at: item.parent.published_at,
                product_created_at: item.parent.created_at,
                product_updated_at: item.parent.updated_at,
                option_name: item.title,
                option_img: item.image?.src || '',
                inventory_management: item.inventory_management === 'shopify' ? 'true' : 'false',
                price: item.price * 1,
                compare_at_price: item.compare_at_price * 1,
                weight: item.weight * 1,
            };
        });

        gx.gridOptions.api.clearRangeSelection();

        if (v.current_page === 1) {
            gx.gridOptions.api.setRowData(result);
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

    const rows = [];
    selectedRows.forEach((data) => {
        const variant = {
            id: data.variant_id,
            price: parseFloat(data.price || 0),
            compare_at_price: parseFloat(data.compare_at_price || 0),
            inventory_item_id: data.inventory_item_id,
            inventory_management: data.inventory_management === 'true',
            weight: parseFloat(data.weight || 0),
            weight_unit: data.weight_unit,
            sku: data.sku,
            inventory_policy: data.inventory_policy,
            taxable: [true, 'true'].includes(data.taxable),
            barcode: data.barcode,
            requires_shipping: [true, 'true'].includes(data.requires_shipping),
            // title: data.option_name,
        }

        if (data.inventory_management === 'true') {
            variant.inventory_quantity = parseInt(data.inventory_quantity || 0);
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
                vendor: data.vendor,
                handle: data.handle
            };

            rows.push({ ...product, variants: [ variant ] });
        }
    });
    return rows;
}

export async function saveProducts(rows, errorCallback = null) {
    fetch('/api/products/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "products": rows })
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
            alert('An error occurred while updating the product.');
            if (errorCallback) errorCallback();
        });
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

export async function connectProducts(errorCallback = null) {
    try {
        await fetchData({ method: 'POST', url: '/api/products/sync' });
    } catch (e) {
        alert('An error occurred while connecting products. Please try again.');
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
        refreshGrid(initData, defaultData);
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

/*
    Private Function
*/

async function refreshGrid(data, defaultData) {
    const default_columns = [ ...getInitialColumns(data) ];
    const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

    gx = new HDGrid(gridDiv, my_columns, {
        enableCellSpan: true,
        suppressRowTransform: true,
        rowClassRules: {
            "even": "data.parent_index % 2 !== 0",
        },
        suppressFieldDotNotation: true,
        floatingFilter: true,
        // undoRedoCellEditing: true,
        // undoRedoCellEditingLimit: 20,
        tooltipShowDelay: 200,
        onRowSelected: (event) => {
            if (event.node.data.parent.variants_cnt > 1) {
                gx.gridOptions.api.forEachNode((node) => {
                    if (node.data.product_id === event.node.data.product_id) {
                        node.setSelected(event.node.selected);
                    }
                });
            }

            const selectedRows = event.api.getSelectedRows().map(row => row.product_id);
            const cnt = [ ...new Set(selectedRows) ].length;
            document.getElementById('gd-checked').innerText = cnt;
        },
        onCellEditingStarted: (e) => {},
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
