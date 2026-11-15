<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDocumentResource extends JsonResource
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
            'type' => $this->type->value,
            'originalName' => $this->original_name,
            'mimeType' => $this->mime_type,
            'sizeBytes' => $this->size_bytes,
            'status' => $this->status->value,
            'reviewNote' => $this->review_note,
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'contentUrl' => route('admin.documents.content', ['document' => $this->id]),
        ];
    }
}
