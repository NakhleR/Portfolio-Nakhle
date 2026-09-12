<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TimelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return ['year' => ['required', 'string', 'max:255'], 'title' => ['required', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:1000'], 'category' => ['required', Rule::in(['education', 'work', 'project'])],
            'description' => ['nullable', 'string', 'max:100000'], 'bullets' => ['present', 'array', 'max:100'],
            'bullets.*' => ['required', 'string', 'max:10000'], 'order' => ['required', 'numeric']];
    }
}
