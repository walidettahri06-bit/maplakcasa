<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TrackOrderRequest;
use App\Http\Resources\TrackingOrderResource;
use App\Models\OrderTrackingToken;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OrderTrackingController extends Controller
{
    public function __invoke(TrackOrderRequest $request): JsonResource
    {
        $trackingToken = OrderTrackingToken::query()
            ->where('token_hash', hash('sha256', $request->validated('token')))
            ->whereHas('order', fn ($query) => $query->where('reference', $request->validated('reference')))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->with('order.delivery')
            ->first();

        if ($trackingToken === null) {
            throw new NotFoundHttpException('Tracking information was not found.');
        }

        $trackingToken->forceFill(['last_used_at' => now()])->save();

        return TrackingOrderResource::make($trackingToken->order);
    }
}
