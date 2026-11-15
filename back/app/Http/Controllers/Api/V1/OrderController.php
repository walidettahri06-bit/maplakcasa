<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderCreationService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function store(StoreOrderRequest $request, OrderCreationService $orders): JsonResponse
    {
        $validated = $request->validated();
        $created = $orders->create($validated, $validated['documents']);

        return OrderResource::make($created['order'])
            ->additional(['meta' => ['tracking_token' => $created['tracking_token']]])
            ->response()
            ->setStatusCode(201);
    }
}
