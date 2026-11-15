<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderStatusHistoryResource extends JsonResource
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
            'oldStatus' => $this->old_status?->value,
            'newStatus' => $this->new_status->value,
            'comment' => $this->comment,
            'actor' => $this->whenLoaded('actor', fn () => $this->actor?->name),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
