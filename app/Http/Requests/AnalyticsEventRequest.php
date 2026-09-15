<?php

namespace App\Http\Requests;

use App\Models\AnalyticsConsent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnalyticsEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return ! $this->user() && $this->header('Sec-GPC') !== '1' && $this->header('DNT') !== '1' && AnalyticsConsent::current($this)?->analytics === true;
    }

    public function rules(): array
    {
        return [
            'events' => ['required', 'array', 'min:1', 'max:20'],
            'events.*' => ['array:id,session_id,view_id,path,type,device,section,target,value,x,y'],
            'events.*.id' => ['required', 'uuid'], 'events.*.session_id' => ['required', 'uuid'], 'events.*.view_id' => ['required', 'uuid'],
            'events.*.path' => ['required', 'string', 'max:160', 'regex:~^/(?:about|work(?:/[a-zA-Z0-9-]{1,80})?|contact|privacy|cookies|terms|legal)?$~'],
            'events.*.type' => ['required', Rule::in(['page_view', 'click', 'reading', 'scroll'])],
            'events.*.device' => ['required', Rule::in(['mobile', 'tablet', 'desktop'])],
            'events.*.section' => ['nullable', Rule::in(['navigation', 'hero', 'about', 'approach', 'projects', 'project-cover', 'project-overview', 'project-gallery', 'technology', 'biography', 'journey', 'skills', 'contact', 'footer', 'legal', 'content'])],
            'events.*.target' => ['nullable', Rule::in(['navigation', 'project', 'gallery', 'cv-download', 'email', 'telephone', 'external-link', 'section-link', 'discipline', 'theme', 'menu', 'animation', 'filter', 'link', 'button', 'surface'])],
            'events.*.value' => ['sometimes', 'integer', 'between:0,100'],
            'events.*.x' => ['nullable', 'integer', 'between:0,100'], 'events.*.y' => ['nullable', 'integer', 'between:0,100'],
        ];
    }
}
