import fetchData from "../api/fetch.js";

export default function getInitialColumns(data) {
    const { status = [], tags = [], types = [], vendor = [] } = data || {};

    const product_status_values = {
        active: [ 'Active', 'Polaris-Badge--toneSuccess', '활성' ],
        draft: [ 'Draft', 'Polaris-Badge--toneInfo', '초안' ],
        archived: [ 'Archived', 'Polaris-Badge--toneDefault', '보관' ]
    };

    const PRODUCT_STATUS = status.reduce((acc, key) => {
        acc[key] = {
            label: product_status_values[key]?.[0] || '-',
            className: product_status_values[key]?.[1] || '',
            koLabel: product_status_values[key]?.[2] || '-',
        }
        return acc;
    }, {});

    const cellMergeStyling = (p) => {
        if (p.data.position !== (p.data.parent?.variants_cnt || 1)) {
            return { borderBottomWidth: '0px' };
        }
        return {};
    };

    const getAllRowsExceptCurrent  = (gridOptions) => {
        let rows = [];
        gridOptions.api.forEachNode((node) => {
            if (gridOptions.node.rowIndex !== node.rowIndex) {
                rows.push(node.data);
            }
        });
        return rows;
    }

    const changeCellState = (field, e) => {
        e.node.setDataValue(field + '_changed', true);
        e.api.forEachNode((node) => {
            if (node.data.product_id === e.data.product_id) {
                node.setSelected(true);
            }
        });
    }

    const changeCellStateIfNumber = (field, e) => {
        if (isNaN(e.newValue * 1)) {
            shopify.toast.show('Please enter in numeric format.', { isError: true });
            e.data[e.colDef.field] = e.oldValue;
            e.api.refreshCells({ columns: [ e.colDef.field ], rosNodes: [ e.node ] });
            return;
        }
        changeCellState(field, e);
    }

    const changedCellClassRules = (field) => {
        return {
            'changed': (p) => p.data[field + '_changed']
        };
    };

    const initial_columns = [
        { field: "product_status_changed", hide: true },
        { field: "product_name_changed", hide: true },
        { field: "product_type_changed", hide: true },
        { field: "product_tags_changed", hide: true },
        { field: "product_body_changed", hide: true },
        { field: "vendor_changed", hide: true },
        { field: "handle_changed", hide: true },
        { field: "option_name_changed", hide: true },
        { field: "price_changed", hide: true },
        { field: "inventory_quantity_changed", hide: true },
        { field: "inventory_policy_changed", hide: true },
        { field: "compare_at_price_changed", hide: true },
        { field: "taxable_changed", hide: true },
        { field: "barcode_changed", hide: true },
        { field: "sku_changed", hide: true },
        { field: "requires_shipping_changed", hide: true },
        { field: "weight_changed", hide: true },
        { field: "weight_unit_changed", hide: true },
        {
            field: "chk",
            headerName: '',
            checkboxSelection: (p) => p.data.position < 2,
            headerCheckboxSelection: true,
            width: 24,
            sort: false,
            cellStyle: cellMergeStyling,
            cellClass: 'hd-grid-code',
        },
        {
            field: "group_id",
            headerName: "Product ID",
            width: 120,
            filter: true,
            cellStyle: cellMergeStyling,
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => p.data.position > 1 ? '' : `<a href="shopify://admin/products/${p.value}" class="link">${p.value}</a>`,
        },
        {
            field: "product_status",
            headerName: "Status",
            width: 75,
            filter: true,
            filterParams: {
                values: status,
                valueFormatter: (p) => PRODUCT_STATUS[p.value]?.label || '-',
            },
            cellStyle: cellMergeStyling,
            cellClass: 'hd-grid-code',
            cellClassRules: changedCellClassRules('product_status'),
            cellRenderer: (p) => p.data.position > 1 ? '' : `<span class="grid-badge ${PRODUCT_STATUS[p.value]?.className || ''} Polaris-Text--bold">${PRODUCT_STATUS[p.value]?.label || ''}</span>`,
            onCellValueChanged: (e) => changeCellState('product_status', e),
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: Object.entries(PRODUCT_STATUS).map(([ key, value ]) => ({ id: key, ...value })),
                width: "80px",
            },
        },
        {
            field: "product_img",
            headerName: "Image",
            width: 60,
            cellStyle: cellMergeStyling,
            cellRenderer: (p) => {
                if (p.data.position > 1) return '';

                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style='width:30px;height:30px;' /></div>`;
                }

                return '';
            },
        },
        {
            field: "product_name",
            headerName: "Product Name",
            width: 120,
            filter: true,
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellClassRules: changedCellClassRules('product_name'),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            onCellValueChanged: (e) => changeCellState('product_name', e),
            editable: (p) => p.data.position < 2,
        },
        {
            field: "product_type",
            headerName: "Product Type",
            width: 100,
            filter: true,
            filterParams: {
                values: types,
            },
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellClassRules: changedCellClassRules('product_type'),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            onCellValueChanged: (e) => changeCellState('product_type', e),
            editable: (p) => p.data.position < 2,
        },
        {
            field: "product_tags",
            headerName: "Tags",
            width: 200,
            filter: "agTextColumnFilter",
            filterParams: {
                filterOptions: [ "contains", "notContains" ],
            },
            cellStyle: cellMergeStyling,
            cellClassRules: changedCellClassRules('product_tags'),
            cellRenderer: (p) => p.data.position > 1 ? '' : (!p.value ? '-' : `
                <div class="flex flex-wrap align-items-center gap-1 py-1">
                    ${p.value.split(', ').map((tag) => `<span class="grid-badge Polaris-Badge--toneInfo" style="display:inline-block;line-height:normal;">${tag || ''}</span>`).join('')}
                </div>
            `),
            onCellValueChanged: (e) => changeCellState('product_tags', e),
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldMultipleEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldMultipleEditor,
                values: tags.map((tag) => ({ id: tag, label: tag })),
                width: "120px",
            },
        },
        {
            field: "product_body",
            headerName: "Product Body HTML",
            width: 300,
            cellStyle: (p) => ({
                ...cellMergeStyling(p),
                whiteSpace: 'normal'
            }),
            cellClassRules: changedCellClassRules('product_body'),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            onCellValueChanged: (e) => changeCellState('product_body', e),
            editable: (p) => p.data.position < 2,
            cellEditor: 'agLargeTextCellEditor',
            cellEditorPopup: true,
            cellEditorParams: {
                maxLength: 100
            },
        },
        {
            field: "vendor",
            headerName: "Vendor",
            width: 120,
            filter: true,
            filterParams: {
                values: vendor,
            },
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellClassRules: changedCellClassRules('vendor'),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            onCellValueChanged: (e) => changeCellState('vendor', e),
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: vendor.map((v) => ({ id: v, label: v })),
                width: "120px",
            },
        },
        {
            field: "handle",
            headerName: "URL Handle",
            width: 130,
            filter: true,
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellClassRules: changedCellClassRules('handle'),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            onCellValueChanged: async (e) => {
                const rows = getAllRowsExceptCurrent(e).map(row => row.handle);
                if (e.data.prev_handle !== e.newValue && ([ ...new Set(rows) ].includes(e.newValue) || await checkIsHandleDuplicate(e.newValue))) {
                    shopify.toast.show('The URL handle is already in use.', { isError: true });
                    e.data[e.colDef.field] = e.oldValue;
                    e.api.refreshCells({ columns: [ e.colDef.field ], rosNodes: [ e.node ] });
                    e.api.startEditingCell({ rowIndex: e.node.rowIndex, colKey: e.colDef.field });
                    return;
                }
                changeCellState('handle', e);
            },
            editable: (p) => p.data.position < 2,
        },
        {
            field: "product_published_at",
            headerName: "Published At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellRenderer: (p) => p.data.position > 1 ? '' : formatDate(p.value || ''),
        },
        {
            field: "product_created_at",
            headerName: "Created At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellRenderer: (p) => p.data.position > 1 ? '' : formatDate(p.value || ''),
        },
        {
            field: "product_updated_at",
            headerName: "Updated At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellRenderer: (p) => p.data.position > 1 ? '' : formatDate(p.value || ''),
        },
        {
            field: "option_img",
            headerName: "Image",
            width: 60,
            cellRenderer: (p) => {
                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style=width:30px;height:30px;' /></div>`;
                }
                return '';
            },
        },
        {
            field: "option_name",
            headerName: "Variant Name",
            width: 150,
            filter: "agTextColumnFilter",
            cellClassRules: changedCellClassRules('option_name'),
            onCellValueChanged: (e) => changeCellState('option_name', e),
            editable: true,
        },
        {
            field: "price",
            headerName: "Price($)",
            type: "currencyType",
            width: 90,
            filter: "agNumberColumnFilter",
            cellClassRules: changedCellClassRules('price'),
            cellRenderer: (p) => '$ ' + numberWithCommas(p.value || 0),
            onCellValueChanged: (e) => changeCellStateIfNumber('price', e),
            editable: true,
        },
        {
            field: "inventory_management",
            headerName: "Inventory Management",
            width: 150,
            filter: true,
            filterParams: {
                values: [ 'true', 'false' ],
            },
            cellStyle: (p) => p.value === 'true' ? { color: 'green' } : { color: '#666666' },
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => `<a href="shopify://admin/products/${p.data.group_id}" class="underline">${p.value}</a>`
        },
        {
            field: "inventory_quantity",
            headerName: "Inventory Quantity",
            width: 120,
            filter: "agNumberColumnFilter",
            cellStyle: (p) => p.data.inventory_management !== 'true' ? { textDecoration: 'line-through' } : {},
            cellClass: 'hd-grid-number',
            cellClassRules: changedCellClassRules('inventory_quantity'),
            cellRenderer: (p) => numberWithCommas(p.value || 0),
            onCellValueChanged: (e) => changeCellStateIfNumber('inventory_quantity', e),
            editable: (p) => p.data.inventory_management === 'true',
            tooltipValueGetter: (p) => p.data.inventory_management === 'true'
                ? null
                : ' Inventory Quantity can only be modified when Inventory Management is set to "true". ',
        },
        {
            field: "inventory_policy",
            headerName: "Inventory Policy",
            width: 120,
            filter: true,
            filterParams: {
                values: [ 'continue', 'deny' ],
            },
            cellClass: 'hd-grid-code',
            cellClassRules: changedCellClassRules('inventory_policy'),
            onCellValueChanged: (e) => changeCellState('inventory_policy', e),
            editable: true,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'continue', 'deny' ].map((v) => ({ id: v, label: v })),
                width: "80px",
            },
            // cellEditor: "agRichSelectCellEditor",
            // cellEditorParams: {
            //     values: [ 'continue', 'deny' ],
            // },
        },
        {
            field: "compare_at_price",
            headerName: "Compare At Price",
            type: 'currencyType',
            width: 130,
            filter: "agNumberColumnFilter",
            cellClassRules: changedCellClassRules('compare_at_price'),
            cellRenderer: (p) => '$ ' + numberWithCommas(p.value || 0),
            onCellValueChanged: (e) => changeCellStateIfNumber('compare_at_price', e),
            editable: true,
        },
        {
            field: "taxable",
            headerName: "Taxable",
            width: 70,
            filter: true,
            filterParams: {
                values: [ 'true', 'false' ],
            },
            cellStyle: (p) => [true, 'true'].includes(p.value) ? { color: 'green' } : { color: '#666666' },
            cellClass: 'hd-grid-code',
            cellClassRules: changedCellClassRules('taxable'),
            onCellValueChanged: (e) => changeCellState('taxable', e),
            editable: true,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'true', 'false' ].map((v) => ({ id: v, label: v })),
                width: "80px",
            },
        },
        {
            field: "barcode",
            headerName: "Barcode",
            width: 130,
            filter: true,
            cellClass: 'hd-grid-code',
            cellClassRules: changedCellClassRules('barcode'),
            onCellValueChanged: (e) => changeCellState('barcode', e),
            editable: true,
        },
        {
            field: "sku",
            headerName: "sku",
            width: 120,
            filter: true,
            cellClassRules: changedCellClassRules('sku'),
            onCellValueChanged: (e) => changeCellState('sku', e),
            editable: true,
        },
        {
            field: "requires_shipping",
            headerName: "requires_shipping",
            width: 120,
            filter: true,
            cellStyle: (p) => [true, 'true'].includes(p.value) ? { color: 'green' } : { color: '#666666' },
            cellClass: 'hd-grid-code',
            cellClassRules: changedCellClassRules('requires_shipping'),
            onCellValueChanged: (e) => changeCellState('requires_shipping', e),
            editable: true,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'true', 'false' ].map((v) => ({ id: v, label: v })),
                width: "80px",
            },
        },
        {
            field: "weight",
            headerName: "Weight",
            type: 'currencyType',
            width: 80,
            filter: "agNumberColumnFilter",
            cellClassRules: changedCellClassRules('weight'),
            cellRenderer: (p) => numberWithCommas(p.value || 0),
            onCellValueChanged: (e) => changeCellStateIfNumber('weight', e),
            editable: true,
        },
        {
            field: "weight_unit",
            headerName: "Unit",
            width: 60,
            filter: true,
            filterParams: {
                values: [ 'g', 'kg', 'lb', 'oz' ],
            },
            cellClassRules: changedCellClassRules('weight_unit'),
            onCellValueChanged: (e) => changeCellState('weight_unit', e),
            editable: true,
            cellEditor: GridFieldEditor,
            cellEditorPopup: true,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'g', 'kg', 'lb', 'oz' ].map((unit) => ({ id: unit, label: unit })),
                width: "60px",
            },
        },
        {
            field: "created_at",
            headerName: "Variant Created At",
            type: "CustomDateTimeType"
        },
        {
            field: "updated_at",
            headerName: "Variant Updated At",
            type: "CustomDateTimeType"
        }
    ];

    return initial_columns;
}

async function checkIsHandleDuplicate(newHandle) {
    const { exists } = await fetchData({ method: 'GET', url: '/api/products/check-handle?handle=' + newHandle });
    return exists; // true: duplicate, false: not duplicate
}
