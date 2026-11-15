<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Delivery::class);

        return DeliveryResource::collection(
            Delivery::query()->with('order')->latest()->paginate(50),
        );
    }

    public function update(UpdateDeliveryRequest $request, Delivery $delivery): DeliveryResource
    {
        $this->authorize('update', $delivery);
        $validated = $request->validated();

        DB::transaction(function () use ($request, $delivery, $validated): void {
            $delivery->update($validated);
            $newOrderStatus = match ($validated['status'] ?? null) {
                DeliveryStatus::InTransit->value => OrderStatus::OutForDelivery,
                DeliveryStatus::Delivered->value => OrderStatus::Completed,
                default => null,
            };

            if ($newOrderStatus === null) {
                return;
            }

            $order = $delivery->order()->lockForUpdate()->firstOrFail();
            if ($order->status === $newOrderStatus) {
                return;
            }

            $oldStatus = $order->status;
            $order->status = $newOrderStatus;
            $order->save();
            $order->statusHistory()->create([
                'old_status' => $oldStatus,
                'new_status' => $newOrderStatus,
                'changed_by' => $request->user()->id,
                'comment' => 'Delivery status updated.',
            ]);
        });

        return DeliveryResource::make($delivery->fresh()->load('order'));
    }
}
