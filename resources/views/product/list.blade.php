<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- Shopify -->
    <meta name="shopify-api-key" content="{{ env('SHOPIFY_API_KEY') }}"/>
    <script src="//cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    <!-- // Shopify -->

    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css?v=2025021918'])
    <!-- // Vite -->

    <!-- CDN -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
            integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <!-- //CDN -->

    <!-- AG-GRID -->
    <script src="/assets/grid/ag-grid/dist/ag-grid-enterprise.min.js"></script>
    <script src="/assets/grid/license.js"></script>
    <script src="/assets/grid/function.js?v=2025021017"></script>
    <script src="/assets/grid/init.js?v=2025021017"></script>
    <script src="/assets/grid/grid_field_editor.js?v=2025021017"></script>
    {{--    <script src="/assets/grid/grid_custom_editor.js?v=2025021017"></script>--}}
    <script src="/assets/grid/grid.js?v=2025021017"></script>
    <link rel="stylesheet" href="/assets/grid/grid.css?v=2025021017">
    <!-- // AG-GRID -->

    <!-- Font -->
    <link href="//fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <!-- // Font -->

    <title>상품관리 :: 고로켓</title>
</head>
<body>
<div class="container">
    <div class="Polaris-Page">
        <div class="Polaris-Box"
             style="--pc-box-padding-block-start-xs:var(--p-space-300);--pc-box-padding-block-start-md:var(--p-space-300);--pc-box-padding-block-end-xs:var(--p-space-300);--pc-box-padding-block-end-md:var(--p-space-300);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-start-sm:var(--p-space-0);--pc-box-padding-inline-end-xs:var(--p-space-400);--pc-box-padding-inline-end-sm:var(--p-space-0);position:relative">
            <div class="Polaris-Page-Header--mediumTitle">
                <div class="Polaris-Page-Header__Row">
                    <div class="Polaris-Page-Header__TitleWrapper Polaris-Page-Header__TitleWrapperExpand">
                        <div class="Polaris-Header-Title__TitleWrapper">
                            <h1 class="Polaris-Header-Title">
                            <span
                                class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Producs</span>
                            </h1>
                        </div>
                    </div>
                    <div class="Polaris-Page-Header__RightAlign">
                        <div class="Polaris-Page-Header__PrimaryActionWrapper">
                            <div style="display: flex;align-items: center;gap: 12px;">
                                <ui-nav-menu>
                                    <a href="/products">상품</a>
                                    <a href="/billing/2">결제</a>
                                    <a href="/settings">설정</a>
                                    <a href="/help">도움</a>
                                </ui-nav-menu>
                                <button
                                    id="search_product"
                                    class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--iconWithText"
                                    type="button">
                                    <span class="Polaris-Button__Icon">
                                        <span class="Polaris-Icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
                                                <path fill-rule="evenodd"
                                                      d="M12.323 13.383a5.5 5.5 0 1 1 1.06-1.06l2.897 2.897a.75.75 0 1 1-1.06 1.06l-2.897-2.897Zm.677-4.383a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
                                            </svg>
                                        </span>
                                    </span>
                                    <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Search</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="Polaris-LegacyCard">
                <div class="Polaris-LegacyCard__Header Polaris-LegacyCard__FirstSectionPadding"></div>
                <div class="Polaris-LegacyCard__Section Polaris-LegacyCard__LastSectionPadding">
                    <div style="width:100%;height:auto">
                        <div class="Polaris-InlineGrid"
                             style="--pc-inline-grid-grid-template-columns-xs:repeat(3, minmax(0, 1fr));--pc-inline-grid-gap-xs:var(--p-space-400)">
                            <!-- Search: Product Type -->
                            <div class="">
                                <div class="Polaris-Labelled__LabelWrapper">
                                    <div class="Polaris-Label">
                                        <label id=":Rq6:Label" for=":Rq6:" class="Polaris-Label__Text">
                                            <span class="Polaris-Text--root Polaris-Text--bodyMd">Type</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="Polaris-Select">
                                    <select id="product_type" class="Polaris-Select__Input" aria-invalid="false">
                                        <option value="value" selected="">Value</option>
                                    </select>
                                    <div class="Polaris-Select__Content" aria-hidden="true">
                                        <span class="Polaris-Select__SelectedOption">Value</span>
                                        <span class="Polaris-Select__Icon">
                                            <span class="Polaris-Icon">
                                                <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false"
                                                     aria-hidden="true">
                                                    <path
                                                        d="M10.884 4.323a1.25 1.25 0 0 0-1.768 0l-2.646 2.647a.75.75 0 0 0 1.06 1.06l2.47-2.47 2.47 2.47a.75.75 0 1 0 1.06-1.06l-2.646-2.647Z">
                                                    </path>
                                                    <path
                                                        d="m13.53 13.03-2.646 2.647a1.25 1.25 0 0 1-1.768 0l-2.646-2.647a.75.75 0 0 1 1.06-1.06l2.47 2.47 2.47-2.47a.75.75 0 0 1 1.06 1.06Z">
                                                    </path>
                                                </svg>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="Polaris-Select__Backdrop"></div>
                                </div>
                            </div>
                            <div style="display:inherit;width:auto"></div>
                            <div style="display:inherit;width:auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-2">
            <div class="Polaris-LegacyCard">
                <div class="Polaris-LegacyCard__Header Polaris-LegacyCard__FirstSectionPadding">
                    <div class="Polaris-InlineGrid"
                         style="--pc-inline-grid-grid-template-columns-xs:1fr auto;--pc-inline-grid-align-items:center;">
                        <h2 class="Polaris-Text--root Polaris-Text--subdued">
                            Showing <strong id="gd-current" class="Polaris-Text--success">0</strong> of <strong id="gd-total" class="Polaris-Text--base">0</strong> <strong class="Polaris-Text--base">Products</strong>
                        </h2>
                        <div style="display: flex;align-items: center;gap: 5px;">
{{--                            <button type="button"--}}
{{--                                    id="refresh_product"--}}
{{--                                    style="padding: 0 7px;"--}}
{{--                                    class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--iconOnly">--}}
{{--                                <span class="Polaris-Button__Icon">--}}
{{--                                    <span class="Polaris-Icon">--}}
{{--                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">--}}
{{--                                            <path--}}
{{--                                                d="M3.5 9.25a.75.75 0 0 0 1.5 0 3 3 0 0 1 3-3h6.566l-1.123 1.248a.75.75 0 1 0 1.114 1.004l2.25-2.5a.75.75 0 0 0-.027-1.032l-2.25-2.25a.75.75 0 1 0-1.06 1.06l.97.97h-6.44a4.5 4.5 0 0 0-4.5 4.5Z"/>--}}
{{--                                            <path--}}
{{--                                                d="M16.5 10.75a.75.75 0 0 0-1.5 0 3 3 0 0 1-3 3h-6.566l1.123-1.248a.75.75 0 1 0-1.114-1.004l-2.25 2.5a.75.75 0 0 0 .027 1.032l2.25 2.25a.75.75 0 0 0 1.06-1.06l-.97-.97h6.44a4.5 4.5 0 0 0 4.5-4.5Z"/>--}}
{{--                                        </svg>--}}
{{--                                    </span>--}}
{{--                                </span>--}}
{{--                            </button>--}}
                            <button type="button"
                                    id="save_product"
                                    class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
                                <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Save</span>
                            </button>
                            <button type="button"
                                    id="remove_product"
                                    class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--toneCritical">
                                <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="Polaris-LegacyCard__Section Polaris-LegacyCard__LastSectionPadding">
                    <!-- 상품 그리드 -->
                    <div class="table-responsive">
                        <div id="div-gd" class="ag-theme-balham"></div>
                    </div>
                    <!-- //상품 그리드 -->
                </div>
            </div>
        </div>

        <div id="app"></div>
    </div>
</div>

<div class="footer">
    <p>Email <a href="mailto:support@gorocket3.ai">support@gorocket3.ai</a> for help.</p>
    <p>&copy; 2025 GoRocket. By using this app, you agree to the <a href="#">Privacy Policy</a>.</p>
</div>

<script language="JavaScript">
    const pApp = new App('', { gridId: "#div-gd" });
    let gx;

    const product_status_array = <?= json_encode(@$status) ?>;
    const product_tags_array = <?= json_encode(@$tags) ?>;

    const product_status_values = {
        active: [ 'Active', 'Polaris-Badge--toneSuccess', '활성' ],
        draft: [ 'Draft', 'Polaris-Badge--toneInfo', '초안' ],
        archived: [ 'Archived', 'Polaris-Badge--toneDefault', '보관' ]
    };

    const PRODUCT_STATUS = product_status_array.reduce((acc, key) => {
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

        gx.gridOptions.api.forEachNode((node) => {
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

    const default_columns = [
        { field: "product_status_changed", hide: true },
        { field: "product_name_changed", hide: true },
        { field: "product_tags_changed", hide: true },
        { field: "product_body_changed", hide: true },
        { field: "option_name_changed", hide: true },
        { field: "price_changed", hide: true },
        { field: "inventory_quantity_changed", hide: true },
        {
            field: "chk",
            headerName: '',
            cellClass: 'hd-grid-code',
            checkboxSelection: (p) => p.data.position < 2,
            headerCheckboxSelection: true,
            width: 24,
            sort: null,
            cellStyle: cellMergeStyling
        },
        {
            field: "group_id", headerName: "Product ID", width: 110, cellClass: 'hd-grid-code',
            // rowSpan: (p) => {
            //     if (p.data?.position === 1) {
            //         return p.data?.parent?.variants_cnt || 1;
            //     }
            //     return 1;
            // },
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            cellStyle: cellMergeStyling
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
            onCellValueChanged: (e) => changeCellState('product_status', e)
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
            onCellValueChanged: (e) => changeCellState('product_name', e)
        },
        {
            field: "product_tags", headerName: "Tags", width: 200,
            cellRenderer: (p) => p.data.position > 1 ? '' : `
                <div class="flex flex-wrap align-items-center gap-1 py-1">
                    ${p.value === '' ? '' : p.value.split(', ').map((tag) => `<span class="grid-badge Polaris-Badge--toneInfo" style="display:inline-block;line-height:normal;">${tag || ''}</span>`).join('')}
                </div>
            `,
            cellStyle: cellMergeStyling,
            editable: (p) => p.data.position < 2,
            cellEditor: GridFieldMultipleEditor,
            cellEditorParams: {
                cellEditor: GridFieldMultipleEditor,
                values: product_tags_array.map((tag) => ({ id: tag, label: tag })),
                width: "120px",
            },
            cellEditorPopup: true,
            cellClassRules: changedCellClassRules('product_tags'),
            onCellValueChanged: (e) => changeCellState('product_tags', e)
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
            field: "option_img", headerName: "Image", width: 60,
            cellRenderer: (p) => {
                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style=width:30px;height:30px;' /></div>`;
                }
                return '';
            },
        },
        {
            field: "option_name", headerName: "Option Name", width: 120, editable: true,
            cellClassRules: changedCellClassRules('option_name'),
            onCellValueChanged: (e) => changeCellState('option_name', e)
        },
        {
            field: "price", headerName: "Price($)", width: 90, cellClass: 'hd-grid-number', editable: true,
            cellRenderer: (p) => '$ ' + numberWithCommas(p.value),
            cellClassRules: changedCellClassRules('price'),
            onCellValueChanged: (e) => changeCellState('price', e)
        },
        {
            field: "inventory_quantity", headerName: "Quantity", width: 70, cellClass: 'hd-grid-number', editable: true,
            cellRenderer: (p) => numberWithCommas(p.value),
            cellClassRules: changedCellClassRules('inventory_quantity'),
            onCellValueChanged: (e) => changeCellState('inventory_quantity', e)
        },
        { width: 0 }
    ];

    document.addEventListener('DOMContentLoaded', async function () {
        pApp.ResizeGrid(375);
        pApp.BindSearchEnter();

        const gridDiv = document.querySelector(pApp.options.gridId);
        // const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

        gx = new HDGrid(gridDiv, default_columns, {
            enableCellSpan: true,
            suppressRowTransform: true,
            rowClassRules: {
                "even": "data.parent_index % 2 !== 0",
            },
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

        // Search Products
        function searchProducts() {
            gx.Request('/api/products', 'per_page=20', 1, function (v) {
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
                        group_id: item.position !== 1 ? '' : item.parent.product_id,
                        product_name: item.position !== 1 ? '' : item.parent.title,
                        product_tags: item.position !== 1 ? '' : item.parent.tags,
                        product_body: item.position !== 1 ? '' : item.parent.body_html,
                        product_img: item.position !== 1 ? '' : (item.parent.images[0]?.src || ''),
                        product_status: item.position !== 1 ? '' : item.parent.status,
                        option_name: item.title,
                        option_img: item.image?.src || '',
                    };
                });

                if (v.current_page === 1) {
                    gx.gridOptions.api.setRowData(result);
                } else {
                    gx.gridOptions.api.applyTransaction({ add: result });
                }
            });
        }

        searchProducts();

        // Save Edited Products
        document.getElementById("save_product").addEventListener('click', function (e) {
            const rows = [];
            gx.gridOptions.api.getSelectedRows().forEach((data) => {
                if (data.product_name_changed) {
                    const row = { id: data.product_id };
                    row.title = data.product_name;
                    rows.push(row);
                }
            });

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
                    alert('The product changes have been saved.');
                })
                .catch(error => {
                    console.error(error.message);
                    alert('An error occurred while updating the product.');
                });
        });

        // Remove Products
        document.getElementById("remove_product").addEventListener('click', function (e) {
            let rows = gx.gridOptions.api.getSelectedRows();
            if (rows.length < 1) {
                alert('Please select the product(s) to delete.');
                return;
            }

            rows = rows.map(row => row.parent.product_id);
            rows = [ ...new Set(rows) ];

            const params = rows.map(row => 'product_ids[]=' + row).join('&');
            fetch(`/api/products/delete?${params}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert('The selected product(s) have been deleted.');
                })
                .catch(error => {
                    console.error(error.message);
                    alert('An error occurred while deleting the product.');
                });
        });

        // Search Products
        document.getElementById("search_product").addEventListener('click', function (e) {
            searchProducts();
        });
    });
</script>
</body>
</html>
