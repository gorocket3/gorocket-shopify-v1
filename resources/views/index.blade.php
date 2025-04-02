<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=chrome">

    <!-- Shopify -->
    <meta name="shopify-api-key" content="{{ config('services.shopify.key') }}"/>
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    <!-- // Shopify -->

    <!-- CDN -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
            integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
    <!-- // CDN -->

    <!-- AG-GRID -->
    <script src="/assets/grid/ag-grid/dist/ag-grid-enterprise.min.js"></script>
    <script>
        agGrid.LicenseManager.setLicenseKey("{{ config('services.grid.license') }}");
    </script>
    <script src="/assets/grid/function.js?v=2025033115"></script>
    <script src="/assets/grid/init.js?v=2025033115"></script>
    <script src="/assets/grid/grid_field_editor.js?v=2025033115"></script>
    <script src="/assets/grid/grid.js?v=2025040213"></script>
    <link rel="stylesheet" href="/assets/grid/grid.css?v=2025040213">
    <!-- // AG-GRID -->

    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.js'])
    <!-- // Vite -->

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.gtag.id') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', "{{ config('services.gtag.id') }}", {
            'cookie_flags': 'SameSite=None; Secure',
            'transport_type': 'xhr'
        });
    </script>
    <!-- // Google tag (gtag.js) -->

    <title>Gorocket Excel Product Edit</title>
</head>
<body>
    <div id="app" class="main-scroll-container"></div>
</body>
</html>
