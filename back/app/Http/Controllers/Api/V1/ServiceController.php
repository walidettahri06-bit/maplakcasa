<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    /**
     * List the services currently available to guest customers.
     */
    public function index(): AnonymousResourceCollection
    {
        return ServiceResource::collection(
            Service::query()->where('is_active', true)->orderBy('id')->get(),
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function show(string $service): ServiceResource
    {
        $service = Service::query()
            ->where('code', $service)
            ->where('is_active', true)
            ->firstOrFail();

        return ServiceResource::make($service);
    }
}
