<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="shopify-api-key" content="f3c1562fe21c816e2db8aa49558f9b58"/>
    <script src="//cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    @viteReactRefresh
    @vite(['resources/css/app.css'])
    <title>상품관리 :: 고로켓</title>
    <link href="//fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

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
    <script src="/assets/grid/init.js?v=2025021017"></script>
    <script src="/assets/grid/grid_custom_editor.js?v=2025021017"></script>
    <script src="/assets/grid/grid.js?v=2025021017"></script>
    <!-- //AG-GRID -->
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

<div class="footer">
    <p>Email <a href="mailto:support@gorocket3.ai">support@gorocket3.ai</a> for help.</p>
    <p>&copy; 2025 GoRocket. By using this app, you agree to the <a href="#">Privacy Policy</a>.</p>
</div>

<script language="javascript">
    const pApp = new App('', { gridId: "#div-gd", height: 100 });
    const gridDiv = document.querySelector(pApp.options.gridId);
    let gx;

    const default_columns = [
        { field: "product_id", headerName: "상품아이디", width: 120 },
        { field: "title", headerName: "상품명", width: 200 },
        {
            field: "image_src", headerName: "이미지",
            cellClass: 'hd-grid-code',
            cellRenderer: function (params) {
                if (params.value !== undefined && params.value !== "" && params.value !== null) {
                    let img = params.data.image_src;
                    return '<div><img src="' + img + '" class="img" alt="" style="width:50px;height:50px;" /></div>';
                }
            }
        },
    ];

    document.addEventListener('DOMContentLoaded', async function () {
        pApp.ResizeGrid(195);
        pApp.BindSearchEnter();
        const options = {
            multiTab: true,
        };
        // const my_columns = await getMyColumns(() => gx, gridDiv, default_columns);
        gx = new HDGrid(gridDiv, default_columns, options);

        gx.Request('/api/products?title=snow', null, 1, function (data) {
            console.log(data);
            gx.gridOptions.api.setRowData(data.data.map((item, index) => {
                return {
                    product_id: item.product_id,
                    title: item.title,
                    image_src: item.images[0]?.src || '',
                };
            }));
        });
    });
</script>
</body>
</html>
