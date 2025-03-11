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

    const changeCellState = (field, e) => {
        e.node.setDataValue(field + '_changed', true);
        e.api.forEachNode((node) => {
            if (node.data.product_id === e.data.product_id) {
                node.setSelected(true);
            }
        });
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
        { field: "old_inventory_quantity_changed", hide: true },
        { field: "inventory_policy_changed", hide: true },
        { field: "compare_at_price_changed", hide: true },
        { field: "taxable_changed", hide: true },
        { field: "barcode_changed", hide: true },
        { field: "fullfillment_service_changed", hide: true },
        { field: "weight_changed", hide: true },
        { field: "weight_unit_changed", hide: true },
        {
            field: "chk",
            headerName: '',
            cellClass: 'hd-grid-code',
            checkboxSelection: (p) => p.data.position < 2,
            headerCheckboxSelection: true,
            width: 24,
            sort: false,
            cellStyle: cellMergeStyling
        },
        {
            field: "group_id", headerName: "Product ID", width: 110, cellClass: 'hd-grid-code',
            cellRenderer: (p) => p.data.position > 1 ? '' : `<a href="shopify://admin/products/${p.value}" class="link">${p.value}</a>`,
            cellStyle: cellMergeStyling,
            filter: true,
        },
        {
            field: "product_status",
            headerName: "Status",
            width: 75,
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => p.data.position > 1 ? '' : `<span class="grid-badge ${PRODUCT_STATUS[p.value]?.className || ''} Polaris-Text--bold">${PRODUCT_STATUS[p.value]?.label || ''}</span>`,
            cellStyle: cellMergeStyling,
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldEditor,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: Object.entries(PRODUCT_STATUS).map(([ key, value ]) => ({ id: key, ...value })),
                width: "80px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('product_status'),
            onCellValueChanged: (e) => changeCellState('product_status', e),
            filter: true,
            filterParams: {
                values: status,
                valueFormatter: (p) => PRODUCT_STATUS[p.value]?.label || '-',
            }
        },
        {
            field: "product_img", headerName: "Image", width: 60,
            cellRenderer: (p) => {
                if (p.data.position > 1) return '';

                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style='width:30px;height:30px;' /></div>`;
                }

                return '';
            },
            cellStyle: cellMergeStyling
        },
        {
            field: "product_name", headerName: "Product Name", width: 120,
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            editable: (p) => p.data.position < 2,
            cellClassRules: changedCellClassRules('product_name'),
            onCellValueChanged: (e) => changeCellState('product_name', e),
            filter: true,
        },
        {
            field: "product_type",
            headerName: "Product Type",
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            editable: (p) => p.data.position < 2,
            width: 100,
            cellClassRules: changedCellClassRules('product_type'),
            onCellValueChanged: (e) => changeCellState('product_type', e),
            filter: true,
            filterParams: {
                values: types,
            }
        },
        {
            field: "product_tags", headerName: "Tags", width: 200,
            cellRenderer: (p) => p.data.position > 1 ? '' : (!p.value ? '-' : `
                <div class="flex flex-wrap align-items-center gap-1 py-1">
                    ${p.value.split(', ').map((tag) => `<span class="grid-badge Polaris-Badge--toneInfo" style="display:inline-block;line-height:normal;">${tag || ''}</span>`).join('')}
                </div>
            `),
            cellStyle: cellMergeStyling,
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldMultipleEditor,
            cellEditorParams: {
                cellEditor: GridFieldMultipleEditor,
                values: tags.map((tag) => ({ id: tag, label: tag })),
                width: "120px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('product_tags'),
            onCellValueChanged: (e) => changeCellState('product_tags', e),
            filter: "agTextColumnFilter",
            filterParams: {
                filterOptions: ["contains", "notContains"],
            }
        },
        {
            field: "product_body",
            headerName: "Product Body HTML",
            cellStyle: (p) => ({
                ...cellMergeStyling(p),
                whiteSpace: 'normal'
            }),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            width: 300,
            editable: (p) => p.data.position < 2,
            cellClassRules: changedCellClassRules('product_body'),
            onCellValueChanged: (e) => changeCellState('product_body', e)
        },
        {
            field: "vendor",
            headerName: "Vendor",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            editable: (p) => p.data.position < 2,
            width: 80,
            cellEditor: GridFieldEditor,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: vendor.map((v) => ({ id: v, label: v })),
                width: "120px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('vendor'),
            onCellValueChanged: (e) => changeCellState('vendor', e),
            filter: true,
            filterParams: {
                values: vendor,
            }
        },
        {
            field: "handle",
            headerName: "Handle",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            editable: (p) => p.data.position < 2,
            width: 120,
            cellClassRules: changedCellClassRules('handle'),
            onCellValueChanged: (e) => changeCellState('handle', e),
            filter: true,
        },
        {
            field: "product_published_at",
            headerName: "Published At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
        },
        {
            field: "product_created_at",
            headerName: "Created At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
        },
        {
            field: "product_updated_at",
            headerName: "Updated At",
            type: "CustomDateTimeType",
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
        },
        {
            field: "option_img", headerName: "Image", width: 60,
            cellRenderer: (p) => {
                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style=width:30px;height:30px;' /></div>`;
                }
                return '';
            },
        },
        {
            field: "option_name", headerName: "Variant Name", width: 120, editable: true,
            cellClassRules: changedCellClassRules('option_name'),
            onCellValueChanged: (e) => changeCellState('option_name', e),
            filter: true,
        },
        {
            field: "price", headerName: "Price($)", width: 90, type: "currencyType", editable: true,
            cellRenderer: (p) => '$ ' + numberWithCommas(p.value || 0),
            cellClassRules: changedCellClassRules('price'),
            onCellValueChanged: (e) => changeCellState('price', e),
            filter: "agNumberColumnFilter",
        },
        {
            field: "inventory_quantity",
            headerName: "Inventory Quantity",
            width: 120,
            cellClass: 'hd-grid-number',
            editable: true,
            cellRenderer: (p) => numberWithCommas(p.value || 0),
            cellClassRules: changedCellClassRules('inventory_quantity'),
            onCellValueChanged: (e) => changeCellState('inventory_quantity', e),
            filter: "agNumberColumnFilter",
        },
        {
            field: "old_inventory_quantity",
            headerName: "Old Inventory Quantity",
            width: 150,
            cellClass: 'hd-grid-number',
            editable: true,
            cellClassRules: changedCellClassRules('old_inventory_quantity'),
            onCellValueChanged: (e) => changeCellState('old_inventory_quantity', e),
            filter: "agNumberColumnFilter",
        },
        {
            field: "inventory_policy",
            headerName: "Inventory Policy",
            width: 120,
            cellClass: 'hd-grid-code',
            editable: true,
            cellEditor: GridFieldEditor,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'continue', 'deny' ].map((v) => ({ id: v, label: v })),
                width: "80px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('inventory_policy'),
            onCellValueChanged: (e) => changeCellState('inventory_policy', e),
            filter: true,
            filterParams: {
                values: [ 'continue', 'deny' ],
            }
        },
        {
            field: "compare_at_price",
            headerName: "Compare At Price",
            width: 130,
            type: 'currencyType',
            editable: true,
            cellClassRules: changedCellClassRules('compare_at_price'),
            onCellValueChanged: (e) => changeCellState('compare_at_price', e),
            filter: "agNumberColumnFilter",
        },
        {
            field: "taxable", headerName: "Taxable", width: 70, cellClass: 'hd-grid-code', editable: true,
            cellEditor: GridFieldEditor,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'true', 'false' ].map((v) => ({ id: v, label: v })),
                width: "80px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('taxable'),
            onCellValueChanged: (e) => changeCellState('taxable', e),
            filter: true,
            filterParams: {
                values: [ 'true', 'false' ],
            }
        },
        {
            field: "barcode", headerName: "Barcode", width: 130, cellClass: 'hd-grid-code', editable: true,
            cellClassRules: changedCellClassRules('barcode'),
            onCellValueChanged: (e) => changeCellState('barcode', e),
            filter: true,
        },
        {
            field: "fullfillment_service", headerName: "Fulfillment Service", width: 180, editable: true,
            cellClassRules: changedCellClassRules('fullfillment_service'),
            onCellValueChanged: (e) => changeCellState('fullfillment_service', e),
            filter: true,
        },
        {
            field: "weight", headerName: "Weight", width: 80, type: 'currencyType', editable: true,
            cellClassRules: changedCellClassRules('weight'),
            onCellValueChanged: (e) => changeCellState('weight', e),
            filter: "agNumberColumnFilter",
        },
        {
            field: "weight_unit", headerName: "Unit", width: 60, editable: true,
            cellEditor: GridFieldEditor,
            cellEditorParams: {
                cellEditor: GridFieldEditor,
                values: [ 'g', 'kg', 'lb', 'oz' ].map((unit) => ({ id: unit, label: unit })),
                width: "60px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('weight_unit'),
            onCellValueChanged: (e) => changeCellState('weight_unit', e),
            filter: true,
            filterParams: {
                values: [ 'g', 'kg', 'lb', 'oz' ],
            }
        },
        { field: "created_at", headerName: "Variant Created At", type: "CustomDateTimeType" },
        { field: "updated_at", headerName: "Variant Updated At", type: "CustomDateTimeType" }
    ];

    return initial_columns;
}
