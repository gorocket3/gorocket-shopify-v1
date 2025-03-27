<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Plan-Based Request Limits
    |--------------------------------------------------------------------------
    |
    | Defines the maximum number of daily requests allowed per plan.
    | These values are pulled from environment variables, with fallback defaults.
    |
    */

    'edit_limits' => [
        'Free'  => env('PLAN_EDIT_LIMIT_FREE', 100),
        'Basic' => env('PLAN_EDIT_LIMIT_BASIC', 10000),
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan-Based History Retention Days
    |--------------------------------------------------------------------------
    |
    | Determines how many days of change log history are visible to the user,
    | depending on the plan they are subscribed to.
    | These values are also configurable via environment variables.
    |
    */

    'history_days' => [
        'Free'  => env('PLAN_HISTORY_LIMIT_FREE', 7),
        'Basic' => env('PLAN_HISTORY_LIMIT_BASIC', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan-Based Max Selected Rows
    |--------------------------------------------------------------------------
    |
    | Maximum number of product rows that can be selected at once
    | in bulk actions, based on the plan. Adjust via .env if needed.
    |
    */

    'max_selected_rows' => [
        'Free'  => env('PLAN_SELECTED_LIMIT_FREE', 10000),
        'Basic' => env('PLAN_SELECTED_LIMIT_BASIC', 100000),
    ],
];
