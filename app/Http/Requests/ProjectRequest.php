<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:1000'], 'category' => ['required', 'string', 'max:1000'],
            'description' => ['required', 'string', 'max:100000'], 'longDescription' => ['nullable', 'string', 'max:500000'],
            'technologies' => ['present', 'array', 'max:100'], 'technologies.*' => ['required', 'string', 'max:255'],
            'liveUrl' => ['nullable', 'url:http,https', 'max:2048'], 'githubUrl' => ['nullable', 'url:http,https', 'max:2048'],
            'order' => ['required', 'numeric'],
        ];
    }
}
