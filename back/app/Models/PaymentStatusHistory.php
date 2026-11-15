<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['payment_id', 'old_status', 'new_status', 'changed_by', 'comment'])]
class PaymentStatusHistory extends Model
{
    protected function casts(): array
    {
        return ['old_status' => PaymentStatus::class, 'new_status' => PaymentStatus::class];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
