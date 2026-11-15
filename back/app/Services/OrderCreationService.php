<?php

namespace App\Services;

use App\Enums\DocumentType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderDocument;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\OrderTrackingToken;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderCreationService
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, UploadedFile>  $documents
     * @return array{order: Order, tracking_token: string}
     */
    public function create(array $data, array $documents): array
    {
        $data['locale'] ??= 'fr';
        $storedPaths = [];
        $disk = (string) config('maplak.document_disk');

        try {
            return DB::transaction(function () use ($data, $documents, $disk, &$storedPaths): array {
                $services = Service::query()
                    ->whereIn('code', collect($data['items'])->pluck('service_code'))
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('code');

                if ($services->count() !== count($data['items'])) {
                    throw ValidationException::withMessages([
                        'items' => 'One or more selected services are unavailable.',
                    ]);
                }

                $subtotalCents = 0;
                foreach ($data['items'] as $item) {
                    $service = $services->get($item['service_code']);
                    $unitPriceCents = (int) round((float) $service->price * 100);
                    $subtotalCents += $unitPriceCents * (int) $item['quantity'];
                }

                $deliveryFeeCents = (int) config('maplak.delivery_fee') * 100;
                $order = Order::query()->create([
                    'customer_name' => $data['customer']['full_name'],
                    'customer_phone' => $data['customer']['phone'],
                    'customer_email' => $data['customer']['email'] ?? null,
                    'plate_serial' => $data['plate']['serial'],
                    'plate_letter' => $data['plate']['letter'],
                    'plate_region' => $data['plate']['region'],
                    'status' => OrderStatus::Pending,
                    'payment_method' => $data['payment_method'],
                    'currency' => (string) config('maplak.currency'),
                    'subtotal' => number_format($subtotalCents / 100, 2, '.', ''),
                    'delivery_fee' => number_format($deliveryFeeCents / 100, 2, '.', ''),
                    'total' => number_format(($subtotalCents + $deliveryFeeCents) / 100, 2, '.', ''),
                    'locale' => $data['locale'] ?? 'fr',
                ]);

                $order->forceFill([
                    'reference' => sprintf('MAP-%s-%04d', now()->format('Y'), $order->getKey()),
                ])->save();

                foreach ($data['items'] as $item) {
                    $service = $services->get($item['service_code']);
                    $unitPriceCents = (int) round((float) $service->price * 100);
                    $quantity = (int) $item['quantity'];

                    $order->items()->save(new OrderItem([
                        'service_id' => $service->getKey(),
                        'service_code_snapshot' => $service->code,
                        'service_name_snapshot' => $data['locale'] === 'ar' ? $service->name_ar : $service->name_fr,
                        'quantity' => $quantity,
                        'unit_price' => number_format($unitPriceCents / 100, 2, '.', ''),
                        'line_total' => number_format(($unitPriceCents * $quantity) / 100, 2, '.', ''),
                    ]));
                }

                $location = $data['delivery']['location'] ?? [];
                $order->delivery()->save(new Delivery([
                    'city' => 'Casablanca',
                    'neighborhood' => $data['delivery']['neighborhood'],
                    'address' => $data['delivery']['address'],
                    'instructions' => $data['delivery']['instructions'] ?? null,
                    'latitude' => $location['lat'] ?? null,
                    'longitude' => $location['lng'] ?? null,
                    'status' => 'unscheduled',
                ]));

                foreach ([
                    'cin_front' => DocumentType::CinFront,
                    'cin_back' => DocumentType::CinBack,
                    'carte_grise' => DocumentType::CarteGrise,
                ] as $key => $type) {
                    $file = $documents[$key];
                    $path = $file->store((string) $order->getKey(), $disk);
                    $storedPaths[] = $path;

                    $order->documents()->save(new OrderDocument([
                        'type' => $type,
                        'disk' => $disk,
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                        'size_bytes' => $file->getSize(),
                        'status' => 'pending',
                    ]));
                }

                $order->payments()->save(new Payment([
                    'method' => $data['payment_method'],
                    'status' => PaymentStatus::Pending,
                    'amount' => number_format(($subtotalCents + $deliveryFeeCents) / 100, 2, '.', ''),
                    'currency' => (string) config('maplak.currency'),
                ]));

                $order->statusHistory()->save(new OrderStatusHistory([
                    'old_status' => null,
                    'new_status' => OrderStatus::Pending,
                    'comment' => 'Order created by guest checkout.',
                ]));

                $rawToken = bin2hex(random_bytes(32));
                $order->trackingTokens()->save(new OrderTrackingToken([
                    'token_hash' => hash('sha256', $rawToken),
                    'expires_at' => now()->addDays((int) config('maplak.tracking_token_days')),
                ]));

                return [
                    'order' => $order->load(['items', 'documents', 'payments', 'delivery']),
                    'tracking_token' => $rawToken,
                ];
            });
        } catch (Throwable $exception) {
            foreach ($storedPaths as $path) {
                Storage::disk($disk)->delete($path);
            }

            throw $exception;
        }
    }
}
