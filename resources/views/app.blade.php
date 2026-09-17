<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.json">
<script nonce="{{ Illuminate\Support\Facades\Vite::cspNonce() }}">try { const t=localStorage.getItem('portfolio-theme'); document.documentElement.classList.toggle('dark', t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)); } catch(e) {}</script>
<link rel="stylesheet" href="{{ asset('fonts/space-grotesk.css') }}">
@vite('resources/js/app.ts')
<x-inertia::head>@include('seo-head', ['seo' => $page['props']['seo']])</x-inertia::head>
</head><body><x-inertia::app /></body></html>
