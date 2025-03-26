<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- Shopify -->
    <meta name="shopify-api-key" content="{{ config('services.shopify.key') }}"/>
    <script src="//cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    <!-- // Shopify -->

    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/mobile.css'])
    <!-- // Vite -->

    <!-- Font -->
    <link href="//fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <!-- // Font -->

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.gtag.id') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', "{{ config('services.gtag.id') }}");
    </script>
    <!-- // Google tag (gtag.js) -->

    <title>고로켓</title>
</head>
<body>
    <div id="app" class="main-scroll-container" data-initial="{{ json_encode($data) }}"></div>
</body>
</html>
