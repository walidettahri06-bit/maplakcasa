<?php

use App\Http\Controllers\Api\V1\Admin\AuthController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\DeliveryController as AdminDeliveryController;
use App\Http\Controllers\Api\V1\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\V1\GeocodingSuggestionController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\OrderTrackingController;
use App\Http\Controllers\Api\V1\PublicSettingsController;
use App\Http\Controllers\Api\V1\ServiceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/settings', PublicSettingsController::class);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);
    Route::get('/geocoding/suggestions', GeocodingSuggestionController::class)->middleware('throttle:30,1');
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:5,1');
    Route::post('/orders/track', OrderTrackingController::class)->middleware('throttle:10,1');

    Route::prefix('admin')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

        Route::middleware(['auth:sanctum', 'admin'])->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::get('/dashboard', DashboardController::class);

            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
            Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
            Route::patch('/orders/{order}/note', [AdminOrderController::class, 'updateNote']);
            Route::get('/orders/{order}/history', [AdminOrderController::class, 'history']);
            Route::get('/orders/{order}/documents', [AdminDocumentController::class, 'index']);
            Route::get('/documents/{document}/content', [AdminDocumentController::class, 'content'])->name('admin.documents.content');
            Route::patch('/documents/{document}', [AdminDocumentController::class, 'update']);

            Route::get('/services', [AdminServiceController::class, 'index']);
            Route::post('/services', [AdminServiceController::class, 'store']);
            Route::get('/services/{service}', [AdminServiceController::class, 'show']);
            Route::match(['put', 'patch'], '/services/{service}', [AdminServiceController::class, 'update']);
            Route::delete('/services/{service}', [AdminServiceController::class, 'destroy']);

            Route::get('/payments', [AdminPaymentController::class, 'index']);
            Route::patch('/payments/{payment}', [AdminPaymentController::class, 'update']);
            Route::get('/deliveries', [AdminDeliveryController::class, 'index']);
            Route::patch('/deliveries/{delivery}', [AdminDeliveryController::class, 'update']);
        });
    });
});
