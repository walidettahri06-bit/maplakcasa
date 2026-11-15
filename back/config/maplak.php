<?php

return [
    'contact_phone' => env('MAPLAK_CONTACT_PHONE', '0674486969'),
    'currency' => 'MAD',
    'delivery_fee' => 0,
    'document_disk' => 'documents',
    'document_max_kb' => (int) env('MAPLAK_DOCUMENT_MAX_KB', 5120),
    'tracking_token_days' => (int) env('MAPLAK_TRACKING_TOKEN_DAYS', 14),
    'supported_locales' => ['fr', 'ar'],
    'casablanca_neighborhoods' => [
        'Aïn Chock', 'Aïn Diab', 'Aïn Sebaâ', 'Anfa', 'Belvédère', 'Bourgogne',
        'Californie', 'CIL', 'Derb Sultan', 'Gauthier', 'Hay Hassani', 'Hay Mohammadi',
        'Maârif', 'Mers Sultan', 'Oasis', 'Oulfa', 'Palmier', 'Racine', 'Roches Noires',
        'Sidi Bernoussi', 'Sidi Maârouf', 'Sidi Moumen',
    ],
];
