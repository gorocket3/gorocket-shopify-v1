<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="shopify-api-key" content="f3c1562fe21c816e2db8aa49558f9b58" />
    <script src="//cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
    <title>고로켓</title>
    <link href="//fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
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

    <div class="hero">
        <h2>나만의 Shopify 앱을 만들어보세요!</h2>
        <p>상품을 관리하고, 판매를 늘릴 수 있는 기능을 제공합니다.</p>
        <a href="#" class="btn">시작하기</a> <button id="start-button" class="btn">상품 업데이트</button>
    </div>
</div>

<div id="app"></div>

<div class="footer">
    <p>Email <a href="mailto:support@gorocket3.ai">support@gorocket3.ai</a> for help.</p>
    <p>&copy; 2025 GoRocket. By using this app, you agree to the <a href="#">Privacy Policy</a>.</p>
</div>

<script>
    document.getElementById('start-button').addEventListener('click', function () {
        updateProducts();
    });

    function updateProducts() {
        const apiUrl = '/api/products/edit';

        const requestData = {
            "products": [
                { "id": 96, "title": "333" },
                { "id": 97, "title": "444" }
            ]
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert('상품이 성공적으로 업데이트되었습니다!');
        })
        .catch(error => {
            alert('상품 업데이트 중 오류가 발생했습니다.');
        });
    }
</script>

</body>
</html>
