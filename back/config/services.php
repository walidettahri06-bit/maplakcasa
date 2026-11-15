<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'maplak_geocoder' => [
        // Public Nominatim is enabled outside production for low-volume development only.
        'search_url' => env('MAPLAK_GEOCODER_SEARCH_URL', in_array(env('APP_ENV'), ['local', 'testing'], true) ? 'https://nominatim.openstreetmap.org/search' : null),
        'user_agent' => env('MAPLAK_GEOCODER_USER_AGENT', 'MaPlak Casa (contact@maplak.ma)'),
        'cache_minutes' => (int) env('MAPLAK_GEOCODER_CACHE_MINUTES', 1440),
        'minimum_interval_seconds' => (float) env('MAPLAK_GEOCODER_MINIMUM_INTERVAL_SECONDS', 1),
    ],

];
