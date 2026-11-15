<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
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
            'city' => $this->city,
            'neighborhood' => $this->neighborhood,
            'address' => $this->address,
            'instructions' => $this->instructions,
            'latitude' => $this->latitude === null ? null : (float) $this->latitude,
            'longitude' => $this->longitude === null ? null : (float) $this->longitude,
            'status' => $this->status->value,
            'scheduledAt' => $this->scheduled_at?->toISOString(),
            'driver' => $this->driver_name,
        ];
    }
}
