<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeocodingSuggestionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'label' => $this['label'],
            'lat' => (float) $this['lat'],
            'lng' => (float) $this['lng'],
        ];
    }
}
