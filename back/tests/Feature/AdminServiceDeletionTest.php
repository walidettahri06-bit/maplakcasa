<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminServiceDeletionTest extends TestCase
{
    public function test_admin_can_permanently_delete_an_unused_service(): void
    {
        Storage::fake('public');
        $service = $this->makeService(['image_path' => 'services/unused.webp']);
        Storage::disk('public')->put('services/unused.webp', 'image');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        $this->deleteJson('/api/v1/admin/services/'.$service->code)
            ->assertOk()
            ->assertJsonPath('deleted', true)
            ->assertJsonPath('deactivated', false);

        $this->assertDatabaseMissing('services', ['id' => $service->id]);
        Storage::disk('public')->assertMissing('services/unused.webp');
    }

    public function test_admin_deactivates_a_service_used_in_orders_and_preserves_snapshots(): void
    {
        $service = $this->makeService();
        $order = Order::query()->create([
            'customer_name' => 'Client test',
            'customer_phone' => '0600000000',
            'payment_method' => 'cash_on_delivery',
            'subtotal' => 199,
            'total' => 199,
        ]);
        $item = OrderItem::query()->create([
            'order_id' => $order->id,
            'service_id' => $service->id,
            'service_code_snapshot' => 'pack-test',
            'service_name_snapshot' => 'Pack historique',
            'quantity' => 2,
            'unit_price' => 199,
            'line_total' => 398,
        ]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        $this->deleteJson('/api/v1/admin/services/'.$service->code)
            ->assertOk()
            ->assertJsonPath('deleted', false)
            ->assertJsonPath('deactivated', true);

        $this->assertDatabaseHas('services', ['id' => $service->id, 'is_active' => false]);
        $this->assertDatabaseHas('order_items', [
            'id' => $item->id,
            'service_id' => $service->id,
            'service_name_snapshot' => 'Pack historique',
            'unit_price' => '199.00',
            'line_total' => '398.00',
        ]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'subtotal' => '199.00']);
    }

    public function test_non_admin_cannot_delete_a_service(): void
    {
        $service = $this->makeService();
        Sanctum::actingAs(User::factory()->create(['role' => 'customer', 'is_active' => true]));

        $this->deleteJson('/api/v1/admin/services/'.$service->code)->assertForbidden();

        $this->assertDatabaseHas('services', ['id' => $service->id, 'is_active' => true]);
    }

    public function test_guest_cannot_delete_a_service(): void
    {
        $service = $this->makeService();

        $this->deleteJson('/api/v1/admin/services/'.$service->code)->assertUnauthorized();

        $this->assertDatabaseHas('services', ['id' => $service->id, 'is_active' => true]);
    }

    /** @param array<string, mixed> $overrides */
    private function makeService(array $overrides = []): Service
    {
        return Service::query()->create(array_merge([
            'code' => 'pack-test',
            'name_fr' => 'Pack test',
            'name_ar' => 'خدمة تجريبية',
            'description_fr' => '',
            'description_ar' => '',
            'price' => 199,
            'currency' => 'MAD',
            'lead_time_hours' => 24,
            'is_active' => true,
        ], $overrides));
    }
}
