<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GuestCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_checkout_persists_order_documents_and_secure_tracking(): void
    {
        Storage::fake('documents');
        Service::query()->create([
            'code' => 'pair',
            'name_fr' => 'Pack deux plaques',
            'name_ar' => 'طقم لوحتين',
            'description_fr' => 'Pack homologué',
            'description_ar' => 'طقم معتمد',
            'price' => 199,
            'currency' => 'MAD',
            'lead_time_hours' => 24,
            'is_active' => true,
        ]);

        $response = $this->post('/api/v1/orders', [
            'customer' => ['full_name' => 'Test Client', 'phone' => '0674486969'],
            'plate' => ['serial' => '1234', 'letter' => 'B', 'region' => 6],
            'items' => [['service_code' => 'pair', 'quantity' => 1]],
            'delivery' => [
                'neighborhood' => 'Anfa',
                'address' => '12 rue de test, Casablanca',
                'location' => ['lat' => 33.5731, 'lng' => -7.5898],
            ],
            'payment_method' => 'cash_on_delivery',
            'locale' => 'fr',
            'documents' => [
                'cin_front' => UploadedFile::fake()->create('cin-front.pdf', 20, 'application/pdf'),
                'cin_back' => UploadedFile::fake()->create('cin-back.pdf', 20, 'application/pdf'),
                'carte_grise' => UploadedFile::fake()->create('carte-grise.pdf', 20, 'application/pdf'),
            ],
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.subtotal', 199)
            ->assertJsonPath('data.total', 199)
            ->assertJsonPath('data.payment.method', 'cash_on_delivery')
            ->assertJsonCount(3, 'data.documents');

        $reference = $response->json('data.reference');
        $token = $response->json('meta.tracking_token');
        $this->assertNotEmpty($token);

        $order = Order::query()->where('reference', $reference)->with('items', 'documents')->firstOrFail();
        $this->assertSame('199.00', $order->items->first()->unit_price);
        $this->assertCount(3, $order->documents);
        $this->assertSame('33.5731000', $order->delivery->latitude);
        $this->assertSame('-7.5898000', $order->delivery->longitude);
        foreach ($order->documents as $document) {
            Storage::disk('documents')->assertExists($document->path);
        }

        $this->postJson('/api/v1/orders/track', ['reference' => $reference, 'token' => $token])
            ->assertOk()
            ->assertJsonPath('data.reference', $reference)
            ->assertJsonMissingPath('data.customer')
            ->assertJsonMissingPath('data.documents');

        $this->postJson('/api/v1/orders/track', ['reference' => $reference, 'token' => str_repeat('0', 64)])
            ->assertNotFound();

        $this->getJson('/api/v1/admin/documents/'.$order->documents->first()->id.'/content')
            ->assertUnauthorized();
    }
}
