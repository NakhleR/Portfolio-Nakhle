<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="description" content="Nakhle Rizk — Full Stack Developer & AI and Machine Learning Student. Explore my projects, experience, and skills.">
<meta property="og:image" content="{{ url('/nakhle.png') }}">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<link rel="canonical" href="{{ url()->current() }}">
<script>try { const t=localStorage.getItem('portfolio-theme'); document.documentElement.classList.toggle('dark', t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)); } catch(e) {}</script>
@vite('resources/js/app.ts')
<x-inertia::head><title>Nakhle Rizk — Portfolio</title></x-inertia::head>
</head><body><x-inertia::app /></body></html>
