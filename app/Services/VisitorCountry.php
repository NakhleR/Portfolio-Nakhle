<?php

namespace App\Services;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;

class VisitorCountry
{
    /**
     * Read Cloudflare's country only from a Cloudflare edge peer or the trusted local Cloudflare Tunnel connector.
     */
    public function resolve(Request $request): ?string
    {
        $peer = $request->server('REMOTE_ADDR');
        $country = $request->header('CF-IPCountry');
        $isFromCloudflare = is_string($peer)
            && (IpUtils::checkIp($peer, config('services.cloudflare.proxy_ranges', [])) || $request->isFromTrustedProxy());

        if (! $isFromCloudflare) {
            return null;
        }

        return is_string($country) && preg_match('/^[A-Z]{2}$/D', $country) === 1 && $country !== 'XX'
            ? $country : null;
    }
}
