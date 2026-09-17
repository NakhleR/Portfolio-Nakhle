<title data-inertia="">{{ $seo['title'] }}</title>
<meta data-inertia="description" name="description" content="{{ $seo['description'] }}">
<meta data-inertia="robots" name="robots" content="{{ $seo['robots'] }}">
<link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
@foreach (['og:type' => 'website', 'og:site_name' => 'Nakhle Rizk', 'og:title' => $seo['title'], 'og:description' => $seo['description'], 'og:url' => $seo['canonical'], 'og:image' => $seo['image'], 'og:image:alt' => $seo['imageAlt']] as $property => $content)
<meta data-inertia="{{ $property }}" property="{{ $property }}" content="{{ $content }}">
@endforeach
@foreach (['twitter:card' => 'summary_large_image', 'twitter:title' => $seo['title'], 'twitter:description' => $seo['description'], 'twitter:image' => $seo['image'], 'twitter:image:alt' => $seo['imageAlt']] as $name => $content)
<meta data-inertia="{{ $name }}" name="{{ $name }}" content="{{ $content }}">
@endforeach
@if ($seo['schema'])
<script data-inertia="structured-data" type="application/ld+json">{!! $seo['schema'] !!}</script>
@endif

@foreach ($seo['alternates'] as $language => $href)
<link data-inertia="alternate-{{ $language }}" rel="alternate" hreflang="{{ $language }}" href="{{ $href }}">
@endforeach
<meta data-inertia="og:locale" property="og:locale" content="{{ $seo['locale'] }}">
