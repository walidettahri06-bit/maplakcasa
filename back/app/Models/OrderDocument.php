<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Database\Factories\OrderDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'type', 'disk', 'path', 'original_name', 'mime_type', 'size_bytes', 'status', 'review_note', 'reviewed_by', 'reviewed_at'])]
class OrderDocument extends Model
{
    /** @use HasFactory<OrderDocumentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return ['type' => DocumentType::class, 'status' => DocumentStatus::class, 'size_bytes' => 'integer', 'reviewed_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
