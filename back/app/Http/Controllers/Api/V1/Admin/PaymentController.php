<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePaymentStatusRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Payment::class);

        return PaymentResource::collection(
            Payment::query()->with(['order', 'statusHistory.actor'])->latest()->paginate(50),
        );
    }

    public function update(UpdatePaymentStatusRequest $request, Payment $payment): PaymentResource
    {
        $this->authorize('update', $payment);
        $status = PaymentStatus::from($request->validated('status'));

        DB::transaction(function () use ($request, $payment, $status): void {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            $previousStatus = $payment->status;

            if ($previousStatus === $status) {
                return;
            }

            $payment->forceFill([
                'status' => $status,
                'paid_at' => $status === PaymentStatus::Paid ? ($payment->paid_at ?? now()) : $payment->paid_at,
            ])->save();
            $payment->statusHistory()->create([
                'old_status' => $previousStatus,
                'new_status' => $status,
                'changed_by' => $request->user()->id,
                'comment' => 'Payment status updated by administrator.',
            ]);
        });

        return PaymentResource::make($payment->refresh()->load(['order', 'statusHistory.actor']));
    }
}
