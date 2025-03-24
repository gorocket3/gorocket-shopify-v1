import fetchData from "../api/fetch.js";

export default function getInitialColumns(data, showChangesModal) {
    const { status = [], tags = [], types = [], vendor = [] } = data || {};

    const product_status_values = {
        active: [ 'Active', 'Polaris-Badge--toneSuccess' ],
        draft: [ 'Draft', 'Polaris-Badge--toneInfo' ],
        archived: [ 'Archived', 'Polaris-Badge--toneDefault' ]
    };

    const PRODUCT_STATUS = status.reduce((acc, key) => {
        acc[key] = {
            label: product_status_values[key]?.[0] || '-',
            className: product_status_values[key]?.[1] || '',
        }
        return acc;
    }, {});

    const cellMergeStyling = (p) => {
        if (p.data.position !== (p.data.parent?.variants_cnt || 1)) {
            return { borderBottomWidth: '0px' };
        }
        return {};
    };

    const getAllRowsExceptCurrent = (gridOptions) => {
        let rows = [];
        gridOptions.api.forEachNode((node) => {
            if (gridOptions.node.rowIndex !== node.rowIndex) {
                rows.push(node.data);
            }
        });
        return rows;
    }

    const changeCellState = (field, e) => {
        const oldValue = (e.oldValue === null || e.oldValue === undefined) ? '' : e.oldValue;
        const newValue = e.newValue === undefined ? '' : e.newValue;

        if (oldValue === newValue) return;

        if (e.data.prev[field] === newValue) {
            e.node.setDataValue(field + '_changed', false);
        } else {
            e.node.setDataValue(field + '_changed', true);
            e.api.forEachNode((node) => {
                if (node.data.product_id === e.data.product_id) {
                    node.setSelected(true);
                }
            });
        }
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
        { field: "group_id", hide: true },
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
        // {
        //     field: "group_id",
        //     headerName: "Product ID",
        //     width: 120,
        //     filter: 'agTextColumnFilter',
        //     filterParams: {
        //         closeOnApply: true,
        //     },
        //     cellStyle: cellMergeStyling,
        //     cellClass: 'hd-grid-code',
        //     cellRenderer: (p) => p.data.position > 1 ? '' : `<a href="shopify://admin/products/${p.value}" class="link">${p.value}</a>`,
        // },
        {
            field: "product_img",
            headerName: "Image",
            width: 60,
            cellStyle: cellMergeStyling,
            cellRenderer: (p) => {
                if (p.data.position > 1) return '';
                return `
                    <div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'>
                        <a href="shopify://admin/products/${p.data.group_id}" class="Polaris-Thumbnail Polaris-Thumbnail--sizeSmall">
                            ${!!p.value ? `
                                <img alt="${p.data.product_name}" src="${p.value}">
                            ` : `
                                <span class="Polaris-Icon">
                                    <span class="Polaris-Text--root Polaris-Text--visuallyHidden">None Image</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                                        <path fill-rule="evenodd" d="M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z"/>
                                    </svg>
                                </span>
                            `}
                        </a>
                    </div>
                `;
            },
        },
        {
            field: "store_link",
            headerName: "Store",
            width: 40,
            cellStyle: cellMergeStyling,
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => {
                if (p.data.position > 1) return '';
                return `
                   <a href="https://${shopify.config.shop}/products/${p.data.handle || ''}" target="_blank" class="inline-block relative top-1.5">
                        <span class="Polaris-Icon Polaris-Icon--toneSubdued Polaris-hover">
                            <span class="Polaris-Text--root Polaris-Text--visuallyHidden">None Image</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                                <path fill-rule="evenodd" d="M10 4c-2.476 0-4.348 1.23-5.577 2.532a9.266 9.266 0 0 0-1.4 1.922 5.98 5.98 0 0 0-.37.818c-.082.227-.153.488-.153.728s.071.501.152.728c.088.246.213.524.371.818.317.587.784 1.27 1.4 1.922 1.229 1.302 3.1 2.532 5.577 2.532 2.476 0 4.348-1.23 5.577-2.532a9.265 9.265 0 0 0 1.4-1.922 5.98 5.98 0 0 0 .37-.818c.082-.227.153-.488.153-.728s-.071-.501-.152-.728a5.984 5.984 0 0 0-.371-.818 9.269 9.269 0 0 0-1.4-1.922c-1.229-1.302-3.1-2.532-5.577-2.532Zm-5.999 6.002v-.004c.004-.02.017-.09.064-.223a4.5 4.5 0 0 1 .278-.608 7.768 7.768 0 0 1 1.17-1.605c1.042-1.104 2.545-2.062 4.487-2.062 1.942 0 3.445.958 4.486 2.062a7.77 7.77 0 0 1 1.17 1.605c.13.24.221.447.279.608.047.132.06.203.064.223v.004c-.004.02-.017.09-.064.223a4.503 4.503 0 0 1-.278.608 7.768 7.768 0 0 1-1.17 1.605c-1.042 1.104-2.545 2.062-4.487 2.062-1.942 0-3.445-.958-4.486-2.062a7.766 7.766 0 0 1-1.17-1.605 4.5 4.5 0 0 1-.279-.608c-.047-.132-.06-.203-.064-.223Z"/>
                            </svg>
                        </span>
                    </a>
                `;
            },
            tooltipValueGetter: (p) => ' View on Online Store. ',
        },
        {
            field: "change_log",
            headerName: "Changes",
            width: 50,
            cellStyle: cellMergeStyling,
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => {
                if (p.data.position > 1) return '';
                return `
                   <div class="inline-block relative top-1.5 cursor-pointer">
                        <span class="Polaris-Icon Polaris-Icon--toneSubdued Polaris-hover Polaris-Icon--toneSuccess">
                            <span class="Polaris-Text--root Polaris-Text--visuallyHidden">None Image</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M7.75 12a.75.75 0 0 0-1.5 0v1.293c0 .331.132.65.366.884l.854.853a.75.75 0 0 0 1.06-1.06l-.78-.78v-1.19Z"/>
                                <path fill-rule="evenodd" d="M14.25 17h-4.421a4.5 4.5 0 1 1-3.579-7.938v-3.312a2.75 2.75 0 0 1 2.75-2.75h3a.75.75 0 0 1 .53.22l4.25 4.25c.141.14.22.331.22.53v6.25a2.75 2.75 0 0 1-2.75 2.75Zm-6.5-11.25c0-.69.56-1.25 1.25-1.25h2.25v2.5c0 .966.784 1.75 1.75 1.75h2.5v5.5c0 .69-.56 1.25-1.25 1.25h-3.218a4.501 4.501 0 0 0-3.282-6.438v-3.312Zm6.69 1.5-1.69-1.69v1.44c0 .138.112.25.25.25h1.44Zm-7.44 9.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                            </svg>
                        </span>
                    </div>
                `;
            },
            onCellClicked: (p) => p.data.position > 1 ? null : showChangesModal(p.data),
            tooltipValueGetter: (p) => ' View on Product\'s Change History. ',
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
            field: "product_name",
            headerName: "Product Name",
            width: 200,
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
                if (e.data.prev.handle !== e.newValue && ([ ...new Set(rows) ].includes(e.newValue) || await checkIsHandleDuplicate(e.newValue))) {
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
                return `
                    <div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'>
                        <div class="Polaris-Thumbnail Polaris-Thumbnail--sizeSmall">
                            ${!!p.value ? `
                                <img alt="${p.data.product_name}" src="${p.value}">
                            ` : `
                                <span class="Polaris-Icon">
                                    <span class="Polaris-Text--root Polaris-Text--visuallyHidden">None Image</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                                        <path fill-rule="evenodd" d="M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z"/>
                                    </svg>
                                </span>
                            `}
                        </div>
                    </div>
                `;
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
            cellStyle: (p) => [ true, 'true' ].includes(p.value) ? { color: 'green' } : { color: '#666666' },
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
            cellStyle: (p) => [ true, 'true' ].includes(p.value) ? { color: 'green' } : { color: '#666666' },
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
    try {
        const { exists } = await fetchData({ method: 'GET', url: '/api/products/check-handle?handle=' + newHandle });
        return exists; // true: duplicate, false: not duplicate
    } catch (e) {
        return null;
    }
}
