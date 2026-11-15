<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchAddressRequest;
use App\Http\Resources\GeocodingSuggestionResource;
use App\Services\AddressGeocodingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class GeocodingSuggestionController extends Controller
{
    public function __invoke(SearchAddressRequest $request, AddressGeocodingService $geocoder): AnonymousResourceCollection|JsonResponse
    {
        try {
            return GeocodingSuggestionResource::collection($geocoder->suggestions($request->validated('q')));
        } catch (HttpExceptionInterface $exception) {
            throw $exception;
        } catch (Throwable) {
            return response()->json(['message' => 'Address suggestions are temporarily unavailable.'], 503);
        }
    }
}
