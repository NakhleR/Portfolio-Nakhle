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

All 20 automated feature tests passed against both isolated SQLite and a separate MySQL test database, with fake storage. Browser checks covered galleries, navigation, legacy-service independence, login, project/timeline CRUD, FilePond uploads, mobile layout, and 3D/theme rendering. The real imported content is separately verified against local MySQL using `portfolio:import --verify-only`.

## Production later

Serve the `public/` directory with PHP 8.4.1+, use MySQL, configure `APP_ENV=production`, `APP_DEBUG=false`, a unique `APP_KEY`, HTTPS `APP_URL`, secure session cookies, and matching PHP upload limits. Persist `storage/app/public` and back up it together with MySQL. Run `composer install --no-dev --optimize-autoloader`, `npm ci`, `npm run build`, `php artisan migrate --force`, `php artisan storage:link`, and `php artisan optimize`.

The Vercel Git auto-deployment configuration is disabled because this Laravel application needs PHP hosting. The migration commit uses Render's `[skip render]` directive to avoid deploying Laravel to the old Express service. Configure the new production host before re-enabling deployment workflows. The original repository is preserved in the private Git bundle and normal Git history.
