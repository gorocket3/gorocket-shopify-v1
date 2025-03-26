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
    @vite(['resources/js/history/app.jsx', 'resources/css/mobile.css'])
    <!-- // Vite -->

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.gtag.id') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', "{{ config('services.gtag.id') }}", {
            'cookie_flags': 'SameSite=None; Secure',
            'transport_type': 'xhr'
        });
    </script>
    <!-- // Google tag (gtag.js) -->

    <title>History :: GoRocket</title>
</head>
<body>
    <div id="app" class="main-scroll-container"></div>
</body>
</html>
