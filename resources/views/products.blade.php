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
    @vite(['resources/js/products/app.jsx', 'resources/css/mobile.css'])
    <!-- // Vite -->

    <!-- CDN -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
            integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js" defer></script>
    <script src="//js.pusher.com/8.2.0/pusher.min.js"></script>
    <!-- //CDN -->

    <!-- AG-GRID -->
    <script src="/assets/grid/ag-grid/dist/ag-grid-enterprise.min.js"></script>
    {{--    <script src="/assets/grid/license.js"></script>--}}
    <script>
        agGrid.LicenseManager.setLicenseKey("{{ config('services.grid.license') }}");
    </script>
    <script src="/assets/grid/function.js?v=2025032511"></script>
    <script src="/assets/grid/init.js?v=2025032511"></script>
    <script src="/assets/grid/grid_field_editor.js?v=2025032511"></script>
    {{--    <script src="/assets/grid/grid_custom_editor.js?v=2025021017"></script>--}}
    <script src="/assets/grid/grid.js?v=2025032511"></script>
    <link rel="stylesheet" href="/assets/grid/grid.css?v=2025032511">
    <!-- // AG-GRID -->

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

    <title>Products :: GoRocket</title>
</head>
<body>
<div id="app" class="main-scroll-container" data-initial="{{ json_encode($data) }}"></div>
</body>
</html>
