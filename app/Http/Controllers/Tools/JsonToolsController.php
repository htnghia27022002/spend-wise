<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tools;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class JsonToolsController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('tools/json-tools');
    }
}
