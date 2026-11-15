<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DocumentStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewDocumentRequest;
use App\Http\Resources\OrderDocumentResource;
use App\Models\Order;
use App\Models\OrderDocument;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\UnableToReadFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Order $order): AnonymousResourceCollection
    {
        $this->authorize('view', $order);

        return OrderDocumentResource::collection($order->documents()->oldest()->get());
    }

    public function content(OrderDocument $document): StreamedResponse
    {
        $this->authorize('view', $document);

        try {
            $stream = Storage::disk($document->disk)->readStream($document->path);
        } catch (UnableToReadFile) {
            abort(404);
        }

        abort_unless(is_resource($stream), 404);
        $extension = match ($document->mime_type) {
            'application/pdf' => 'pdf',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        return response()->stream(
            static function () use ($stream): void {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            200,
            [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'inline; filename="document-'.$document->id.'.'.$extension.'"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ],
        );
    }

    public function update(ReviewDocumentRequest $request, OrderDocument $document): OrderDocumentResource
    {
        $this->authorize('update', $document);
        $validated = $request->validated();
        $status = DocumentStatus::from($validated['status']);

        DB::transaction(function () use ($request, $document, $validated, $status): void {
            $document->forceFill([
                'status' => $status,
                'review_note' => $validated['review_note'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ])->save();

            $order = Order::query()->lockForUpdate()->findOrFail($document->order_id);
            $nextStatus = $status === DocumentStatus::Rejected
                ? OrderStatus::DocumentsCorrection
                : ($order->documents()->where('status', '!=', DocumentStatus::Approved->value)->doesntExist()
                    ? OrderStatus::DocumentsValidated
                    : OrderStatus::DocumentsReview);

            if ($order->status !== $nextStatus) {
                $oldStatus = $order->status;
                $order->status = $nextStatus;
                $order->save();
                $order->statusHistory()->create([
                    'old_status' => $oldStatus,
                    'new_status' => $nextStatus,
                    'changed_by' => $request->user()->id,
                    'comment' => 'Document review updated.',
                ]);
            }
        });

        return OrderDocumentResource::make($document->fresh());
    }
}
