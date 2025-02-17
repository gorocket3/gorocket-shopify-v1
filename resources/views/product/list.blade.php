<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- Shopify -->
    <meta name="shopify-api-key" content="{{ env('SHOPIFY_API_KEY') }}"/>
    <script src="//cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    <!-- // Shopify -->

    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
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
    <script>
        agGrid.LicenseManager.setLicenseKey("{{env('GRID_LICENSE')}}");
    </script>
    <script src="/assets/grid/function.js?v=2025021017"></script>
    <script src="/assets/grid/init.js?v=2025021017"></script>
    <script src="/assets/grid/grid_auto_complete.js?v=2025021017"></script>
    <script src="/assets/grid/grid_custom_editor.js?v=2025021017"></script>
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
    <div class="navbar">
        <h1>그리드 에디터</h1>
        <ui-nav-menu>
            <a href="/products">상품</a>
            <a href="/billing/2">결제</a>
            <a href="/settings">설정</a>
            <a href="/help">도움</a>
        </ui-nav-menu>
    </div>

    <!-- 상품 그리드 -->
    <div class="table-responsive">
        <div id="div-gd" class="ag-theme-balham"></div>
    </div>
    <!-- //상품 그리드 -->
</div>

<div id="app"></div>

<div class="footer">
    <p>Email <a href="mailto:support@gorocket3.ai">support@gorocket3.ai</a> for help.</p>
    <p>&copy; 2025 GoRocket. By using this app, you agree to the <a href="#">Privacy Policy</a>.</p>
</div>

<script language="JavaScript">
    const pApp = new App('', { gridId: "#div-gd" });
    let gx;

    const PRODUCT_STATUS = {
        active: { title: '활성', color: 'Polaris-Badge--toneSuccess' },
        draft: { title: '초안', color: 'Polaris-Badge--toneInfo' },
        archived: { title: '보관', color: 'Polaris-Badge--toneDefault' }
    };

    const cellMergeStyling = (p) => {
        if (p.data.position !== p.data.parent.variants_cnt) {
            return { borderBottomWidth: '0px' };
        }
        return {};
    };

    const default_columns = [
        {
            field: "group_id", headerName: "상품 ID", width: 120,
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
            headerName: "상태",
            width: 60,
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => p.data.position > 1 ? '' : `<span class="grid-badge ${PRODUCT_STATUS[p.value]?.color || ''} ">${PRODUCT_STATUS[p.value]?.title || ''}</span>`,
            cellStyle: cellMergeStyling,
        },
        {
            field: "product_img", headerName: "이미지", width: 60,
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
            field: "product_name", headerName: "상품명", width: 200,
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            cellStyle: (p) => ({ ...cellMergeStyling(p), whiteSpace: 'normal' }),
            editable: (p) => p.data.position < 2,
        },
        {
            field: "product_body",
            headerName: "상품 설명",
            cellStyle: (p) => ({
                ...cellMergeStyling(p),
                whiteSpace: 'normal'
            }),
            cellRenderer: (p) => p.data.position > 1 ? '' : p.value,
            width: 200,
            editable: (p) => p.data.position < 2,
        },
        {
            field: "option_img", headerName: "이미지", width: 60,
            cellRenderer: (p) => {
                if (!!p.value) {
                    return `<div style='display:flex;justify-content:center;align-items:center;padding:3px 0;'><img src='${p.value}' alt='${p.data.product_name}' style=width:30px;height:30px;' /></div>`;
                }
                return '';
            },
        },
        { field: "option_name", headerName: "옵션명", minWidth: 120, width: 0, editable: true },
    ];

    document.addEventListener('DOMContentLoaded', async function () {
        pApp.ResizeGrid(275);
        pApp.BindSearchEnter();

        const gridDiv = document.querySelector(pApp.options.gridId);
        // const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

        gx = new HDGrid(gridDiv, default_columns, {
            enableCellSpan: true,
            suppressRowTransform: true,
            rowClassRules: {
                "odd": "data.parent_index % 2 === 0",
            },
        });

        gx.Request('/api/products', '', 1, function (v) {
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

            gx.gridOptions.api.setRowData(data.map((item, index) => {
                return {
                    ...item,
                    group_id: item.position !== 1 ? '' : item.parent.product_id,
                    product_name: item.position !== 1 ? '' : item.parent.title,
                    product_body: item.position !== 1 ? '' : item.parent.body_html,
                    product_img: item.position !== 1 ? '' : (item.parent.images[0]?.src || ''),
                    product_status: item.position !== 1 ? '' : item.parent.status,
                    option_name: item.title,
                    option_img: item.image?.src || '',
                };
            }));
        });
    });
</script>
</body>
</html>
