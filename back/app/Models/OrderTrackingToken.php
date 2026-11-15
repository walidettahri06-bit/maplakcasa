<?php

namespace App\Models;

use Database\Factories\OrderTrackingTokenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'token_hash', 'expires_at', 'revoked_at', 'last_used_at'])]
class OrderTrackingToken extends Model
{
    /** @use HasFactory<OrderTrackingTokenFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'revoked_at' => 'datetime', 'last_used_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
