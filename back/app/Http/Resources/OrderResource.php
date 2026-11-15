<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->role === 'admin';
        $payment = $this->whenLoaded('payments', fn () => $this->payments->first());

        return [
            'id' => $this->reference,
            'reference' => $this->reference,
            'createdAt' => $this->created_at?->toISOString(),
            'status' => $this->status?->value,
            'customer' => $this->when($isAdmin, [
                'fullName' => $this->customer_name,
                'phone' => $this->customer_phone,
                'email' => $this->customer_email,
            ]),
            'plate' => $this->when($isAdmin, [
                'serial' => $this->plate_serial,
                'letter' => $this->plate_letter,
                'region' => $this->plate_region === null ? null : (string) $this->plate_region,
            ]),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item): array => [
                'serviceId' => $item->service_code_snapshot,
                'serviceName' => $item->service_name_snapshot,
                'quantity' => $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'lineTotal' => (float) $item->line_total,
            ])),
            'subtotal' => (float) $this->subtotal,
            'deliveryFee' => (float) $this->delivery_fee,
            'total' => (float) $this->total,
            'internalNote' => $this->when($isAdmin, $this->internal_note),
            'delivery' => $this->whenLoaded('delivery', fn () => [
                'id' => $isAdmin ? $this->delivery?->id : null,
                'status' => $this->delivery?->status?->value,
                'neighborhood' => $isAdmin ? $this->delivery?->neighborhood : null,
                'address' => $isAdmin ? $this->delivery?->address : null,
                'instructions' => $isAdmin ? $this->delivery?->instructions : null,
                'scheduledAt' => $this->delivery?->scheduled_at?->toISOString(),
                'driver' => $isAdmin ? $this->delivery?->driver_name : null,
                'latitude' => $isAdmin && $this->delivery?->latitude !== null ? (float) $this->delivery->latitude : null,
                'longitude' => $isAdmin && $this->delivery?->longitude !== null ? (float) $this->delivery->longitude : null,
            ]),
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($document): array => [
                'id' => $isAdmin ? $document->id : null,
                'type' => $document->type->value,
                'originalName' => $isAdmin ? $document->original_name : null,
                'mimeType' => $isAdmin ? $document->mime_type : null,
                'sizeBytes' => $isAdmin ? $document->size_bytes : null,
                'contentUrl' => $isAdmin ? route('admin.documents.content', ['document' => $document->id]) : null,
                'status' => $document->status->value,
                'reviewNote' => $isAdmin ? $document->review_note : null,
            ])),
            'payment' => $payment ? [
                'id' => $isAdmin ? $payment->id : null,
                'method' => $payment->method->value,
                'status' => $payment->status->value,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'paidAt' => $payment->paid_at?->toISOString(),
                'providerReference' => $isAdmin ? $payment->provider_reference : null,
            ] : null,
        ];
    }
}
