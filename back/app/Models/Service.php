<?php

namespace App\Models;

use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name_fr', 'name_ar', 'description_fr', 'description_ar', 'price', 'currency', 'lead_time_hours', 'image_path', 'is_active'])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'lead_time_hours' => 'integer', 'is_active' => 'boolean'];
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
