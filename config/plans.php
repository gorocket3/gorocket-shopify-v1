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
        'Basic' => env('PLAN_EDIT_LIMIT_BASIC', 5000),
        'Pro' => env('PLAN_EDIT_LIMIT_PRO', 10000)
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
        'Basic' => env('PLAN_HISTORY_LIMIT_BASIC', 90),
        'Pro' => env('PLAN_HISTORY_LIMIT_PRO', 180)
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
        'Free'  => env('PLAN_SELECTED_LIMIT_FREE', 10),
        'Basic' => env('PLAN_SELECTED_LIMIT_BASIC', 100),
        'Pro' => env('PLAN_SELECTED_LIMIT_PRO', 200)
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan-Based AI Usage Limits
    |--------------------------------------------------------------------------
    |
    | Defines how many times a user can use AI-related features per day,
    | depending on their subscription plan. You can control these limits
    | via environment variables as needed.
    |
    */

    'ai_limits' => [
        'Free'  => env('PLAN_AI_LIMIT_FREE', 5),
        'Basic' => env('PLAN_AI_LIMIT_BASIC', 120),
        'Pro' => env('PLAN_AI_LIMIT_PRO', 250)
    ]
];
