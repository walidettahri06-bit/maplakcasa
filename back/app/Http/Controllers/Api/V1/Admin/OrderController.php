<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminOrderIndexRequest;
use App\Http\Requests\UpdateOrderNoteRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderStatusHistoryResource;
use App\Models\Order;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(AdminOrderIndexRequest $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Order::class);

        $filters = $request->validated();
        $orders = Order::query()
            ->with(['items', 'documents', 'payments', 'delivery'])
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->when(isset($filters['search']), function ($query) use ($filters): void {
                $search = '%'.$filters['search'].'%';
                $query->where(fn ($nested) => $nested
                    ->where('reference', 'like', $search)
                    ->orWhere('customer_name', 'like', $search)
                    ->orWhere('customer_phone', 'like', $search));
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 20);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return OrderResource::make($order->load(['items', 'documents', 'payments', 'delivery']));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);
        $validated = $request->validated();
        $newStatus = OrderStatus::from($validated['status']);

        DB::transaction(function () use ($request, $order, $newStatus, $validated): void {
            $order->refresh();
            $oldStatus = $order->status;

            if ($oldStatus === $newStatus) {
                return;
            }

            $order->status = $newStatus;
            $order->save();
            $order->statusHistory()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $request->user()->id,
                'comment' => $validated['comment'] ?? null,
            ]);

            if ($newStatus === OrderStatus::OutForDelivery) {
                $order->delivery()->update(['status' => DeliveryStatus::InTransit->value]);
            } elseif ($newStatus === OrderStatus::Completed) {
                $order->delivery()->update(['status' => DeliveryStatus::Delivered->value]);
            }
        });

        return OrderResource::make($order->fresh()->load(['items', 'documents', 'payments', 'delivery']));
    }

    public function updateNote(UpdateOrderNoteRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);
        $order->forceFill(['internal_note' => $request->validated('note')])->save();

        return OrderResource::make($order->refresh()->load(['items', 'documents', 'payments', 'delivery']));
    }

    public function history(Order $order): AnonymousResourceCollection
    {
        $this->authorize('view', $order);

        return OrderStatusHistoryResource::collection(
            $order->statusHistory()->with('actor')->latest()->get(),
        );
    }
}
