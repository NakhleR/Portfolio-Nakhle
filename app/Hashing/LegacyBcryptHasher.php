<?php

namespace App\Hashing;

use Illuminate\Hashing\BcryptHasher;

class LegacyBcryptHasher extends BcryptHasher
{
    public function check($value, $hashedValue, array $options = []): bool
    {
        // bcryptjs uses 2a; PHP identifies 2y as bcrypt. The digest is unchanged.
        if (is_string($hashedValue) && (str_starts_with($hashedValue, '$2a$') || str_starts_with($hashedValue, '$2b$'))) {
            $hashedValue = '$2y$'.substr($hashedValue, 4);
        }

        return parent::check($value, $hashedValue, $options);
    }
}
