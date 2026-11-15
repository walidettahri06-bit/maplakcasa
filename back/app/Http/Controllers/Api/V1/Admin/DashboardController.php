<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);
        $today = now()->toDateString();
        $from = now()->subDays(13)->startOfDay();
        $statuses = Order::query()
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $revenueByDay = Payment::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$from, now()->endOfDay()])
            ->selectRaw('DATE(paid_at) as date, SUM(amount) as revenue, COUNT(DISTINCT order_id) as orders')
            ->groupByRaw('DATE(paid_at)')
            ->get()
            ->keyBy('date');
        $paidRevenue = (float) Payment::query()->where('status', 'paid')->sum('amount');
        $paidOrders = Order::query()->whereHas('payments', fn ($query) => $query->where('status', 'paid'))->count();

        $days = collect(range(13, 0))->map(function (int $daysAgo) use ($revenueByDay): array {
            $date = now()->subDays($daysAgo)->toDateString();
            $summary = $revenueByDay->get($date);

            return [
                'date' => $date,
                'revenue' => (float) ($summary?->revenue ?? 0),
                'orders' => (int) ($summary?->orders ?? 0),
            ];
        });

        return response()->json(['data' => [
            'revenue' => $paidRevenue,
            'orders' => Order::query()->count(),
            'newOrders' => Order::query()->where('status', 'pending')->count(),
            'pendingOrders' => Order::query()->whereIn('status', ['documents_review', 'documents_correction'])->count(),
            'completedOrders' => Order::query()->where('status', 'completed')->count(),
            'cancelledOrders' => Order::query()->where('status', 'cancelled')->count(),
            'pendingPayments' => Payment::query()->where('status', 'pending')->count(),
            'pendingDocuments' => Order::query()->whereHas('documents', fn ($query) => $query->where('status', 'pending'))->count(),
            'deliveriesToday' => Delivery::query()->whereDate('scheduled_at', $today)->whereIn('status', ['scheduled', 'in_transit'])->count(),
            'averageBasket' => $paidOrders > 0 ? round($paidRevenue / $paidOrders, 2) : 0,
            'revenueByDay' => $days,
            'statusBreakdown' => $statuses->map(fn ($count, string $status): array => ['status' => $status, 'count' => (int) $count])->values(),
        ]]);
    }
}
