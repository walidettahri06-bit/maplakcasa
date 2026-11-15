<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class SaveServiceRequest extends FormRequest
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
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'code' => [$required, 'string', 'max:80', 'regex:/^[\da-z\-]{1,80}$/', Rule::unique('services', 'code')->ignore($this->route('service'))],
            'name_fr' => [$required, 'string', 'max:160'],
            'name_ar' => [$required, 'string', 'max:160'],
            'description_fr' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'description_ar' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'price' => [$required, 'numeric', 'min:0', 'max:100000'],
            'currency' => ['sometimes', Rule::in(['MAD'])],
            'lead_time_hours' => ['sometimes', 'integer', 'between:1,720'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'nullable', File::types(['jpg', 'jpeg', 'png', 'webp'])->extensions(['jpg', 'jpeg', 'png', 'webp'])->max('4mb'), 'image'],
        ];
    }
}
