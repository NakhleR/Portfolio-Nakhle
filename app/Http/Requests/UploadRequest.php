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
        return ['file' => ['bail', 'required', 'file', 'max:20480', 'mimes:jpg,jpeg,png,webp,gif,avif', 'extensions:jpg,jpeg,png,webp,gif,avif', 'dimensions:max_width=6000,max_height=6000', function (string $attribute, mixed $value, \Closure $fail): void {
            $size = @getimagesize($value->getPathname());
            if (! $size || $size[0] * $size[1] > 20000000) {
                $fail('Images must contain at most 20 million pixels.');
            }
        }]];
    }
}
