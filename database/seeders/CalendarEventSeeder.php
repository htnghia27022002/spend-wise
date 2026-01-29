<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Calendar\CalendarEvent;
use App\Models\Calendar\CalendarReminder;
use App\Models\User;
use Illuminate\Database\Seeder;

final class CalendarEventSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            return;
        }

        $events = [
            [
                'title' => 'Netflix Subscription Due',
                'description' => 'Monthly Netflix subscription payment',
                'type' => 'subscription_due',
                'color' => 'blue',
                'start_date' => now()->addDays(5),
            ],
            [
                'title' => 'Electricity Bill Payment',
                'description' => 'Monthly electricity bill',
                'type' => 'payment_due',
                'color' => 'red',
                'start_date' => now()->addDays(10),
            ],
            [
                'title' => 'Laptop Installment Payment',
                'description' => 'Second installment for laptop purchase',
                'type' => 'installment_due',
                'color' => 'yellow',
                'start_date' => now()->addDays(15),
            ],
            [
                'title' => 'Team Meeting',
                'description' => 'Monthly team sync meeting',
                'type' => 'reminder',
                'color' => 'purple',
                'start_date' => now()->addDays(3),
                'is_all_day' => false,
            ],
            [
                'title' => 'Project Deadline',
                'description' => 'Complete project deliverables',
                'type' => 'custom',
                'color' => 'green',
                'start_date' => now()->addDays(20),
            ],
        ];

        foreach ($events as $eventData) {
            $eventData['user_id'] = $user->id;
            $eventData['is_all_day'] = $eventData['is_all_day'] ?? true;

            $event = CalendarEvent::create($eventData);

            // Add sample reminders
            CalendarReminder::create([
                'calendar_event_id' => $event->id,
                'minutes_before' => 1440, // 1 day before
                'reminder_type' => 'notification',
            ]);

            CalendarReminder::create([
                'calendar_event_id' => $event->id,
                'minutes_before' => 60, // 1 hour before
                'reminder_type' => 'email',
            ]);
        }
    }
}
