<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['q' => trim((string) $this->input('q', ''))]);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['q' => ['required', 'string', 'min:4', 'max:200']];
    }
}
