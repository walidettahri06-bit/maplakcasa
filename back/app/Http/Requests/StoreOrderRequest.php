<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreOrderRequest extends FormRequest
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
        $documentRule = fn (): File => File::types(['jpg', 'jpeg', 'png', 'webp', 'pdf'])
            ->extensions(['jpg', 'jpeg', 'png', 'webp', 'pdf'])
            ->max((int) config('maplak.document_max_kb'));

        return [
            'customer' => ['required', 'array'],
            'customer.full_name' => ['required', 'string', 'min:3', 'max:80', 'regex:/^[\p{L}\s\'.-]+$/u'],
            'customer.phone' => ['required', 'string', 'max:20', 'regex:/^(?:\+212|00212|0)[5-7]\d{8}$/'],
            'customer.email' => ['nullable', 'email:rfc', 'max:120'],
            'plate' => ['required', 'array'],
            'plate.serial' => ['required', 'digits_between:1,5'],
            'plate.letter' => ['required', 'string', 'max:8', 'regex:/^\p{L}+$/u'],
            'plate.region' => ['required', 'integer', 'between:1,89'],
            'items' => ['required', 'array', 'min:1', 'max:3'],
            'items.*.service_code' => ['required', 'string', 'distinct', 'exists:services,code'],
            'items.*.quantity' => ['required', 'integer', 'between:1,4'],
            'delivery' => ['required', 'array'],
            'delivery.neighborhood' => ['required', Rule::in(config('maplak.casablanca_neighborhoods'))],
            'delivery.address' => ['required', 'string', 'min:8', 'max:200'],
            'delivery.instructions' => ['nullable', 'string', 'max:300'],
            'delivery.location' => ['nullable', 'array'],
            'delivery.location.lat' => ['nullable', 'numeric', 'between:33.50,33.64'],
            'delivery.location.lng' => ['nullable', 'numeric', 'between:-7.72,-7.48'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'locale' => ['sometimes', Rule::in(['fr', 'ar'])],
            'documents' => ['required', 'array'],
            'documents.cin_front' => ['required', $documentRule()],
            'documents.cin_back' => ['required', $documentRule()],
            'documents.carte_grise' => ['required', $documentRule()],
        ];
    }
}
