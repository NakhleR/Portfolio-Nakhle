{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach (['', '/about', '/work', '/contact', '/privacy', '/cookies', '/terms', '/legal'] as $path)
<url><loc>{{ $base.$path }}</loc></url>
@endforeach
@foreach ($projects as $project)
<url><loc>{{ $base.'/work/'.rawurlencode($project->mongo_id) }}</loc><lastmod>{{ $project->updated_at->toW3cString() }}</lastmod></url>
@endforeach
</urlset>
