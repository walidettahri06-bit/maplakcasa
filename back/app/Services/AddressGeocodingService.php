<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class AddressGeocodingService
{
    /** @return array<int, array{id: string, label: string, lat: float, lng: float}> */
    public function suggestions(string $query): array
    {
        $url = config('services.maplak_geocoder.search_url');
        if (! is_string($url) || $url === '') {
            throw new ServiceUnavailableHttpException(null, 'Address search is not configured.');
        }

        $query = preg_replace('/\s+/u', ' ', trim($query)) ?? trim($query);
        $cacheKey = 'maplak:geocode:'.hash('sha256', $url."\n".mb_strtolower($query));

        return Cache::remember($cacheKey, now()->addMinutes((int) config('services.maplak_geocoder.cache_minutes', 1440)), function () use ($url, $query): array {
            $interval = (float) config('services.maplak_geocoder.minimum_interval_seconds', 1);
            $lockTtl = max(1, (int) ceil($interval));
            if ($interval > 0 && ! Cache::add('maplak:geocoder:lock:'.hash('sha256', $url), true, $lockTtl)) {
                throw new TooManyRequestsHttpException((int) ceil($interval), 'Address search is temporarily rate limited.');
            }

            $response = $this->client()->get($url, [
                'format' => 'jsonv2',
                'addressdetails' => 1,
                'limit' => 5,
                'countrycodes' => 'ma',
                'viewbox' => '-7.72,33.64,-7.48,33.50',
                'bounded' => 1,
                'accept-language' => 'fr,ar',
                'q' => $query.', Casablanca, Maroc',
            ])->throw()->json();

            return is_array($response) ? $this->normalize($response) : [];
        });
    }

    private function client(): PendingRequest
    {
        return Http::acceptJson()
            ->withUserAgent((string) config('services.maplak_geocoder.user_agent'))
            ->connectTimeout(3)
            ->timeout(8);
    }

    /** @param array<int, mixed> $results
     * @return array<int, array{id: string, label: string, lat: float, lng: float}>
     */
    private function normalize(array $results): array
    {
        return collect($results)
            ->filter(function ($result): bool {
                if (! is_array($result) || ! is_numeric($result['lat'] ?? null) || ! is_numeric($result['lon'] ?? null)) {
                    return false;
                }

                $lat = (float) $result['lat'];
                $lng = (float) $result['lon'];

                return $lat >= 33.50 && $lat <= 33.64
                    && $lng >= -7.72 && $lng <= -7.48
                    && is_string($result['display_name'] ?? null);
            })
            ->take(5)
            ->values()
            ->map(fn (array $result): array => [
                'id' => (string) ($result['osm_type'] ?? 'place').':'.(string) ($result['osm_id'] ?? $result['place_id'] ?? ''),
                'label' => $result['display_name'],
                'lat' => (float) $result['lat'],
                'lng' => (float) $result['lon'],
            ])
            ->all();
    }
}
