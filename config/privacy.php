<?php

return [
    'owner' => env('LEGAL_OWNER', 'Nakhle Rizk'),
    'email' => env('LEGAL_EMAIL', 'nakhler2k2@gmail.com'),
    'business' => env('LEGAL_BUSINESS_DETAILS') ?: 'Personal portfolio published by Nakhle Rizk as an individual.',
    'address' => env('LEGAL_PUBLIC_ADDRESS'),
    'host_name' => env('LEGAL_HOST_NAME') ?: 'Nakhle Rizk (self-hosted)',
    'hosting_details' => 'This website is hosted by Nakhle Rizk on his own server using Microsoft Internet Information Services (IIS). Microsoft supplies the server software and is not the hosting provider.',
    'host_address' => env('LEGAL_HOST_ADDRESS'),
    'host_phone' => env('LEGAL_HOST_PHONE'),
    'updated' => '17 September 2026',
];
