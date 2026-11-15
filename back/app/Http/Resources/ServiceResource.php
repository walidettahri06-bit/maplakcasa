<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = str_starts_with((string) $request->header('Accept-Language', 'fr'), 'ar') ? 'ar' : 'fr';
        $isAdmin = $request->user()?->role === 'admin';

        return [
            'id' => $this->code,
            'code' => $this->code,
            'name' => $locale === 'ar' ? $this->name_ar : $this->name_fr,
            'description' => $locale === 'ar' ? $this->description_ar : $this->description_fr,
            'nameFr' => $this->when($isAdmin, $this->name_fr),
            'nameAr' => $this->when($isAdmin, $this->name_ar),
            'descriptionFr' => $this->when($isAdmin, $this->description_fr),
            'descriptionAr' => $this->when($isAdmin, $this->description_ar),
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'active' => (bool) $this->is_active,
            'leadTimeHours' => (int) $this->lead_time_hours,
            'imageUrl' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        ];
    }
}
