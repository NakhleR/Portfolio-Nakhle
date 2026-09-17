<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function messages(): array
    {
        if (app()->getLocale() !== 'fr') {
            return [];
        }

        return [
            'name.required' => 'Veuillez indiquer votre nom.',
            'name.string' => 'Veuillez indiquer un nom valide.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'email.required' => 'Veuillez indiquer votre adresse e-mail.',
            'email.email' => 'Veuillez indiquer une adresse e-mail valide.',
            'email.max' => 'L’adresse e-mail ne doit pas dépasser 255 caractères.',
            'message.required' => 'Veuillez écrire votre message.',
            'message.string' => 'Veuillez écrire un message valide.',
            'message.min' => 'Le message doit contenir au moins 10 caractères.',
            'message.max' => 'Le message ne doit pas dépasser 10 000 caractères.',
            'website.max' => 'Impossible d’envoyer ce formulaire.',
        ];
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'message' => ['required', 'string', 'min:10', 'max:10000'], 'website' => ['nullable', 'max:0']];
    }
}
