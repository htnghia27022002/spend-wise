<?php

declare(strict_types=1);

namespace App\Enums\Calendar;

enum EventColor: string
{
    case RED = 'red';
    case BLUE = 'blue';
    case GREEN = 'green';
    case YELLOW = 'yellow';
    case PURPLE = 'purple';
    case PINK = 'pink';
    case GRAY = 'gray';

    /**
     * Get all values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
