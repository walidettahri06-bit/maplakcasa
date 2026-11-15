<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSettingsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $phone = (string) (preg_replace('/\D+/', '', (string) config('maplak.contact_phone')) ?? '');
        $internationalPhone = str_starts_with($phone, '0') ? '212'.substr($phone, 1) : $phone;

        return response()->json(['data' => [
            'contactPhone' => $phone,
            'whatsappUrl' => 'https://wa.me/'.$internationalPhone,
            'currency' => config('maplak.currency'),
            'serviceArea' => 'Casablanca',
            'freeDelivery' => true,
            'paymentMethods' => ['cash_on_delivery', 'bank_transfer'],
        ]]);
    }
}
