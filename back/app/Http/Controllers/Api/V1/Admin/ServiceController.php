<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Service::class);

        return ServiceResource::collection(Service::query()->orderBy('id')->paginate(50));
    }

    public function store(SaveServiceRequest $request): ServiceResource
    {
        $this->authorize('create', Service::class);

        $validated = $request->validated();
        $image = $validated['image'] ?? null;
        unset($validated['image']);
        if ($image) {
            $validated['image_path'] = $image->store('services', 'public');
        }

        return ServiceResource::make(Service::query()->create($validated));
    }

    public function show(Service $service): ServiceResource
    {
        $this->authorize('view', $service);

        return ServiceResource::make($service);
    }

    public function update(SaveServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('update', $service);
        $validated = $request->validated();
        $image = $validated['image'] ?? null;
        unset($validated['image']);
        $oldImage = $service->image_path;
        if ($image) {
            $validated['image_path'] = $image->store('services', 'public');
        }
        $service->update($validated);
        if ($image && $oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return ServiceResource::make($service->refresh());
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        try {
            $result = DB::transaction(function () use ($service): array {
                $lockedService = Service::query()->lockForUpdate()->findOrFail($service->getKey());

                if ($lockedService->orderItems()->exists()) {
                    $lockedService->update(['is_active' => false]);

                    return ['deleted' => false, 'image_path' => null];
                }

                $imagePath = $lockedService->image_path;
                $lockedService->delete();

                return ['deleted' => true, 'image_path' => $imagePath];
            });
        } catch (QueryException $exception) {
            report($exception);

            return response()->json([
                'message' => 'The service could not be deleted because it is referenced by another record.',
            ], 409);
        }

        if ($result['deleted'] && $result['image_path']) {
            Storage::disk('public')->delete($result['image_path']);
        }

        return response()->json([
            'message' => $result['deleted']
                ? 'Service permanently deleted.'
                : 'Service deactivated because it is used by existing orders.',
            'deleted' => $result['deleted'],
            'deactivated' => ! $result['deleted'],
        ]);
    }
}
