<?php

declare(strict_types=1);

namespace App\Http\Controllers\Calendar;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CalendarController extends Controller
{
    public function __construct(
        private readonly CalendarRepositoryInterface $repository,
        private readonly CalendarServiceInterface $service,
    ) {}

    public function index(Request $request): Response
    {
        $month = $request->input('month', date('Y-m'));
        $events = $this->repository->getEventsByUserAndMonth(auth()->id(), $month);

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'month' => $month,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Calendar/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'                      => 'required|string|max:255',
            'description'                => 'nullable|string',
            'start_date'                 => 'required|date_format:Y-m-d H:i',
            'end_date'                   => 'nullable|date_format:Y-m-d H:i|after:start_date',
            'type'                       => 'required|string|in:payment_due,subscription_due,installment_due,custom,reminder',
            'color'                      => 'required|string|in:red,blue,green,yellow,purple,pink,gray',
            'is_all_day'                 => 'boolean',
            'location'                   => 'nullable|string|max:255',
            'reminders'                  => 'nullable|array',
            'reminders.*.minutes_before' => 'integer|min:5',
            'reminders.*.reminder_type'  => 'string|in:notification,email,sms',
        ]);

        $reminders = $validated['reminders'] ?? [];
        unset($validated['reminders']);
        $validated['is_all_day'] = $request->boolean('is_all_day', false);

        $event = $this->service->createEvent(auth()->id(), $validated);

        // Create reminders
        foreach ($reminders as $reminder) {
            $this->service->createReminder($event, $reminder['minutes_before'], $reminder['reminder_type']);
        }

        return redirect()->route('calendar.index');
    }

    public function show(int $id): Response
    {
        $event = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $event) {
            abort(404);
        }

        return Inertia::render('Calendar/Show', [
            'event' => $event->load('reminders'),
        ]);
    }

    public function edit(int $id): Response
    {
        $event = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $event) {
            abort(404);
        }

        return Inertia::render('Calendar/Edit', [
            'event' => $event->load('reminders'),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $event = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $event) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date_format:Y-m-d H:i',
            'end_date' => 'nullable|date_format:Y-m-d H:i|after:start_date',
            'type' => 'required|string|in:payment_due,subscription_due,installment_due,custom,reminder',
            'color' => 'required|string|in:red,blue,green,yellow,purple,pink,gray',
            'is_all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'reminders' => 'nullable|array',
            'reminders.*.id' => 'nullable|integer',
            'reminders.*.minutes_before' => 'integer|min:5',
            'reminders.*.reminder_type' => 'string|in:notification,email,sms',
        ]);

        $reminders = $validated['reminders'] ?? [];
        unset($validated['reminders']);
        $validated['is_all_day'] = $request->boolean('is_all_day', false);

        $this->service->updateEvent($event, $validated);

        // Sync reminders (delete old, create new)
        $event->reminders()->delete();
        foreach ($reminders as $reminder) {
            $this->service->createReminder($event, $reminder['minutes_before'], $reminder['reminder_type']);
        }

        return redirect()->route('calendar.index');
    }

    public function destroy(int $id)
    {
        $event = $this->repository->findByIdAndUser($id, auth()->id());

        if (! $event) {
            abort(404);
        }

        $this->service->deleteEvent($event);

        return redirect()->route('calendar.index');
    }

    public function overview(Request $request): Response
    {
        $startDate = $request->input('start_date', date('Y-m-01'));
        $endDate = $request->input('end_date', date('Y-m-t'));

        $overview = $this->service->getCalendarOverview(auth()->id(), $startDate, $endDate);

        return Inertia::render('Calendar/Overview', [
            'overview' => $overview,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}
