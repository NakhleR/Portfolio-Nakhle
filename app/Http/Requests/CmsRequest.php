<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        $fields = config('cms.'.$this->route('section').'.fields');
        abort_unless(is_array($fields), 404);

        return ['version' => ['required', 'integer', 'min:0'], ...$this->fieldRules('data', $fields)];
    }

    private function fieldRules(string $prefix, array $fields): array
    {
        $rules = [$prefix => ['required', 'array:'.implode(',', array_keys($fields))]];
        foreach ($fields as $key => $field) {
            $name = $prefix.'.'.$key;
            $type = $field['type'];
            if ($type === 'repeater') {
                $rules[$name] = ['required', 'array', 'min:1', 'max:'.($field['max'] ?? 20)];
                $rules += $this->fieldRules($name.'.*', $field['fields']);
            } elseif ($type === 'checkbox') {
                $rules[$name] = ['required', 'boolean'];
            } elseif ($type === 'number') {
                $rules[$name] = ['required', 'numeric', 'min:'.$field['min'], 'max:'.$field['max']];
            } else {
                $rules[$name] = [$field['optional'] ?? false ? 'present' : 'required', 'string', ...($field['optional'] ?? false ? ['nullable'] : []), 'max:'.($field['max'] ?? ($type === 'textarea' ? 10000 : 1000))];
                if ($type === 'email') {
                    $rules[$name][] = 'email';
                }
                if ($type === 'url') {
                    $rules[$name][] = 'url:https,http';
                }
                if ($type === 'select') {
                    $rules[$name][] = Rule::in($field['options']);
                }
                if ($type === 'asset') {
                    $rules[$name][] = 'regex:#^/(?!/)[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|gif|avif)$#';
                }
            }
        }

        return $rules;
    }
}
