# Nakhle Rizk — Portfolio

Laravel 13, Inertia 3, Vue 3, TypeScript, and MySQL 8.4. Laravel serves the public site and administrator dashboard from one application. Project images use Spatie Media Library on the local public disk and FilePond for uploads.

## Local development

Requirements: PHP 8.4.1 or newer (8.5 recommended), Composer, Node.js 22.12+ or 24+, and Docker Desktop. PHP needs PDO MySQL, SQLite (for tests), GD, fileinfo, mbstring, XML, cURL, ZIP, and OpenSSL.

The existing working copy already has a generated `.env`, imported MySQL database, and all 50 original images. To run it:

```sh
docker compose up -d --wait
composer serve
```

Visit http://127.0.0.1:8000 and http://127.0.0.1:8000/login. The original administrator email and password still work. The local MySQL port is 3308; credentials are in the ignored `.env`. Run `npm run dev` in another terminal when editing Vue/CSS, or `npm run build` to rebuild production assets.

Public pages support Inertia server-side rendering. `npm run build` builds both browser assets and the Node SSR bundle. Start the renderer in a separate terminal with `php artisan inertia:start-ssr` (or `npm run ssr`); it listens only on `127.0.0.1:13714`. Restart it after rebuilding the SSR bundle. Without the renderer, Laravel still serves complete page metadata and falls back to client rendering. Browser effects initialize after hydration. Dashboard pages intentionally use client rendering. This setup uses the standalone renderer with built assets; Vite hot development falls back to client rendering. Stop the Vite dev server, build, and start/restart SSR when verifying initial HTML and SEO.

For a new checkout:

```sh
composer install
npm ci
```

Copy `.env.example` to `.env`, set unique `DB_PASSWORD` and `MYSQL_ROOT_PASSWORD`, then run:

```sh
php artisan key:generate
docker compose up -d --wait
php artisan migrate
php artisan storage:link
npm run build
composer serve
```

`composer serve` starts PHP with the same 20 MB upload limit enforced by the application. The default PHP upload limit may be smaller when using other server commands.

## Restore the original content

Private migration files are stored alongside this checkout in `../.migration-private/`. They are deliberately excluded from Git because the snapshot and SQL backup contain the administrator's password hash.

The completed migration contains 11 projects, 7 timeline entries, 1 administrator, and 50 images. Restore it into an empty migrated database with:

```sh
php artisan portfolio:import ../.migration-private/portfolio-snapshot.json --media-dir=../.migration-private/media
php artisan portfolio:import ../.migration-private/portfolio-snapshot.json --media-dir=../.migration-private/media --verify-only
```

The import preserves original IDs, all text, arrays and order, timestamps to milliseconds, and the bcrypt hash. Every original MongoDB document is retained in a private JSON column. Spatie image bytes and order are verified with SHA-256. New records get stable UUIDs; existing project links using MongoDB IDs continue to work. Repeat imports do not duplicate records or images, but they restore source fields for matching IDs, so do not rerun an import after editing those records unless that restoration is intended.

The independent private `portfolio-mysql.sql` and `portfolio-storage.zip` backups can be used to transfer the already migrated database and media. Keep both backups private and transfer them together. Restore the SQL into a dedicated empty MySQL database; extract the storage ZIP into `storage/app/public`, run `php artisan storage:link`, and set `APP_URL` for the new host. Alternatively use the JSON import above.

To take a fresh, read-only MongoDB export before a later production cutover:

```sh
npm ci --prefix scripts/migration
node scripts/migration/export.mjs /path/to/source.env test /private/new-export
node scripts/migration/download-media.mjs /private/new-export/portfolio-snapshot.json /private/new-export/media
php artisan portfolio:import /private/new-export/portfolio-snapshot.json --media-dir=/private/new-export/media
```

Only the migration tooling accesses MongoDB and the old image host. The Laravel application has no Express, React, MongoDB, Cloudinary, JWT, or EmailJS runtime dependency.

## Features

- Home, About, Work, Contact, CV download, theme switch, mobile navigation, skills, timeline filters, project galleries, and existing 3D assets.
- Session authentication, CSRF protection, login rate limits, and administrator-only writes.
- Project/timeline creation, editing, display ordering, and deletion.
- Local image uploads with previews, validation, cancellation, and removal.
- Contact form stores messages in MySQL and shows them in the dashboard. It does not send email; SMTP notifications can be added when production is configured.
- Public read-only compatibility endpoints: `/api/projects`, `/api/timeline`, and individual record routes.
- `/health` checks Laravel and database connectivity; `/sitemap.xml` uses the current app domain.

## Validation

```sh
php artisan test
npm run build
vendor/bin/pint --dirty
```

The original migration suite passed against isolated SQLite and a separate MySQL test database, with fake storage. The expanded suite now includes SEO metadata, sitemap, canonical-navigation, and media optimization regression coverage. Browser checks covered galleries, navigation, legacy-service independence, login, project/timeline CRUD, FilePond uploads, mobile layout, and 3D/theme rendering. The real imported content is separately verified against local MySQL using `portfolio:import --verify-only`.

## Production later

Serve the `public/` directory with PHP 8.4.1+, use MySQL, configure `APP_ENV=production`, `APP_DEBUG=false`, a unique `APP_KEY`, HTTPS `APP_URL`, secure session cookies, and matching PHP upload limits. Persist `storage/app/public` and back up it together with MySQL. Run `composer install --no-dev --optimize-autoloader`, `npm ci`, `npm run build`, `php artisan migrate --force`, `php artisan storage:link`, and `php artisan optimize`.

Keep `php artisan inertia:start-ssr` running under a process supervisor in production, with Node.js available and `bootstrap/ssr` deployed from the build. Bind port 13714 to loopback only. Restart the SSR service after every new build; use `php artisan inertia:check-ssr` for its health check. Keep `INERTIA_SSR_ENABLED=true` in production. The PHP test suite disables SSR so it remains independent of a running Node service.

`APP_URL` is the source for canonical URLs, the dynamic `/robots.txt` sitemap reference, and all 15 current sitemap URLs (four main pages plus project details). Set it to the final HTTPS domain and rebuild Laravel's configuration cache before launch. Titles, descriptions, social metadata, and JSON-LD share one server-side source; login/dashboard/missing pages are noindex. Submit `/sitemap.xml` to Google Search Console on the final domain after deployment. No submission is performed by the app.

Project uploads automatically produce a WebP `display` conversion (up to 1600px wide) and responsive sizes through Spatie; GIFs remain original. Original upload files and full-size links are preserved. After restoring an older media backup, generate missing display copies with `php artisan media-library:regenerate 'App\Models\Project' --only=display --only-missing --no-interaction` (add `--force` on the configured production host). Until conversions exist, the frontend falls back to original URLs. PHP GD needs WebP support. The About portrait has committed WebP display copies alongside its original.

The original birds shader acts as an entry loader once per browser tab. It waits for registered 3D scenes, page images and fonts, with a 20-second escape for stalled requests; internal navigation uses a simple transition and reduced-motion visits skip the birds. Public pages use production assets only when no Vite hot file points to a running development server; do not deploy `public/hot`.

The Vercel Git auto-deployment configuration is disabled because this Laravel application needs PHP hosting. The migration commit uses Render's `[skip render]` directive to avoid deploying Laravel to the old Express service. Configure the new production host before re-enabling deployment workflows. The original repository is preserved in the private Git bundle and normal Git history.


## Private analytics and consent

`/dashboard/analytics` is administrator-only. It reports consenting page views, browser sessions, pseudonymous browsers, active reading time by section, scroll milestones, control clicks, and normalized click distributions filtered by page and device. Reading time is an activity-based estimate, not eye tracking; click maps are coordinate distributions, not replay recordings or screenshot overlays. Administrator browsing is excluded.

Analytics are first-party and opt-in. No tracker module or analytics request is started before permission. An encrypted HttpOnly `portfolio_consent` cookie links to a versioned, expiring consent record. Every batch is checked on the server. Denied, expired, obsolete, GPC/DNT, and authenticated requests are rejected. Payloads are limited and allowlisted; form contents, query strings, IP addresses, and user-agent strings are not stored in analytics tables. Browser sessions use optional session storage. The footer provides withdrawal and deletion of analytics associated with the current consent reference. Lost cookies mean that reference cannot reliably be recovered.

Run Laravel’s scheduler every minute in production (`php artisan schedule:run`), or use the host’s managed scheduler. The scheduled `analytics:prune` command removes events older than 90 days and consent records after 180 days; cascading deletion also removes their events. You can invoke the command manually. Without a running scheduler, physical deletion will not occur automatically. Database backups need their own documented retention policy. The reporting period is limited to the latest 90 days regardless of scheduler status.

The external OpenStreetMap embed is click-to-load. It is not fetched merely by visiting Contact. The legal routes `/privacy`, `/cookies`, `/terms`, and `/legal` are rendered and included in the sitemap. Before public launch, complete and verify `LEGAL_OWNER`, `LEGAL_EMAIL`, `LEGAL_PUBLIC_ADDRESS`, any `LEGAL_BUSINESS_DETAILS`, and the production host’s `LEGAL_HOST_NAME`, `LEGAL_HOST_ADDRESS`, and `LEGAL_HOST_PHONE`. These optional environment keys are exposed through `config/privacy.php`; no hosting identity has been invented. The current hosting notice explicitly identifies a local preview until those details exist. Confirm the policies against actual hosting, server-log/back-up retention, business status, content licences, and applicable law before publication. The contact-message retention criteria in the privacy policy require the owner’s operational review; analytics pruning does not delete contact messages.

Changing optional tracking purposes should also bump `AnalyticsConsent::VERSION` so prior choices cannot silently authorize a new purpose. No session recording or advertising system is installed.


## Security controls

Browser responses enforce a Content Security Policy: same-origin scripts with a per-response nonce for the theme bootstrap, no JavaScript eval, no framing or embedded objects, and a restricted resource allowlist. WebAssembly compilation and blob workers remain enabled for the original Draco models; inline styles remain enabled for GSAP, Three.js and FilePond. OpenStreetMap tiles are the only external image origin allowed. Local Vite origins are permitted only while the local development hot file exists. Dynamic responses (including private dashboard/analytics data, consent and CSRF tokens) use `private, no-store`; static assets keep normal caching.

Authenticated Inertia page history is encrypted in the browser, and logout or returning to login clears the history key. This requires HTTPS in production (loopback localhost works during development). Login combines the existing five requests/minute IP limit with ten failed attempts per normalized account over fifteen minutes; a successful login clears account failures. Uploads require an approved image MIME type and filename extension, at most 20 MB, at most 6000 pixels per side and 20 million pixels total. Public filenames are generated UUIDs with a MIME-derived extension, never the supplied filename. Existing imported images are unchanged. Uploads are also rate-limited. Public mutations retain Laravel CSRF protection and all dashboard writes require an administrator.

In production, `APP_URL` must match the exact public hostname (redirect any alternate domains at the web server). Debug output is disabled in production even if `APP_DEBUG` is mistakenly enabled. Secure cookies default on in production; explicitly set `SESSION_SECURE_COOKIE=true`, `SESSION_ENCRYPT=true`, and `SESSION_HTTP_ONLY=true`. Changing encryption for existing sessions signs those sessions out. HTTPS responses set HSTS for the current host, without subdomain or preload commitments. Configure only the actual trusted reverse proxy addresses when hosting behind a load balancer so HTTPS is detected correctly; never blindly trust every proxy.

Serve only `public/`, disable directory listings, deny hidden files except the required `.well-known` challenge path, and disable script execution in `public/storage`. Apache rules and the local PHP router block executable upload paths; configure equivalent rules on Nginx or the eventual host. Never deploy `public/hot`, private migration snapshots, SQL backups, `.env`, or development dependencies. Use a dedicated MySQL account with privileges limited to this database, private database/SSR ports, protected backups, and a unique application key. Recheck `composer audit` and `npm audit` regularly. These application changes are not a penetration test or verification of the eventual production server.


## Content management

Sign in at `/login` and open `/dashboard`. The CMS overview shows the last 30 days of consenting page views and sessions, unpublished content, new enquiries, and recent content edits. Analytics live at `/dashboard/analytics` with day-by-day view/session graphs, device distribution, reading time, scroll depth, page/action rankings, click coordinates and a daily CSV export. Empty periods display zero activity; no example traffic is inserted into the real database.

Pages & content covers the homepage, 3D showcase captions, services, biography, skill groups, work introduction, contact page, identity/contact details, search metadata and legal policies. `config/cms.php` retains the original text as defaults. The additive CMS migration does not replace existing content or media. Drafts and published content are separate JSON documents; saving does not publish. Preview opens the public page with `?preview=1` and only authenticated administrators can see drafts. Preview pages are noindex. Publishing saves revisions, and restoring a revision creates a draft for review. An edit-version check rejects stale saves from another tab. Policy tokens `{{publisher}}` and `{{email}}` resolve from the Publisher & hosting settings. Policy publication updates its displayed date.

Project and experience editors retain existing CRUD and order controls. New projects start unpublished in the CMS; imported projects remain published. Unpublished projects are excluded from the archive, public API and sitemap, and have an administrator preview at `/work/{id}?preview=1`. Their media files remain publicly addressable; draft visibility is not confidential-file storage.

Media library uses existing Spatie/FilePond uploads. Choose a project to upload/delete images, edit alternative text or choose its cover. Global portrait and CV replacements update the site immediately and are explicitly separate from page drafts. Portraits get a 960px WebP display conversion; original public portrait/CV assets remain the fallback until replacements exist. Keep your own backups before replacing a previously uploaded global file. The inbox supports search, new/read/replied/archived statuses, private notes and permanent deletion. Reply links open the owner's email application; the CMS does not send replies automatically.

Account & security allows an administrator to change their password using their current password. With the production database-session driver, existing database sessions are revoked; the current browser is signed out and private history cleared. Existing administrator authorization, CSRF validation, upload restrictions and security headers apply to every CMS endpoint. Infrastructure secrets, application keys and database credentials are deliberately kept in environment configuration rather than the browser editor.

After pulling these changes, run `php artisan migrate` and `npm run build`; restart SSR. The optional browser workflow test uses a disposable SQLite database and a loopback PHP process, never the imported MySQL data. With Python Playwright installed, run `CMS_BROWSER_TEST=1 php artisan test --filter=CmsBrowserTest` (PowerShell: `$env:CMS_BROWSER_TEST='1'; php artisan test --filter=CmsBrowserTest`). `CMS_BROWSER_PYTHON` may specify the Python executable. Its screenshots use clearly isolated test account/content and are saved under `.impeccable/review/screenshots`.
