<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<mixed>|string> */
    public function rules(): array
    {
        return ['note' => ['nullable', 'string', 'max:10000']];
    }
}
