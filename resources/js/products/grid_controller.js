import fetchData from "../api/fetch.js";
import getInitialColumns from "./columns.js";

let pApp, gx, gridDiv, initData;

export async function initGrid() {
    pApp = new App('', { gridId: "#div-gd" });

    pApp.ResizeGrid(170);
    pApp.BindSearchEnter('#search_product');

    gridDiv = document.querySelector(pApp.options.gridId);

    initData = await getInitialData();
    refreshGrid(initData);
}

export function searchProducts(e) {
    // let params = $('form[name="search"]').serialize();
    let params = 'per_page=20';

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
                group_id: filterByPosition(item, item.parent.product_id),
                product_name: filterByPosition(item, item.parent.title),
                product_type: filterByPosition(item, item.parent.product_type),
                product_tags: filterByPosition(item, item.parent.tags),
                product_body: filterByPosition(item, item.parent.body_html),
                product_img: filterByPosition(item, (item, item.parent.images[0]?.src || '')),
                product_status: filterByPosition(item, item.parent.status),
                vendor: filterByPosition(item, item.parent.vendor),
                handle: filterByPosition(item, item.parent.handle),
                product_published_at: filterByPosition(item, item.parent.published_at),
                product_created_at: filterByPosition(item, item.parent.created_at),
                product_updated_at: filterByPosition(item, item.parent.updated_at),
                option_name: item.title,
                option_img: item.image?.src || '',
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
    const rows = [];
    gx.gridOptions.api.getSelectedRows().forEach((data) => {
        const variant = {
            id: data.variant_id,
            price: data.price,
            compare_at_price: data.compare_at_price,
            inventory_item_id: data.inventory_item_id,
            inventory_quantity: data.inventory_quantity,
            weight: data.weight,
            weight_unit: data.weight_unit,
            sku: data.sku,
            inventory_policy: data.inventory_policy,
            taxable: data.taxable,
            barcode: data.barcode,
            requires_shipping: data.requires_shipping
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
        alert('Please select the product(s) to delete.');
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
        alert('Column information has been save.');
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

        alert('Column information has been reset.');
        gx.gridOptions.api.destroy();
        refreshGrid(initData);
    } catch (error) {
        console.error('Error fetching personal column:', error);
    }
}

/*
    Private Function
*/

async function refreshGrid(data) {
    const default_columns = [ ...getInitialColumns(data) ];
    const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

    gx = new HDGrid(gridDiv, my_columns, {
        enableCellSpan: true,
        suppressRowTransform: true,
        rowClassRules: {
            "even": "data.parent_index % 2 !== 0",
        },
        suppressFieldDotNotation: true,
        onRowSelected: (event) => {
            if (event.node.data.parent.variants_cnt > 1) {
                gx.gridOptions.api.forEachNode((node) => {
                    if (node.data.product_id === event.node.data.product_id) {
                        node.setSelected(event.node.selected);
                    }
                });
            }
        },
    });

    searchProducts();
}

function filterByPosition(item, value) {
    return item.position !== 1 ? '' : value;
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
