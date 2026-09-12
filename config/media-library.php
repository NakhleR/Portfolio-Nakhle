<?php

use Spatie\MediaLibrary\ResponsiveImages\TinyPlaceholderGenerator\Blurred;
use Spatie\MediaLibrary\ResponsiveImages\WidthCalculator\FileSizeOptimizedWidthCalculator;

return [
    'responsive_images' => [
        'width_calculator' => FileSizeOptimizedWidthCalculator::class,
        // Vue supplies explicit sizes, so no inline placeholder or resizing script is needed.
        'use_tiny_placeholders' => false,
        'tiny_placeholder_generator' => Blurred::class,
    ],
];
