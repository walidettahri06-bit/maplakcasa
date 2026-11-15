<?php

namespace App\Http\Requests;

use App\Enums\DeliveryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeliveryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(DeliveryStatus::class)],
            'neighborhood' => ['sometimes', 'required', Rule::in(config('maplak.casablanca_neighborhoods'))],
            'address' => ['sometimes', 'required', 'string', 'min:8', 'max:200'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:300'],
            'scheduled_at' => ['sometimes', 'nullable', 'date'],
            'driver_name' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }
}
