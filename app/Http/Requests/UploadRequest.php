<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return ['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,avif', 'max:20480']];
    }
}
