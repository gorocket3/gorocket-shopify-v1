<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- Shopify -->
    <meta name="shopify-api-key" content="f3c1562fe21c816e2db8aa49558f9b58"/>
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

    <!-- Css -->
    <link href="//fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <!-- // Css -->

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

<style>
    .ag-row-level-1 {background-color: #fff7e6 !important;}
</style>

<script language="JavaScript">
    const pApp = new App('', { gridId: "#div-gd", height: 100 });
    let gx;

    const PRODUCT_STATUS = {
        active: { title: '활성', color: '#b4ffa2' },
        draft: { title: '초안', color: '#bdd1ff' },
        archived: { title: '보관', color: '#cccccc' }
    };

    const default_columns = [
        { field: "group_id", headerName: "상품 ID", rowGroup: true, hide: true },
        { headerName: '상품 ID', showRowGroup: 'group_id', cellRenderer: 'agGroupCellRenderer', width: 180 },
        {
            field: "product_status",
            headerName: "상태",
            width: 80,
            aggFunc: 'first',
            cellClass: 'hd-grid-code',
            cellRenderer: (p) => p.node.level > 0 ? '' : PRODUCT_STATUS[p.value]?.title || '',
            cellStyle: (p) => p.node.level > 0 ? {} : { backgroundColor: PRODUCT_STATUS[p.value]?.color || '#f2f2f2' }
        },
        {
            field: "product_img", headerName: "대표이미지", width: 80, aggFunc: 'first',
            cellRenderer: (p) => {
                if (p.node.level > 0 || !p.value) return '';
                return `<div style='display:flex;justify-content:center;align-items:center;padding:5px 0;'><img src='${p.value}' style='width:100%;' /></div>`;
            }
        },
        {
            field: "product_name",
            headerName: "상품명",
            width: 120,
            editable: true,
            aggFunc: 'first',
            cellRenderer: (p) => p.node.level > 0 ? '' : p.value,
        },
        {
            field: "product_body",
            headerName: "상품 설명",
            width: 200,
            editable: true,
            aggFunc: 'first',
            cellRenderer: (p) => p.node.level > 0 ? '' : p.value,
            cellStyle: { 'white-space': 'normal' }
        },
        {
            field: "option_img", headerName: "이미지",
            cellRenderer: (p) => {
                if (!p.value) return '';
                return `<div style='display:flex;justify-content:center;align-items:center;padding:5px 0;'><img src='${p.value}' alt='${p.data?.product_name}' style='width:100%;' /></div>`;
            }
        },
        { field: "option_name", headerName: "옵션명", width: 120 },
    ];

    document.addEventListener('DOMContentLoaded', async function () {
        pApp.ResizeGrid(275);
        pApp.BindSearchEnter();

        const gridDiv = document.querySelector(pApp.options.gridId);
        // const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);

        gx = new HDGrid(gridDiv, default_columns, {
            rollup: true,
            groupDefaultExpanded: 1, // open: 1, close: 0
            groupSuppressAutoColumn: true,
            suppressAggFuncInHeader: true,
            enableRangeSelection: true,
            animateRows: true,
        });

        gx.Request('/api/products', null, 1, function (v) {
            const data = v.data.reduce((a, c) => {
                return a.concat(c.variants.map((item, index) => {
                    const { variants, ...parent } = c;
                    return {
                        ...item,
                        parent: {
                            ...parent,
                            images: parent.images?.sort((x, y) => x.position - y.position) || []
                        }
                    };
                }).sort((x, y) => x.position - y.position));
            }, []);

            gx.gridOptions.api.setRowData(data.map((item, index) => {
                return {
                    ...item,
                    group_id: item.parent.product_id,
                    product_name: item.parent.title,
                    product_body: item.parent.body_html,
                    product_img: item.parent.images[0]?.src || '',
                    product_status: item.parent.status,
                    option_name: item.title,
                    option_img: item.image?.src || '',
                };
            }));
        });
    });
</script>
</body>
</html>
