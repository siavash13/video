<?php

return [
    'path' => 'rooms',
    'prefix' => 'videoconference',
    'app_url' => env('MIX_WEBRTC_SOCKET_CONNECTION', 'http://localhost:5000'),
    'app_id' => env('VIDEOCONFERENCE_APP_ID', '1'),
    'app_secret' => env('VIDEOCONFERENCE_APP_SECRET', 'top-secret'),

    // user username field name
    'user' => [
        'username_field' => 'email'
    ],

    'routes' => [
        'web' => [
            'middleware' => [],
        ],
        'api' => [
            'middleware' => ['auth:sanctum'],
        ],
    ]
];
