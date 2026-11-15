<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderReference' => $this->whenLoaded('order', fn () => $this->order?->reference),
            'customerName' => $this->whenLoaded('order', fn () => $this->order?->customer_name),
            'customerPhone' => $this->whenLoaded('order', fn () => $this->order?->customer_phone),
            'method' => $this->method->value,
            'status' => $this->status->value,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'providerReference' => $this->provider_reference,
            'paidAt' => $this->paid_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'history' => $this->whenLoaded('statusHistory', fn () => $this->statusHistory->map(fn ($entry): array => [
                'id' => $entry->id,
                'oldStatus' => $entry->old_status?->value,
                'newStatus' => $entry->new_status->value,
                'actor' => $entry->actor?->name,
                'comment' => $entry->comment,
                'createdAt' => $entry->created_at?->toISOString(),
            ])),
        ];
    }
}
